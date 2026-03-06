import fs from 'fs'
import { delay } from '../utils/downloader.js'

export const handleLoginAndCookiesX = async (page, browser, cookiesPath) => {
    if (fs.existsSync(cookiesPath)) {
        console.log('🍪 Memuat cookies sesi X lama...')
        const cookiesString = fs.readFileSync(cookiesPath)
        const cookies = JSON.parse(cookiesString)
        await browser.setCookie(...cookies)
    } else {
        console.log('⚠️ Cookies X tidak ditemukan. Silakan LOGIN MANUAL di browser dalam 60 detik!');
        await page.goto('https://twitter.com/i/flow/login', { waitUntil: 'domcontentloaded', timeout: 0 })
        await delay(60000)
        
        const cookies = await browser.cookies()
        fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2))
        console.log('✅ Login X berhasil! Cookies disimpan.')
    }
}