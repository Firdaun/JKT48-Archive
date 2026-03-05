import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { getMember, checkPostExists, saveMedia } from './services/db.js'
import { delay, downloadMedia } from './utils/downloader.js'
import { handleLoginAndCookiesX } from './modules/auth.js'
import { getTweetLinks } from './modules/targetPost.js'
import { setupGraphQLInterceptor } from './modules/extractInfo.js'

const TARGET_USERNAME = 'C_IndahJKT48'
const MEMBER_NICKNAME = 'indah'

const TARGET_POST_INDEX = 0
const POST_COUNT = 2

const COOKIES_PATH = './cookies-x.json'
const SAVE_BASE_DIR = './public/photos'

export const scrapeX = async () => {
    const member = await getMember(MEMBER_NICKNAME)
    if (!member) return console.log(`Member "${MEMBER_NICKNAME}" Tidak ditemukan!`)

    const saveDir = path.join(SAVE_BASE_DIR, member.nickname.toLowerCase())
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true })

    const browser = await puppeteer.launch({ headless: false, defaultViewport: null })
    let postDataCollector = [] // Wadah sementara untuk data dari GraphQL

    try {
        const page = await browser.newPage()
        await handleLoginAndCookiesX(page, browser, COOKIES_PATH)

        console.log(`🔍 Membuka profil X @${TARGET_USERNAME}...`)
        await page.goto(`https://twitter.com/${TARGET_USERNAME}/media`, { waitUntil: 'networkidle2', timeout: 60000 })
        await delay(3000)

        const tweetLinks = await getTweetLinks(page, TARGET_POST_INDEX, POST_COUNT)

        setupGraphQLInterceptor(page, postDataCollector)

        for (const link of tweetLinks) {
            if (await checkPostExists(link)) {
                console.log(`✋ Tweet ${link} sudah ada di DB. Skip.`)
                continue
            }

            console.log(`⬇️ Membuka Tweet: ${link}`)
            postDataCollector = [] // Kosongkan wadah sebelum buka link baru
            
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 })
            await delay(3000) // Tunggu API GraphQL selesai ditangkap

            if (postDataCollector.length > 0) {
                const data = postDataCollector[0]
                console.log(`✅ Data GraphQL Tertangkap! Ditemukan ${data.images.length} Gambar dan ${data.videos.length} Video.`)

                console.log("\n================ ISI DATA GRAPHQL ================")
                console.log("📝 Caption :", data.caption)
                console.log("📅 Tanggal :", data.postedAt)
                console.log("📸 Link Gambar :", data.images)
                console.log("🎬 Link Video  :", data.videos)
                console.log("==================================================\n")

                // let slideCounter = 0;
                
                // Proses Gambar
                // for (const imgUrl of data.images) {
                //     slideCounter++;
                //     const fileId = `${String(slideCounter).padStart(2, '0')}_${uuidv4()}`
                //     const fileName = `${data.postedAt.toISOString().split('T')[0]}_${fileId}.jpg`
                //     const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`
                    
                //     await downloadMedia(imgUrl, path.join(saveDir, fileName), false)
                //     await saveMedia({ dbUrl, fileId, caption: data.caption, postUrl: link, mediaTypeDB: data.images.length > 1 ? 'CAROUSEL_ALBUM' : 'IMAGE', postedAt: data.postedAt, memberId: member.id })
                // }

                // // Proses Video
                // for (const vidUrl of data.videos) {
                //     slideCounter++;
                //     const fileId = `${String(slideCounter).padStart(2, '0')}_${uuidv4()}`
                //     const fileName = `${data.postedAt.toISOString().split('T')[0]}_${fileId}.mp4`
                //     const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`
                    
                //     await downloadMedia(vidUrl, path.join(saveDir, fileName), true)
                //     await saveMedia({ dbUrl, fileId, caption: data.caption, postUrl: link, mediaTypeDB: 'VIDEO', postedAt: data.postedAt, memberId: member.id })
                // }
            } else {
                console.log("⚠️ Tidak ada media yang tertangkap dari GraphQL untuk tweet ini.")
            }
        }

    } catch (e) {
        console.error("🔥 Error Session:", e)
    } finally {
        await browser.close()
        console.log("✅ Sesi pengecekan X selesai.\n")
    }
}

scrapeX()