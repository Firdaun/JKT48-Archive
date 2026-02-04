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
    
    try {
        await page.waitForSelector('article', { timeout: 10000 }) 
    } catch (e) {
        console.log("⚠️ Tidak bisa menemukan grid foto. Mungkin login gagal atau profil private/salah.")
        // Screenshot buat debug kalau error lagi
        await page.screenshot({ path: 'debug-error.png' }) 
    }
    
    let postLinks = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href^="/p/"]'))
        return anchors.map(a => a.href)
    })

    postLinks = postLinks.slice(0, 3)

    console.log(`📦 Ditemukan ${postLinks.length} postingan terbaru.`)

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
            await delay(2000)

            const postedAtString = await page.evaluate(() => {
                const timeEl = document.querySelector('time')
                return timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString()
            })
            const postedAt = new Date(postedAtString)

            const caption = await page.evaluate(() => {
                const h1 = document.querySelector('h1')
                if (h1) return h1.innerText

                const span = document.querySelector('span._aacl._aaco._aacu._aacx._aad7._aade')
                return span ? span.innerText : ''
            })

            let slideCounter = 0
            let hasNext = true
            const processedImages = new Set()

            while (hasNext) {
                slideCounter++

                const imgSrc = await page.evaluate(() => {
                    const images = Array.from(document.querySelectorAll('article img'))
                    const validImg = images.find(img => img.src.startsWith('http') && img.clientWidth > 100)
                    return validImg ? validImg.src : null
                })

                if (imgSrc && !processedImages.has(imgSrc)) {
                    processedImages.add(imgSrc)

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
                            postUrl: link, // Key Grouping
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
                    await delay(1500) // Tunggu animasi geser
                } else {
                    hasNext = false // Tidak ada tombol next, selesai
                }
            }
        } catch (e) {
            console.error(`❌ Gagal scrape postingan ${link}: ${e.message}`)
        }
        await delay(3000)
    }
    console.log('🎉 Selesai! Semua update terbaru sudah didownload.')
    await browser.close()
}
scrapeInstagram()