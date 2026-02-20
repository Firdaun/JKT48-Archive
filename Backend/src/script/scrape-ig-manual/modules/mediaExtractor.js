export const getMediaFromSlide = async (page, ignoreImgList, ignoreVideoList) => {
    return await page.evaluate((ignoredimg, ignoredVideos) => {
        const videoEls = Array.from(document.querySelectorAll('article video, main video'))
        const images = Array.from(document.querySelectorAll('article img, main img'))

        const validImg = images.find(img =>
            img.src.startsWith('http') &&
            img.clientWidth > 300 &&
            !ignoredimg.includes(img.src)
        )

        const validVideo = videoEls.find(v => 
            v.src && v.src.startsWith('http') && !ignoredVideos.includes(v.src)
        )

        if (validVideo) {
            return { isVideo: true, videoUrl: validVideo.src, imgSrc: null }
        }

        if (validImg) {
            return { isVideo: false, videoUrl: null, imgSrc: validImg.src }
        }

        const hasNewUnloadedVideo = videoEls.length > ignoredVideos.length

        return {
            isVideo: hasNewUnloadedVideo,
            videoUrl: null,
            imgSrc: null
        }
    }, ignoreImgList, ignoreVideoList)
}