export const getPostInfo = async (page) => {
    const postedAtString = await page.evaluate(() => {
        const timeEl = document.querySelector('time')
        return timeEl ? timeEl.getAttribute('datetime') : null
    })
    if (!postedAtString) {
        console.error(`❌ FATAL ERROR: Elemen waktu (<time>) tidak ditemukan di link: ${link}`)

        console.log("📸 Menyimpan bukti error untuk debugging...")
        const htmlContent = await page.content()
        fs.writeFileSync('debug-error-time-missing.html', htmlContent)

        console.log("sesi di hentikan")
        return
    }
    const postedAt = new Date(postedAtString)
    const caption = await page.evaluate(() => {
        const extractQuote = (text) => {
            const match = text.match(/: "([\s\S]+)"/) || text.match(/: “([\s\S]+)”/)
            return match ? match[1] : null
        }

        const ogTitle = document.querySelector('meta[property="og:title"]')?.content
        if (ogTitle) {
            const extracted = extractQuote(ogTitle)
            if (extracted) {
                return { text: extracted, source: 'PLAN A (OG Title)' }
            }
        }

        const metaDesc = document.querySelector('meta[name="description"]')?.content
        if (metaDesc) {
            const extracted = extractQuote(metaDesc)
            if (extracted) {
                return { text: extracted, source: 'PLAN B (Meta Desc)' }
            }
        }

        return { text: '', source: 'TIDAK DITEMUKAN' }
    })

    console.log(`✅ Caption ditemukan menggunakan: [ ${caption.source} ]`)
    console.log(`Isi captions: [ ${caption.text} ]`)
    return { postedAt, caption: caption.text }
}