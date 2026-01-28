import puppeteer from 'puppeteer'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'

const API_URL = 'http://localhost:3000/api/admin/members'
const API_KEY = 'rahasia-negara-jkt48'
const SAVE_DIR = './public/kabesha'

if (!fs.existsSync(SAVE_DIR)) {
    fs.mkdirSync(SAVE_DIR, { recursive: true })
}

const downloadImage = async (url, filepath) => {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
}

(async () => {
    console.log('Bot is running...')

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    })
    const page = await browser.newPage()

    console.log('open the jkt48 website...')
    await page.goto('https://jkt48.com/member/list?lang=id', { waitUntil: 'networkidle2' })

    const members = await page.evaluate(() => {
        const cards = document.querySelectorAll('.entry-member')

        return Array.from(cards).map(card => {
            const imgElement = card.querySelector('img')

            const rawName = imgElement ? imgElement.alt : ''

            if (!rawName) {
                const pName = card.querySelector('.entry-member__name')
                if (pName) rawName = pName.innerText
            }

            let imageUrl = imgElement ? imgElement.src : null

            let name = rawName.replace('Anggota JKT48', '').trim()

            if (!imageUrl || !name) return null;

            return { name, imageUrl }
        })
    })

    console.log(`Finded ${members.length} members. Start processing...`)

    for (const member of members) {
        const cleanName = member.name.toLowerCase().replace(/ /g, '_')
        const fileName = `${cleanName}.jpg`
        const filepath = path.join(SAVE_DIR, fileName)

        try {
            await downloadImage(member.imageUrl, filepath)

            console.log(`photo saved: ${fileName}`)

            const payload = {
                name: member.name,
                nickname: cleanName,
                generation: 12
            }

            const apiResponse = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': API_KEY
                },
                body: JSON.stringify(payload)
            })

            if (apiResponse.status === 201) {
                console.log(`   🚀 Succes uploaded to Database!`);
            } else {
                const errorText = await apiResponse.text()
                console.log(`   ⚠️ failed upload DB: Status ${apiResponse.status} | ${errorText}`);
            }
        } catch (err) {
            console.error(`   ❌ Error: ${err.message}`);
        }
    }
    console.log('\n🎉 Done! All members have been downloaded and registered.')
    await browser.close()
})()