import puppeteer, { Target } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { prismaClient } from '../application/database.js'
import { v4 as uuidv4 } from 'uuid'
const TARGET_USERNAME = 'jkt48.fritzy.r'
const MEMBER_NICKNAME = 'fritzy'
const COOKIES_PATH = './cookies.json'
const SAVE_BASE_DIR = './public/photos'

const delay = (time) => new Promise(resolve => setTimeout(resolve, time))

const downloadFile = async (url, filepath) => {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
}

export const scrapeInstagram = async () => {
    const member = await prismaClient.member.findFirst({
        where: { nickname: { equals: MEMBER_NICKNAME, mode: 'insensitive' } }
    })

    if (!member) {
        console.log(`Member "${MEMBER_NICKNAME}" Tidak ditemukan di database!`);
        return
    }

    const saveDir = path.join(SAVE_BASE_DIR, member.nickname.toLowerCase())
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true })
    }

    console.log(`Memulai Bot Instagram untuk: ${MEMBER_NICKNAME}`);

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
            '--disable-notifications',
            // '--start-maximized'
        ]
    })

    try {

        const page = await browser.newPage()

        if (fs.existsSync(COOKIES_PATH)) {
            console.log('Memuat cookies sesi lama')
            const cookiesString = fs.readFileSync(COOKIES_PATH)
            const cookies = JSON.parse(cookiesString)
            await browser.setCookie(...cookies)
        } else {
            console.log('Cookies tidak ditemukan. Silakan LOGIN MANUAL di browser yang terbuka dalam 60 detik!');
            await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' })
            await delay(60000)
            const cookies = await browser.cookies()
            fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2))
            console.log('✅ Login berhasil! Cookies disimpan.')
        }

        console.log(`🔍 Membuka profil @${TARGET_USERNAME}...`)
        await page.goto(`https://www.instagram.com/${TARGET_USERNAME}/`, { waitUntil: 'networkidle2' })

        console.log("⏳ Menunggu grid foto muncul...")

        try {
            await page.waitForSelector('._aagu', { timeout: 20000 })
            console.log("✅ Grid foto terdeteksi!")
        } catch (e) {
            console.error("⚠️ Waktu habis! Postingan tidak muncul-muncul.")
            return
        }

        console.log("🔄 Mulai scrolling untuk mencari postingan ke-43...")

        const uniqueLinks = new Set()
        let previousHeight = 0
        let scrollAttempts = 0
        const TARGET_INDEX = 42

        while (uniqueLinks.size <= TARGET_INDEX) {
            const visibleLinks = await page.evaluate(() => {
                const boxes = Array.from(document.querySelectorAll('._aagu'))
                return boxes.map(box => {
                    const link = box.closest('a')
                    return link ? link.href : null
                })
                    .filter(href => href && href.includes('/p/') || href.includes('/reel/'))
                    .filter((currentUrl, index, urlList) => urlList.indexOf(currentUrl) === index)
            })

            visibleLinks.forEach(link => uniqueLinks.add(link))
            console.log(`📄 Terdeteksi ${uniqueLinks.size}`)

            if (uniqueLinks.length > TARGET_INDEX) {
                console.log("Target postingan target sudah terlihat!")
                break
            }

            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
            await delay(3000)

            const newHeight = await page.evaluate(() => document.body.scrollHeight)
            if (newHeight === previousHeight) {
                scrollAttempts++
                console.log(`scroll mentok (Percobaan ${scrollAttempts}/3)`)
                if (scrollAttempts >= 3) {
                    break
                }
            } else {
                scrollAttempts = 0
                previousHeight = newHeight
            }
        }

        const allLinks = Array.from(uniqueLinks)

        let postLinks = []

        if (allLinks.length > TARGET_INDEX) {
            postLinks = allLinks.slice(TARGET_INDEX, TARGET_INDEX + 1)
            console.log(`Mengambil Postingan ke-: ${postLinks[0]}`);
        } else {
            console.error(`Gagal mencapai postingan ke-43. Cuma dapat ${allLinks.length} postingan.`)
            await browser.close()
            return
        }

        console.log(`📦 Ditemukan ${postLinks.length} postingan terbaru.`)
        console.log("📋 List Link:", postLinks)

        if (postLinks.length === 0) {
            console.log("⚠️ Tidak ada postingan yang bisa diambil. Selector mungkin berubah.")
            const htmlContent = await page.content()
            const debugFileName = 'debug-error-layout.html'
            fs.writeFileSync(debugFileName, htmlContent)
            console.log(`💾 Source code halaman telah disimpan di file: ${debugFileName}`)
            console.log("👉 Silakan buka file tersebut di browser dan cek Inspect Element untuk melihat class terbarunya.")
            return
        }

        for (const link of postLinks) {
            const existingPost = await prismaClient.photo.findFirst({
                where: { postUrl: link }
            })

            if (existingPost) {
                console.log(`✋ Postingan ${link} sudah ada. Stop scraping karena ini postingan lama.`)
                break;
            }

            console.log(`⬇️ Memproses Post: ${link}`)

            try {
                await page.goto(link, { waitUntil: 'networkidle2' })
                const orderedMediaList = await page.evaluate(async (postUrl) => {
                    try {
                        const response = await fetch(`${postUrl}?__a=1&__d=dis`);
                        const json = await response.json();

                        const item = json.graphql?.shortcode_media || json.items?.[0];

                        if (!item) return null;

                        const results = [];

                        if (item.edge_sidecar_to_children) {
                            // KASUS CAROUSEL (Banyak Slide)
                            item.edge_sidecar_to_children.edges.forEach(edge => {
                                results.push({
                                    id: edge.node.id,
                                    isVideo: edge.node.is_video,
                                    // Instagram selalu menyediakan link .mp4 full di properti 'video_url'
                                    url: edge.node.is_video ? edge.node.video_url : edge.node.display_url
                                });
                            });
                        } else {
                            // KASUS SINGLE POST
                            results.push({
                                id: item.id,
                                isVideo: item.is_video,
                                url: item.is_video ? item.video_url : item.display_url
                            });
                        }
                        return results;
                    } catch (error) {
                        return null
                    }
                }, link)

                if (orderedMediaList) {
                    console.log(`✅ Metadata Professional berhasil diambil: ${orderedMediaList.length} slide terdeteksi.`);
                } else {
                    console.log("⚠️ Gagal ambil metadata JSON, menggunakan metode visual (kurang akurat untuk video).");
                }

                try {
                    await page.waitForSelector('article img, article video', { timeout: 10000 })
                } catch {
                    await page.waitForSelector('main img', { timeout: 10000 })
                }

                await delay(2000)

                const postedAtString = await page.evaluate(() => {
                    const timeEl = document.querySelector('time')
                    return timeEl ? timeEl.getAttribute('datetime') : null
                })

                if (!postedAtString) {
                    console.error(`❌ FATAL ERROR: Elemen waktu (<time>) tidak ditemukan di link: ${link}`)

                    console.log("📸 Menyimpan bukti error untuk debugging...")
                    const htmlContent = await page.content()
                    fs.writeFileSync('debug-error-time-missing.html', htmlContent)

                    console.log("sesi di hentikan")
                    return
                }

                const postedAt = new Date(postedAtString)

                const caption = await page.evaluate(() => {
                    const extractQuote = (text) => {
                        const match = text.match(/: "([\s\S]+)"/) || text.match(/: “([\s\S]+)”/);
                        return match ? match[1] : null;
                    };

                    const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
                    if (ogTitle) {
                        const extracted = extractQuote(ogTitle);
                        if (extracted) {
                            return { text: extracted, source: 'PLAN A (OG Title)' }
                        }
                    }

                    const metaDesc = document.querySelector('meta[name="description"]')?.content;
                    if (metaDesc) {
                        const extracted = extractQuote(metaDesc);
                        if (extracted) {
                            return { text: extracted, source: 'PLAN B (Meta Desc)' }
                        }
                    }

                    return { text: '', source: 'TIDAK DITEMUKAN' }
                })

                console.log(`✅ Caption ditemukan menggunakan: [ ${caption.source} ]`)
                console.log(`Isi captions: [ ${caption.text} ]`)

                let slideCounter = 0
                let hasNext = true
                const processedMedia = new Set()

                while (hasNext) {
                    slideCounter++
                    let downloadInfo = null

                    if (orderedMediaList && orderedMediaList[slideCounter - 1]) {
                        const mediaItem = orderedMediaList[slideCounter - 1];
                        downloadInfo = {
                            url: mediaItem.url,
                            isVideo: mediaItem.isVideo,
                            method: 'JSON_API'
                        };
                        console.log(`Slide ${slideCounter}: Menggunakan data JSON (${mediaItem.isVideo ? 'VIDEO' : 'FOTO'})`)
                    } else {
                        const visualData = await page.evaluate((ignoreList) => {
                            const images = Array.from(document.querySelectorAll('article img, main img'));
                            const validImg = images.find(img => img.src.startsWith('http') && img.clientWidth > 300 && !ignoreList.includes(img.src));

                            // Cek Video Element di DOM (Seringkali blob, jadi ini last resort)
                            const videoEl = document.querySelector('article video');
                            // Jika ada elemen video dan tombol play, anggap video
                            const isVideoVisual = !!videoEl || !!document.querySelector('svg[aria-label="Play"]');

                            if (validImg) return { src: validImg.src, isVideo: isVideoVisual };
                            return null;
                        }, Array.from(processedMedia));

                        if (visualData) {
                            downloadInfo = {
                                url: visualData.src, // Ini mungkin cuma thumbnail kalau video
                                isVideo: visualData.isVideo,
                                method: 'VISUAL_DOM'
                            };
                            console.log(`Slide ${slideCounter}: Menggunakan Visual DOM (Backup)`);
                        }
                    }

                    if (downloadInfo && downloadInfo.url) {
                        let extension = downloadInfo.isVideo ? 'mp4' : 'jpg';
                        let mediaTypeDB = slideCounter > 1 ? 'CAROUSEL_ALBUM' : (downloadInfo.isVideo ? 'VIDEO' : 'IMAGE');
                        if (slideCounter === 1 && downloadInfo.isVideo) mediaTypeDB = 'VIDEO';
                        if (!processedMedia.has(downloadInfo.url)) {
                            processedMedia.add(downloadInfo.url);
                            const fileId = `${String(slideCounter).padStart(2, '0')}_${uuidv4()}`
                            const fileName = `${postedAt.toISOString().split('T')[0]}_${fileId}.${extension}`
                            const filePath = path.join(saveDir, fileName)
                            const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`

                            try {
                                await downloadFile(downloadInfo.url, filePath)

                                await prismaClient.photo.create({
                                    data: {
                                        srcUrl: dbUrl,
                                        fileId: fileId,
                                        caption: caption.text,
                                        postUrl: link,
                                        mediaType: mediaTypeDB,
                                        postedAt: postedAt,
                                        memberId: member.id,
                                        source: 'instagram'
                                    }
                                })
                                console.log(`✅ Saved Slide ${slideCounter}: ${fileName}`)
                            } catch (err) {
                                console.error(`❌ Gagal save file: ${err.message}`)
                            }
                        }
                    } else {
                        console.log(`   ⚠️ Slide ${slideCounter} kosong atau gagal dideteksi.`)
                    }
                    const nextButton = await page.$('button[aria-label="Next"]')

                    if (nextButton) {
                        await nextButton.click()
                        await delay(2000)
                    } else {
                        hasNext = false
                    }
                }
            } catch (e) {
                console.error(`❌ Gagal scrape postingan ${link}: ${e.message}`)
            }
        }
    } catch (e) {
        console.error("🔥 Error Browser Session:", e)
    } finally {
        await browser.close()
        console.log("✅ Sesi pengecekan selesai.\n")
    }
}
scrapeInstagram()