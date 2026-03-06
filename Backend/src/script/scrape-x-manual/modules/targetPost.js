import { delay } from "../utils/downloader.js"

export const getTweetLinks = async (page, targetIndex, count) => {
    console.log(`🔄 Mengambil ${count} link tweet mulai dari index ke-${targetIndex}...`)
    const uniqueLinks = new Set()
    const endIndex = targetIndex + count - 1

    while (uniqueLinks.size <= endIndex) {
        const visibleLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="/status/"]'))
            return links
                .map(a => a.href.split('/photo/')[0].split('/video/')[0])
                .filter(href => !href.includes('/analytics'))
        })
        
        visibleLinks.forEach(link => uniqueLinks.add(link))
        
        if (uniqueLinks.size > endIndex) break;
        
        await page.evaluate(() => window.scrollBy(0, 800))
        await delay(4000)
    }

    const allLinks = Array.from(uniqueLinks)
    if (allLinks.length > targetIndex) {
        return allLinks.slice(targetIndex, targetIndex + count)
    }
    return []
}