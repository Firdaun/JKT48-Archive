import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { downloadImage, downloadVideoWithFetch, delay } from '../utils/downloader.js';
import { saveMedia } from '../services/db.js';
import { getMediaFromSlide } from './mediaExtractor.js';

export const processCarousel = async (page, captureState, member, postInfo, saveDir, link) => {
    let slideCounter = 0;
    let hasNext = true;
    const processedImages = new Set();
    let videoUrlIndex = 0;

    while (hasNext) {
        const ignoreList = Array.from(processedImages);
        const slideInfo = await getMediaFromSlide(page, ignoreList);

        console.log(`📎 Slide ${slideCounter + 1} — tipe: ${slideInfo.isVideo ? '🎬 VIDEO' : '🖼️ GAMBAR'}`);

        let targetUrl = null;
        let extension = '';
        let mediaTypeDB = 'IMAGE';
        let isVideo = false;

        if (slideInfo.isVideo) {
            isVideo = true;
            if (videoUrlIndex < captureState.videoUrlList.length) {
                targetUrl = captureState.videoUrlList[videoUrlIndex];
                videoUrlIndex++;
            } else {
                console.error(`❌ URL video habis untuk slide ${slideCounter + 1}.`);
                process.exit(1);
            }
            extension = 'mp4';
            mediaTypeDB = 'VIDEO';
        } else if (slideInfo.imgSrc) {
            targetUrl = slideInfo.imgSrc;
            processedImages.add(slideInfo.imgSrc);
            extension = 'jpg';
            mediaTypeDB = 'IMAGE';
        }

        if (targetUrl) {
            slideCounter++;
            if (!isVideo && slideCounter > 1) mediaTypeDB = 'CAROUSEL_ALBUM';

            const fileId = `${String(slideCounter).padStart(2, '0')}_${uuidv4()}`;
            const fileName = `${postInfo.postedAt.toISOString().split('T')[0]}_${fileId}.${extension}`;
            const filePath = path.join(saveDir, fileName);
            const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`;

            try {
                if (isVideo) await downloadVideoWithFetch(targetUrl, filePath);
                else await downloadImage(targetUrl, filePath);

                await saveMedia({
                    dbUrl,
                    fileId,
                    caption: postInfo.caption,
                    postUrl: link,
                    mediaTypeDB,
                    postedAt: postInfo.postedAt,
                    memberId: member.id
                });
                console.log(`✅ Saved ${mediaTypeDB} Slide ${slideCounter}: ${fileName}`);
            } catch (err) {
                console.error(`❌ Gagal download/simpan DB: ${err.message}`);
                process.exit(1);
            }
        }

        const nextButton = await page.$('button[aria-label="Next"]');
        if (nextButton) {
            console.log(`🔄 Pindah ke slide berikutnya...`);
            const isNextVideo = slideInfo.isVideo;
            if (isNextVideo) captureState.isCapturing = true;

            await nextButton.click();
            await delay(3000);

            if (isNextVideo) {
                captureState.isCapturing = false;
                captureState.capturedVideoUrls.forEach(u => {
                    if (!captureState.videoUrlList.includes(u)) {
                        captureState.videoUrlList.push(u);
                        console.log(`🎥 [Next] URL baru: ...${u.slice(-70)}`);
                    }
                });
            }
        } else {
            hasNext = false;
        }
    }
};