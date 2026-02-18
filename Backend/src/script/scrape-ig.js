import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { prismaClient } from '../application/database.js'
import { v4 as uuidv4 } from 'uuid'
import { execSync } from 'child_process'
const TARGET_USERNAME = 'jkt48.fritzy.r'
const MEMBER_NICKNAME = 'fritzy'
const COOKIES_PATH = './cookies.json'
const SAVE_BASE_DIR = './public/photos'

const delay = (time) => new Promise(resolve => setTimeout(resolve, time))

const downloadImage = async (url, filepath) => {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
}

const downloadVideo = (m3u8Url, filepath) => {
    console.log(`🎬Mendownload video via HLS: ${m3u8Url.substring(0, 80)}...`)
    try {
        execSync(
            `ffmpeg -y -i "${m3u8Url}" -c copy -bsf:a aac_adtstoasc "${filepath}"`,
            { stdio: 'pipe' }
        )
        console.log(`✅Video berhasil disimpan: ${path.basename(filepath)}`)
        return true
    } catch (err) {
        console.error(`❌ffmpeg gagal: ${err.message}`)
        return false
    }
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
            // '--start-maximized',
            '--disable-notifications'
        ]
    })

    try {

        const page = await browser.newPage()

        const cdpSession = await page.createCDPSession()
        await cdpSession.send('Network.enable')

        let capturedM3u8 = []

        cdpSession.on('Network.responseReceived', (event) => {
            const url = event.response.url
            if (url.includes('.m3u8') && !capturedM3u8.includes(url)) {
                capturedM3u8.push(url)
                console.log(`📡 Terdeteksi HLS stream: ...${url.slice(-60)}`)
            }
        })

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


        // -------------------------------------------------------------------------------------------------------
        console.log("🔄 Mulai scrolling untuk mencari postingan ke-43...")

        const uniqueLinks = new Set()
        let previousHeight = 0
        let scrollAttempts = 0
        const TARGET_INDEX = 43

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
        // -------------------------------------------------------------------------------------------------------



        // let postLinks = await page.evaluate(() => {
        //     const boxes = Array.from(document.querySelectorAll('._aagu'))
        //     return boxes.map(box => {
        //         const link = box.closest('a')
        //         return link ? link.href : null
        //     })
        //         .filter(href => href && href.includes('/p/'))
        //         .filter((currentUrl, index, urlList) => urlList.indexOf(currentUrl) === index)
        // })

        // if (postLinks.length >= 8) {
        //     postLinks = postLinks.slice(0, 8)
        // }

        // const targetPost = [1]

        // let postToProcess = postLinks.filter((_, index) => targetPost.includes(index))

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
                capturedM3u8 = []
                await page.goto(link, { waitUntil: 'networkidle2' })
                try {
                    await page.waitForSelector('article img', { timeout: 10000 })
                } catch {
                    await page.waitForSelector('main img', { timeout: 10000 })
                }

                await delay(3000)

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

                // if (caption.text === '') {
                //     console.error(`❌ FATAL ERROR: Caption tidak ditemukan di link: ${link}`)
                //     console.error("🛑 Program dihentikan paksa karena caption kosong.")

                //     console.log("📸 Menyimpan file debug 'debug-error-no-caption.html'...")
                //     const htmlContent = await page.content()
                //     fs.writeFileSync('debug-error-no-caption.html', htmlContent)

                //     return
                // }

                console.log(`✅ Caption ditemukan menggunakan: [ ${caption.source} ]`)
                console.log(`Isi captions: [ ${caption.text} ]`)

                let slideCounter = 0
                let hasNext = true
                const processedImages = new Set()

                while (hasNext) {

                    const slideInfo = await page.evaluate(() => {
                        const videoEl = document.querySelector('article video, main video')
                        const imgEl = document.querySelector('article img, main img')
                        return {
                            isVideo: !!videoEl,
                            imgSrc: imgEl && imgEl.src.startsWith('http') && imgEl.clientWidth > 300 ? imgEl.src : null
                        }
                    })

                    console.log(`📎 Slide ${slideCounter + 1} — tipe: ${slideInfo.isVideo ? '🎬 VIDEO' : '🖼️ GAMBAR'}`)
                    console.log(`   capturedM3u8 (${capturedM3u8.length} url): ${capturedM3u8.map(u => '...' + u.slice(-40)).join(' | ') || '(kosong)'}`)

                    let targetUrl = null
                    let extension = ''
                    let mediaTypeDB = 'IMAGE'
                    let isVideo = false

                    if (slideInfo.isVideo) {
                        isVideo = true
                        if (capturedM3u8.length === 0) {
                            console.log(`⏳ m3u8 belum tertangkap, menunggu 3 detik lagi...`)
                            await delay(3000)
                        }

                        const bestM3u8 = capturedM3u8.find(u => u.includes('high')) ||
                            capturedM3u8.find(u => u.includes('mid')) ||
                            capturedM3u8[capturedM3u8.length - 1]

                        if (bestM3u8) {
                            targetUrl = bestM3u8
                        } else {
                            const ogVideoUrl = await page.evaluate(() => {
                                return document.querySelector('meta[property="og:video"]')?.content || null
                            })

                            if (ogVideoUrl) {
                                console.log(`📡 Fallback: pakai og:video URL`)
                                targetUrl = ogVideoUrl
                            } else {
                                console.warn(`⚠️ Slide ${slideCounter + 1} adalah video tapi URL HLS tidak tertangkap. Slide di-skip.`)
                                process.exit(1)
                            }
                        }
                        extension = 'mp4'
                        mediaTypeDB = 'VIDEO'
                    } else if (slideInfo.imgSrc && !processedImages.has(slideInfo.imgSrc)) {
                        targetUrl = slideInfo.imgSrc
                        processedImages.add(slideInfo.imgSrc)
                        extension = 'jpg'
                        mediaTypeDB = 'IMAGE'
                    }

                    if (targetUrl) {
                        slideCounter++

                        if (!isVideo && slideCounter > 1) {
                            mediaTypeDB = 'CAROUSEL_ALBUM'
                        }
                        const fileId = `${String(slideCounter).padStart(2, '0')}_${uuidv4()}`
                        const fileName = `${postedAt.toISOString().split('T')[0]}_${fileId}.${extension}`
                        const filePath = path.join(saveDir, fileName)
                        const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`

                        let downloadSuccess = false
                        try {
                            if (isVideo) {
                                // downloadVideo return boolean, kita cek nilainya
                                const result = downloadVideo(targetUrl, filePath)
                                if (result) {
                                    downloadSuccess = true
                                } else {
                                    throw new Error("FFmpeg failed")
                                }
                            } else {
                                // downloadImage throw error kalau gagal
                                await downloadImage(targetUrl, filePath)
                                downloadSuccess = true
                            }
                        } catch (err) {
                            console.error(`❌ Gagal download slide ${slideCounter}: ${err.message}`)
                            downloadSuccess = false
                        }

                        if (downloadSuccess) {
                            try {
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
                                console.log(`✅ Saved ${mediaTypeDB} Slide ${slideCounter}: ${fileName}`)
                            } catch (dbErr) {
                                console.error(`❌ Gagal simpan DB: ${dbErr.message}`)
                            }
                        }
                    }

                    const nextButton = await page.$('button[aria-label="Next"]')

                    if (nextButton) {
                        await nextButton.click()

                        await delay(2500)
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