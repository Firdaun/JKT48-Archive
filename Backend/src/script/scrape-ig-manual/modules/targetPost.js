import { delay } from "../utils/downloader.js"

export const getPostLinksByScrolling = async (page, targetIndex) => {
    console.log(`🔄 Mulai scrolling untuk mencari postingan ke-${targetIndex}...`)
    const uniqueLinks = new Set()
    let previousHeight = 0
    let scrollAttempts = 0
    const TARGET_INDEX = 43
    while (uniqueLinks.size <= TARGET_INDEX) {
        const visibleLinks = await page.evaluate(() => {
            const boxes = Array.from(document.querySelectorAll('._aagu'))
            return boxes.map(box => {
                const link = box.closest('a')
                return link ? link.href : null
            })
                .filter(href => href && (href.includes('/p/') || href.includes('/reel/')))
                .filter((currentUrl, index, urlList) => urlList.indexOf(currentUrl) === index)
        })
        visibleLinks.forEach(link => uniqueLinks.add(link))
        console.log(`📄 Terdeteksi ${uniqueLinks.size}`)
        if (uniqueLinks.size > TARGET_INDEX) {
            console.log("Target postingan target sudah terlihat!")
            break
        }
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await delay(3000)
        const newHeight = await page.evaluate(() => document.body.scrollHeight)
        if (newHeight === previousHeight) {
            scrollAttempts++
            console.log(`scroll mentok (Percobaan ${scrollAttempts}/3)`)
            if (scrollAttempts >= 3) {
                break
            }
        } else {
            scrollAttempts = 0
            previousHeight = newHeight
        }
    }
    const allLinks = Array.from(uniqueLinks)
    let postLinks = []
    if (allLinks.length > TARGET_INDEX) {
        postLinks = allLinks.slice(TARGET_INDEX, TARGET_INDEX + 1)
        console.log(`Mengambil Postingan ke-: ${postLinks[0]}`);
    } else {
        console.error(`Gagal mencapai postingan ke-${targetIndex}. Cuma dapat ${allLinks.length} postingan.`)
        await browser.close()
        return
    }
}