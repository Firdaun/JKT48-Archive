import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { prismaClient } from '../application/database.js'
import { v4 as uuidv4 } from 'uuid'
const TARGET_USERNAME = 'jkt48.fritzy.r'
const MEMBER_NICKNAME = 'Fritzy'
const COOKIES_PATH = './cookies.json'
const SAVE_BASE_DIR = './public/photos'

const delay = (time) => new Promise(resolve => setTimeout(resolve, time))

const downloadImage = async (url, filepath) => {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
}

const scrapeInstagram = async () => {
    const member = await prismaClient.member.findFirst({
        where: { nickname: {equals: MEMBER_NICKNAME, mode: 'insensitive'}}
    })

    if (!member) {
        console.log(`Member "${MEMBER_NICKNAME}" Tidak ditemukan di database!`);
        return
    }

    const saveDir = path.join(SAVE_BASE_DIR, member.nickname.toLowerCase())
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true})
    }

    console.log(`Memulai Bot Instagram untuk: ${MEMBER_NICKNAME}`);

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications']
    })

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
        await page.screenshot({ path: 'debug-failed-load.png' })
        await browser.close()
        return
    }

    let postLinks = await page.evaluate(() => {
        const boxes = Array.from(document.querySelectorAll('._aagu'))
        return boxes.map(box => {
            const link = box.closest('a')
            return link ? link.href : null
        })
        .filter(href => href && href.includes('/p/'))
        .filter((value, index, self) => self.indexOf(value) === index) 
    })

    // if (postLinks.length > 0) {
    //     postLinks = postLinks.slice(0, 3)
    // }

    if (postLinks.length >= 12) {
        console.log("🎯 Mode Testing: Target spesifik postingan ke-3")
        
        postLinks = postLinks.slice(11, 12)
    } else {
        console.log("⚠️ Postingan kurang dari 3! Tidak bisa mengambil postingan ke-3.")
        postLinks = []
    }

    console.log(`📦 Ditemukan ${postLinks.length} postingan terbaru.`)
    console.log("📋 List Link:", postLinks)

    if (postLinks.length === 0) {
        console.log("⚠️ Tidak ada postingan yang bisa diambil. Bot berhenti.")
        await browser.close()
        return
    }

    for (const link of postLinks) {
        const existingPost = await prismaClient.photo.findFirst({
            where: { postUrl: link}
        })

        if (existingPost) {
            console.log(`✋ Postingan ${link} sudah ada. Stop scraping karena ini postingan lama.`)
            break; 
        }

        console.log(`⬇️ Memproses Post: ${link}`)

        try {
            await page.goto(link, { waitUntil: 'networkidle2'})
            try {
                await page.waitForSelector('article img', { timeout: 10000 }) 
            } catch {
                await page.waitForSelector('main img', { timeout: 10000 })
            }
            
            await delay(2000)

            // console.log("📸 CEKREK! Menyimpan struktur HTML postingan ke file...")
            // const htmlContent = await page.content()
            // fs.writeFileSync('debug-post.html', htmlContent)
            // await page.screenshot({ path: 'debug-post.png' })
            // console.log("✅ File 'debug-post.html' dan 'debug-post.png' berhasil dibuat!")
            // console.log("👉 Tolong kirim file 'debug-post.html' itu ke saya sekarang.")

            const postedAtString = await page.evaluate(() => {
                const timeEl = document.querySelector('time')
                return timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString()
            })
            const postedAt = new Date(postedAtString)

            const caption = await page.evaluate(() => {
                const extractQuote = (text) => {
                    const match = text.match(/: "([\s\S]+)"/) || text.match(/: “([\s\S]+)”/);
                    return match ? match[1] : null;
                };

                const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
                if (ogTitle) {
                    const extracted = extractQuote(ogTitle);
                    if (extracted) return extracted;
                }

                const metaDesc = document.querySelector('meta[name="description"]')?.content;
                if (metaDesc) {
                    const extracted = extractQuote(metaDesc);
                    if (extracted) return extracted;
                }

                try {
                    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                    for (const script of scripts) {
                        const json = JSON.parse(script.innerText);
                        if (json.caption) return json.caption;
                        if (json.headline) return json.headline;
                        if (Array.isArray(json) && json[0]?.caption) return json[0].caption;
                    }
                } catch (e) {}

                if (mainImg && mainImg.alt && !mainImg.alt.startsWith('May be')) {
                    return mainImg.alt;
                }

                return ''
            })

            console.log(`📝 Caption Ditemukan: "${caption}"`)

            if (!caption || caption.trim() === '') {
                console.error(`❌ ERROR: Caption kosong! Postingan ${link} DILEWATI.`)
                continue
            }

            let slideCounter = 0
            let hasNext = true
            const processedImages = new Set()

            while (hasNext) {
                const ignoreList = Array.from(processedImages)

                const imgSrc = await page.evaluate((ignoreList) => {
                    const images = Array.from(document.querySelectorAll('article img, main img'))
                    
                    const validImg = images.find(img => 
                        img.src.startsWith('http') && 
                        img.clientWidth > 300 && 
                        !ignoreList.includes(img.src)
                    )
                    
                    return validImg ? validImg.src : null
                }, ignoreList)
                
                if (imgSrc) {
                    processedImages.add(imgSrc)
                    slideCounter++

                    const fileId = uuidv4()
                    const fileName = `${postedAt.toISOString().split('T')[0]}_${fileId}.jpg`
                    const filePath = path.join(saveDir, fileName)
                    const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`

                    await downloadImage(imgSrc, filePath)

                    await prismaClient.photo.create({
                        data: {
                            srcUrl: dbUrl,
                            fileId: fileId,
                            caption: caption,
                            postUrl: link,
                            mediaType: slideCounter > 1 ? 'CAROUSEL_ALBUM' : 'IMAGE',
                            postedAt: postedAt,
                            memberId: member.id
                        }
                    })
                    console.log(`✅ Saved Slide ${slideCounter}: ${fileName}`)
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
        await delay(3000)
    }
    console.log('Proses selesai')
    await browser.close()
}
scrapeInstagram()