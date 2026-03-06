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
    let postDataCollector = []

    try {
        const page = await browser.newPage()

        await handleLoginAndCookiesX(page, browser, COOKIES_PATH)

        console.log(`🔍 Membuka profil X @${TARGET_USERNAME}...`)
        await page.goto(`https://twitter.com/${TARGET_USERNAME}/media`, { waitUntil: 'domcontentloaded', timeout: 120000 })
        await delay(10000)

        const tweetLinks = await getTweetLinks(page, TARGET_POST_INDEX, POST_COUNT)

        setupGraphQLInterceptor(page, postDataCollector)

        for (const link of tweetLinks) {
            if (await checkPostExists(link)) {
                console.log(`✋ Tweet ${link} sudah ada di DB. Skip.`)
                continue
            }

            console.log(`⬇️ Membuka Tweet: ${link}`)
            postDataCollector.splice(0)

            const waitForGraphQL = page.waitForResponse(
                res => res.url().includes('TweetResultByRestId') && res.status() === 200,
                { timeout: 60000 }
            ).catch(() => console.log("⏳ Waktu tunggu GraphQL habis, mengecek sisa tangkapan..."))

            await page.goto(link, {
                waitUntil: 'domcontentloaded',
                timeout: 120000
            })

            await waitForGraphQL 
            
            await delay(2000)

            if (postDataCollector.length > 0) {
                const data = postDataCollector[0]
                console.log(`✅ Data GraphQL Tertangkap! Ditemukan ${data.images.length} Gambar dan ${data.videos.length} Video.`)

                console.log("\n================ ISI DATA GRAPHQL ================")
                console.log("📝 Caption :", data.caption)
                console.log("📅 Tanggal :", data.postedAt)
                console.log("📸 Link Gambar :", data.images)
                console.log("🎬 Link Video  :", data.videos)
                console.log("==================================================\n")

                const allMedia = [
                    ...data.images.map(url => ({
                        url,
                        ext: 'jpg',
                        type: data.images.length > 1 ? 'CAROUSEL_ALBUM' : 'IMAGE',
                        isVideo: false,
                    })),
                    ...data.videos.map(url => ({
                        url,
                        ext: 'mp4',
                        type: 'VIDEO',
                        isVideo: true
                    }))
                ]
                for (const [index, media] of allMedia.entries()) {
                    const slideCounter = index + 1
                    const fileId = `${String(slideCounter).padStart(2, '0')}_${uuidv4()}`
                    const fileName = `${data.postedAt.toISOString().split('T')[0]}_${fileId}.${media.ext}`
                    const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`

                    await downloadMedia(media.url, path.join(saveDir, fileName), media.isVideo)
                    await saveMedia({
                        dbUrl,
                        fileId,
                        postUrl: link,
                        memberId: member.id,
                        caption: data.caption,
                        postedAt: data.postedAt,
                        mediaTypeDB: media.type
                    })
                }
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