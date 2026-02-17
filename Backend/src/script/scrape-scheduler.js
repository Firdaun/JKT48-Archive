import cron from 'node-cron'
import { runApifyScraper } from './scrape-apify.js'
console.log('🚀 MONITOR INSTAGRAM DIMULAI')
console.log('🕒 Bot akan mengecek setiap 1 jam sekali.')

cron.schedule('* * * * *', async () => {
    try {
        await runApifyScraper()
    } catch (error) {
        console.error('Error Critical di Scheduler:',error)
    }
})
runApifyScraper()