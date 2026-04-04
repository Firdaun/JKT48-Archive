import { delay } from "../utils/downloader.js"

export const getPostLinksByScrolling = async (page, target, count = 1) => {

    const isSpesific = Array.isArray(target)

    const maxIndex = isSpesific ? Math.max(...target) : target + count - 1

    console.log(`🔄 Mulai scrolling mencari postingan dari index ke-${target} sampai ${maxIndex}...`)

    const uniqueLinks = new Set()

    let previousHeight = 0
    let scrollAttempts = 0
    while (uniqueLinks.size <= maxIndex) {
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
        if (uniqueLinks.size > maxIndex) {
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