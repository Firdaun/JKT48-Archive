import fs from 'fs'
import { delay } from '../utils/downloader.js'
export const handleLoginAndCookies = async (page, browser, cookiesPath) => {
    if (fs.existsSync(cookiesPath)) {
        console.log('Memuat cookies sesi lama')
        const cookiesString = fs.readFileSync(cookiesPath)
        const cookies = JSON.parse(cookiesString)
        await browser.setCookie(...cookies)
    } else {
        console.log('Cookies tidak ditemukan. Silakan LOGIN MANUAL di browser yang terbuka dalam 60 detik!');
        await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' })
        await delay(60000)
        const cookies = await browser.cookies()
        fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2))
        console.log('✅ Login berhasil! Cookies disimpan.')
    }
}