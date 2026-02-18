import puppeteer from 'puppeteer'
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

const downloadImage = async (url, filepath) => {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
}

const downloadVideoWithFetch = async (url, filepath) => {
    console.log(`🎬 Mendownload video: ${url.substring(0, 80)}...`)

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()

    if (buffer.byteLength < 10000) {
        throw new Error(`File terlalu kecil (${buffer.byteLength} bytes), kemungkinan bukan video utuh`)
    }

    fs.writeFileSync(filepath, Buffer.from(buffer))
    const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2)
    console.log(`✅ Video berhasil disimpan: ${path.basename(filepath)} (${sizeMB} MB)`)
}

const normalizeVideoUrl = (url) => {
    try {
        const u = new URL(url)
        u.searchParams.delete('bytestart')
        u.searchParams.delete('byteend')
        return u.toString()
    } catch {
        return url
    }
}

const isVideoCdnUrl = (url) => url.includes('/o1/v/t16/')

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

        const capturedVideoUrls = new Set()
        let isCapturing = false

        page.on('response', async (response) => {
            if (!isCapturing) return
            const url = response.url()
            if (isVideoCdnUrl(url)) {
                const normalized = normalizeVideoUrl(url)
                if (!capturedVideoUrls.has(normalized)) {
                    capturedVideoUrls.add(normalized)
                    console.log(`Tertangkap video URL: ...${normalized.slice(-70)}`)
                }
                return
            }
            const isApiUrl = url.includes('/api/graphql') ||
                url.includes('graphql/query') ||
                url.includes('/api/v1/media/')
            if (isApiUrl) {
                try {
                    const text = await response.text()
                    const videoUrlRegex = /"video_url"\s*:\s*"([^"]+)"/g
                    let match
                    while ((match = videoUrlRegex.exec(text)) !== null) {
                        const videoUrl = match[1].replace(/\\/g, '')
                        if (videoUrl.startsWith('http') && !capturedVideoUrls.has(videoUrl)) {
                            capturedVideoUrls.add(videoUrl)
                            console.log(`🎥 [API] Tertangkap: ...${videoUrl.slice(-70)}`)
                        }
                    }
                } catch {
                    // Response tidak bisa dibaca -- lewati saja
                }
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
                    .filter(href => href && (href.includes('/p/') || href.includes('/reel/')))
                    .filter((currentUrl, index, urlList) => urlList.indexOf(currentUrl) === index)
            })

            visibleLinks.forEach(link => uniqueLinks.add(link))
            console.log(`📄 Terdeteksi ${uniqueLinks.size}`)

            if (uniqueLinks.size > TARGET_INDEX) {
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
                capturedVideoUrls.clear()
                isCapturing = true
                await page.goto(link, { waitUntil: 'networkidle2' })
                try {
                    await page.waitForSelector('article img', { timeout: 10000 })
                } catch {
                    await page.waitForSelector('main img', { timeout: 10000 })
                }

                await delay(3000)

                await page.evaluate(() => {
                    document.querySelectorAll('video').forEach(v => {
                        v.muted = true
                        v.play().catch(() => {})
                    })
                })
                await delay(3000)

                isCapturing = false

                if (capturedVideoUrls.size === 0) {
                    console.log('⚠️  CDN dan API tidak menangkap URL, scan HTML...')
                    const fromHtml = await page.evaluate(() => {
                        const results = []
                        const allText = document.documentElement.innerHTML
                        const reField = /\"video_url\"\s*:\s*\"([^\"]+)\"/g
                        let m
                        while ((m = reField.exec(allText)) !== null) {
                            results.push(m[1].replace(/\\\\/g, ''))
                        }
                        const reMp4 = /https:\/\/[^"\s]*cdninstagram\.com[^"\s]*\.mp4[^"\s]*/g
                        while ((m = reMp4.exec(allText)) !== null) {
                            results.push(m[0].replace(/\\\\/g, ''))
                        }
                        return [...new Set(results)]
                    })
                    fromHtml.forEach(u => {
                        if (u.startsWith('http') && !capturedVideoUrls.has(u)) {
                            capturedVideoUrls.add(u)
                            console.log(`🎥 [HTML] Tertangkap: ...${u.slice(-70)}`)
                        }
                    })
                }

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

                const videoUrlList = Array.from(capturedVideoUrls)
                console.log(`Total video URL unik tertangkap: ${videoUrlList.length}`)
                videoUrlList.forEach((u, i) => console.log(`[${i}] ${u.substring(0, 100)}`))

                let slideCounter = 0
                let hasNext = true
                const processedImages = new Set()
                let videoUrlIndex = 0

                while (hasNext) {
                    const ignoreList = Array.from(processedImages)

                    const slideInfo = await page.evaluate((ignoreList) => {
                        const videoEl = document.querySelector('article video, main video')
                        const images = Array.from(document.querySelectorAll('article img, main img'))

                        const validImg = images.find(img =>
                            img.src.startsWith('http') &&
                            img.clientWidth > 300 &&
                            !ignoreList.includes(img.src)
                        )

                        return {
                            isVideo: !!videoEl,
                            imgSrc: validImg ? validImg.src : null
                        }
                    }, ignoreList)

                    console.log(`📎 Slide ${slideCounter + 1} — tipe: ${slideInfo.isVideo ? '🎬 VIDEO' : '🖼️ GAMBAR'}`)

                    let targetUrl = null
                    let extension = ''
                    let mediaTypeDB = 'IMAGE'
                    let isVideo = false

                    if (slideInfo.isVideo) {
                        isVideo = true

                        if (videoUrlIndex < videoUrlList.length) {
                            targetUrl = videoUrlList[videoUrlIndex]
                            videoUrlIndex++
                            console.log(`Memakai video URL index ${videoUrlIndex - 1} : ${targetUrl.substring(0, 80)}`)
                        } else {
                            console.error(`❌ Tidak ada URL video tersisa untuk slide ${slideCounter + 1}.`)
                            console.error(`Total tertangkap: ${videoUrlList.length}, sudah dipakai: ${videoUrlIndex}`)
                            process.exit(1)
                        }
                        extension = 'mp4'
                        mediaTypeDB = 'VIDEO'
                    } else if (slideInfo.imgSrc) {
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

                        try {
                            if (isVideo) {
                                await downloadVideoWithFetch(targetUrl, filePath)
                            } else {
                                await downloadImage(targetUrl, filePath)
                            }
                        } catch (err) {
                            console.error(`🛑 Menghentikan proses karena video gagal didownload.`)
                            process.exit(1)
                        }

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

                    const nextButton = await page.$('button[aria-label="Next"]')

                    if (nextButton) {
                        console.log(`🔄 Pindah ke slide berikutnya...`)
                        const isNextVideo = slideInfo.isVideo
                        if (isNextVideo) isCapturing = true
                        await nextButton.click()
                        await delay(3000)
                        if (isNextVideo) {
                            isCapturing = false
                            // Tambahkan URL baru (jika ada) yang masuk selama delay ke videoUrlList
                            capturedVideoUrls.forEach(u => {
                                if (!videoUrlList.includes(u)) {
                                    videoUrlList.push(u)
                                    console.log(`🎥 [Next] URL baru ditambahkan: ...${u.slice(-70)}`)
                                }
                            })
                        }
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