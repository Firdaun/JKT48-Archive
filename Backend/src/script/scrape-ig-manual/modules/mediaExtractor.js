export const getMediaFromSlide = async (page, ignoreList) => {
    return await page.evaluate((ignored) => {
        const videoEl = document.querySelector('article video, main video')
        const images = Array.from(document.querySelectorAll('article img, main img'))

        const validImg = images.find(img =>
            img.src.startsWith('http') &&
            img.clientWidth > 300 &&
            !ignored.includes(img.src)
        )

        return {
            isVideo: !!videoEl,
            imgSrc: validImg ? validImg.src : null
        }
    }, ignoreList)
}