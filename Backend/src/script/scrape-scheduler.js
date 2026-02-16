import cron from 'node-cron'
import { scrapeInstagram } from './scrape-ig.js'
console.log('🚀 MONITOR INSTAGRAM DIMULAI')
console.log('🕒 Bot akan mengecek setiap 1 jam sekali.')

cron.schedule('*/15 * * * *', async () => {
    try {
        await scrapeInstagram()
    } catch (error) {
        console.error('Error Critical di Scheduler:',error)
    }
})
scrapeInstagram()