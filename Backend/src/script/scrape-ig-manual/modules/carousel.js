import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { downloadImage, downloadVideoWithFetch, delay } from '../utils/downloader.js'
import { saveMedia } from '../services/db.js'
import { getMediaFromSlide } from './mediaExtractor.js'

export const processCarousel = async (page, member, postInfo, saveDir, link) => {
    let slideCounter = 0
    let hasNext = true
    const processedImages = new Set()
    const processedVideos = new Set()

    while (hasNext) {
        const ignoreImgList = Array.from(processedImages)
        const ignoreVideoList = Array.from(processedVideos)
        let slideInfo = await getMediaFromSlide(page, ignoreImgList, ignoreVideoList)

        if (slideInfo.isVideo && !slideInfo.videoUrl) {
            console.log("⏳ Menunggu URL video termuat di HTML...")
            await delay(3000)
            slideInfo = await getMediaFromSlide(page, ignoreImgList, ignoreVideoList)
        }

        console.log(`📎 Slide ${slideCounter + 1} — tipe: ${slideInfo.isVideo ? '🎬 VIDEO' : '🖼️ GAMBAR'}`)

        let targetUrl = null
        let extension = ''
        let mediaTypeDB = 'IMAGE'
        let isVideo = false

        if (slideInfo.isVideo) {
            isVideo = true
            if (slideInfo.videoUrl) {
                targetUrl = slideInfo.videoUrl
                processedVideos.add(slideInfo.videoUrl)
            } else {
                console.error(`❌ URL video habis untuk slide ${slideCounter + 1}.`)
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
            if (!isVideo && slideCounter > 1) mediaTypeDB = 'CAROUSEL_ALBUM'

            const fileId = `${String(slideCounter).padStart(2, '0')}_${uuidv4()}`
            const fileName = `${postInfo.postedAt.toISOString().split('T')[0]}_${fileId}.${extension}`
            const filePath = path.join(saveDir, fileName)
            const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`

            try {
                if (isVideo) await downloadVideoWithFetch(targetUrl, filePath)
                else await downloadImage(targetUrl, filePath)

                await saveMedia({
                    dbUrl,
                    fileId,
                    caption: postInfo.caption,
                    postUrl: link,
                    mediaTypeDB,
                    postedAt: postInfo.postedAt,
                    memberId: member.id
                })
                console.log(`✅ Saved ${mediaTypeDB} Slide ${slideCounter}: ${fileName}`)
            } catch (err) {
                console.error(`❌ Gagal download/simpan DB: ${err.message}`)
                process.exit(1)
            }
        }

        const nextButton = await page.$('button[aria-label="Next"]')
        if (nextButton) {
            console.log(`🔄 Pindah ke slide berikutnya...`)
            await nextButton.click()
            await delay(2000)

            await page.evaluate(() => {
                document.querySelectorAll('video').forEach(v => { v.muted = true; v.play().catch(()=>{}) })
            })
            await delay(1000)
        } else {
            hasNext = false
        }
    }
}