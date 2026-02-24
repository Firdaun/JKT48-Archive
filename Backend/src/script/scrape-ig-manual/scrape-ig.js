import puppeteer, { KnownDevices } from 'puppeteer'
import fs from 'fs'
import path from 'path'

import { getMember, checkPostExists } from './services/db.js'
import { delay } from './utils/downloader.js'

import { handleLoginAndCookies } from './modules/auth.js'
import { getPostLinksByScrolling } from './modules/targetPost.js'
import { getPostInfo } from './modules/extractInfo.js'
import { processCarousel } from './modules/carousel.js'

const TARGET_USERNAME = 'jkt48.christy'
const MEMBER_NICKNAME = 'christy'
const TARGET_POST_INDEX = 0
const POST_COUNT = 2
const COOKIES_PATH = './cookies.json'
const SAVE_BASE_DIR = './public/photos'

export const scrapeInstagram = async () => {
    const member = await getMember(MEMBER_NICKNAME)
    if (!member) return console.log(`Member "${MEMBER_NICKNAME}" Tidak ditemukan!`)

    const saveDir = path.join(SAVE_BASE_DIR, member.nickname.toLowerCase())
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true })

    const browser = await puppeteer.launch({ headless: false, args: ['--disable-notifications'] })

    try {
        const page = await browser.newPage()
        await page.emulate(KnownDevices['iPhone 13'])
        await handleLoginAndCookies(page, browser, COOKIES_PATH)

        console.log(`🔍 Membuka profil @${TARGET_USERNAME}...`)
        await page.goto(`https://www.instagram.com/${TARGET_USERNAME}/`, { waitUntil: 'networkidle2' })

        console.log("⏳ Mengecek popup 'Save login info'...")
        await delay(3000)
        
        const popupStatus = await page.evaluate(() => {
            const bodyText = document.body.innerText
            const isPopupExist = bodyText.includes('Save your login info') || bodyText.includes('Simpan info login')
            let isClosed = false

            const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'))
            const dismissBtn = buttons.find(b => 
                b.innerText && (b.innerText.includes('Not now') || b.innerText.includes('Lain kali'))
            )
            
            if (dismissBtn) {
                dismissBtn.click()
                isClosed = true
            } else {
                const closeIcon = document.querySelector('svg[aria-label="Close"], svg[aria-label="Tutup"]')
                if (closeIcon && closeIcon.closest('div[role="button"], button')) {
                    closeIcon.closest('div[role="button"], button').click()
                    isClosed = true
                }
            }
            return { isPopupExist, isClosed }
        })

        if (popupStatus.isPopupExist) {
            if (!popupStatus.isClosed) {
                console.error("❌ Popup 'Save login info' terdeteksi, tapi bot GAGAL menutupnya!")
                console.log("🛑 Menghentikan proses scrape untuk mencegah error lanjutan...")
                return
            } else {
                console.log("✅ Popup berhasil ditutup.")
            }
        } else {
            console.log("✅ Aman, tidak ada popup yang muncul.")
        }

        await delay(1000)
        await page.waitForSelector('._aagu', { timeout: 20000 })
        const postLinks = await getPostLinksByScrolling(page, TARGET_POST_INDEX, POST_COUNT)

        for (const link of postLinks) {
            if (await checkPostExists(link)) {
                console.log(`✋ Postingan ${link} sudah ada. Skip.`)
                break
            }
            console.log(`⬇️ Memproses Post: ${link}`)
            await page.goto(link, { waitUntil: 'networkidle2' })
            try { await page.waitForSelector('article img', { timeout: 10000 }) } 
            catch { await page.waitForSelector('main img', { timeout: 10000 }) }
            await delay(2000)
            await page.evaluate(() => {
                document.querySelectorAll('video').forEach(v => { v.muted = true; v.play().catch(()=>{}); })
            })
            await delay(3000)
            const postInfo = await getPostInfo(page)
            await processCarousel(page, member, postInfo, saveDir, link)
        }

    } catch (e) {
        console.error("🔥 Error Session:", e.message)
    } finally {
        await browser.close()
        console.log("✅ Sesi pengecekan selesai.\n")
    }
}

scrapeInstagram()