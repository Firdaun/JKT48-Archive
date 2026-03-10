import { delay } from "../utils/downloader.js"

export const getTweetLinks = async (page, target, count = null ) => {
    
    const isSpesific = Array.isArray(target)

    const maxIndex = isSpesific ? Math.max(...target) : target + count - 1
    console.log(`🔄 Mengumpulkan link tweet sampai index ke-${maxIndex}...`)
    const uniqueLinks = new Set()

    while (uniqueLinks.size <= maxIndex) {
        const visibleLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="/status/"]'))
            return links
                .map(a => a.href.split('/photo/')[0].split('/video/')[0])
                .filter(href => !href.includes('/analytics'))
        })
        
        visibleLinks.forEach(link => uniqueLinks.add(link))
        
        if (uniqueLinks.size > maxIndex) break
        
        await page.evaluate(() => window.scrollBy(0, 800))
        await delay(4000)
    }

    const allLinks = Array.from(uniqueLinks)
    if (isSpesific) {
        console.log(`🎯 [MODE SPESIFIK] Mengambil post di index: ${target.join(', ')}`)
        return target.map(index => allLinks[index]).filter(Boolean)
    } else {
        console.log(`🎯 [MODE RANGE] Mengambil ${count} post mulai dari index ke-${target}`)
        if (allLinks.length > target) {
            return allLinks.slice(target, target + count)
        }
        return []
    }
}