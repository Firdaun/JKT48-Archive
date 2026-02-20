import puppeteer, { KnownDevices } from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Import Services & Utils
import { getMember, checkPostExists } from './services/db.js';
import { delay, isVideoCdnUrl, normalizeVideoUrl } from './utils/downloader.js';

// Import Modular Components
import { handleLoginAndCookies } from './modules/auth.js';
import { getPostLinksByScrolling } from './modules/scrolling.js';
import { getPostInfo } from './modules/extractInfo.js';
import { processCarousel } from './modules/carousel.js';

const TARGET_USERNAME = 'jkt48.fritzy.r';
const MEMBER_NICKNAME = 'fritzy';
const COOKIES_PATH = './cookies.json';
const SAVE_BASE_DIR = './public/photos';

export const scrapeInstagram = async () => {
    const member = await getMember(MEMBER_NICKNAME);
    if (!member) return console.log(`Member "${MEMBER_NICKNAME}" Tidak ditemukan!`);

    const saveDir = path.join(SAVE_BASE_DIR, member.nickname.toLowerCase());
    if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });

    const browser = await puppeteer.launch({ headless: false, args: ['--disable-notifications'] });

    // Objek State agar proses interseptor network bisa dibaca oleh module Carousel
    const captureState = {
        isCapturing: false,
        capturedVideoUrls: new Set(),
        videoUrlList: []
    };

    try {
        const page = await browser.newPage();
        await page.emulate(KnownDevices['iPhone 13']); // Menghilangkan pesan deprecated

        // 1. SETUP PUPPETEER INTERCEPTOR NETWORK
        page.on('response', async (response) => {
            if (!captureState.isCapturing) return;
            const url = response.url();
            
            if (isVideoCdnUrl(url)) {
                const normalized = normalizeVideoUrl(url);
                if (!captureState.capturedVideoUrls.has(normalized)) {
                    captureState.capturedVideoUrls.add(normalized);
                }
                return;
            }
            if (url.includes('/api/graphql') || url.includes('/api/v1/media/')) {
                try {
                    const text = await response.text();
                    let match;
                    const regex = /"video_url"\s*:\s*"([^"]+)"/g;
                    while ((match = regex.exec(text)) !== null) {
                        const vUrl = match[1].replace(/\\/g, '');
                        if (vUrl.startsWith('http')) captureState.capturedVideoUrls.add(vUrl);
                    }
                } catch { /* Abaikan response tak terbaca */ }
            }
        });

        // 2. HANDLE LOGIN
        await handleLoginAndCookies(page, browser, COOKIES_PATH);

        console.log(`🔍 Membuka profil @${TARGET_USERNAME}...`);
        await page.goto(`https://www.instagram.com/${TARGET_USERNAME}/`, { waitUntil: 'networkidle2' });
        await page.waitForSelector('._aagu', { timeout: 20000 });

        // 3. SCROLL & CARI POSTINGAN
        const postLinks = await getPostLinksByScrolling(page, 43);

        // 4. PROSES POSTINGAN
        for (const link of postLinks) {
            if (await checkPostExists(link)) {
                console.log(`✋ Postingan ${link} sudah ada. Skip.`);
                break;
            }

            console.log(`⬇️ Memproses Post: ${link}`);
            captureState.capturedVideoUrls.clear();
            captureState.isCapturing = true;
            
            await page.goto(link, { waitUntil: 'networkidle2' });
            
            try { await page.waitForSelector('article img', { timeout: 10000 }); } 
            catch { await page.waitForSelector('main img', { timeout: 10000 }); }

            await delay(3000);
            await page.evaluate(() => {
                document.querySelectorAll('video').forEach(v => { v.muted = true; v.play().catch(()=>{}); });
            });
            await delay(3000);
            
            captureState.isCapturing = false;
            captureState.videoUrlList = Array.from(captureState.capturedVideoUrls);

            // Ekstrak info postingan (Waktu & Caption)
            const postInfo = await getPostInfo(page);

            // Loop Carousel untuk download media
            await processCarousel(page, captureState, member, postInfo, saveDir, link);
        }

    } catch (e) {
        console.error("🔥 Error Session:", e);
    } finally {
        await browser.close();
        console.log("✅ Sesi pengecekan selesai.\n");
    }
};

scrapeInstagram();