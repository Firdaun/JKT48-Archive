import { ApifyClient } from 'apify-client'
import { prismaClient } from '../application/database.js'
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'
import fetch from 'node-fetch'
import 'dotenv/config'

const TARGET_USERNAME = 'jkt48.fritzy.r';
const MEMBER_NICKNAME = 'fritzy';

const APIFY_TOKEN = process.env.APIFY_TOKEN
const SAVE_BASE_DIR = './public/photos';

const client = new ApifyClient({
    token: APIFY_TOKEN
})

const downloadFile = async (url, filepath) => {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Gagal download: ${response.statusText}`)
    }
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
}

export const runApifyScraper = async () => {
    console.log('Memulai Scrape Via Apify')

    const member = await prismaClient.member.findFirst({
        where: {
            nickname: {
                contains: MEMBER_NICKNAME,
                mode: 'insensitive'
            }
        }
    })

    if (!member) {
        return console.log('Member tidak ditemukan')
    }

    const saveDir = path.join(SAVE_BASE_DIR, member.nickname.toLowerCase())
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(
            saveDir,
            { recursive: true }
        )
    }

    const input = {
        "username": [TARGET_USERNAME],
        "resultsLimit": 8,
    }

    try {
        console.log("Mengirim perintah ke Apify...")
        const run = await client.actor('apify/instagram-post-scraper').call(input)
    
        console.log(`Selesai! mengambil data dari dataset ID: ${run.defaultDatasetId}`);
    
        const { items } = await client.dataset(run.defaultDatasetId).listItems()

        items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

        const targetIndices = [0, 4]

        const postsToProcess = items.filter((_, index) => targetIndices.includes(index))

        console.log(`🎯 Memproses ${postsToProcess.length} postingan pilihan (Index 0 & 4)...`)

        for (const post of postsToProcess) {
    
            const postUrl = post.url
            const caption = post.caption || ''
            const postedAt = new Date(post.timestamp)
    
            const exists = await prismaClient.photo.findFirst({
                where: {
                    postUrl
                }
            })
    
            if (exists) {
                console.log(`Skip (sudah ada): ${postUrl}`)
                continue
            }
    
            console.log(`Memperoses postingan: ${postUrl}`)
    
            let mediaToDownload = []
            const children = post.childPosts || post.children || post.images
            if (post.type === 'Sidecar' && children) {
                console.log(`Tipe: ${post.type}`)
                post.childPosts.forEach((child, index) => {
                    mediaToDownload.push({
                        url: child.type === 'Video' ? child.videoUrl : child.displayUrl,
                        isVideo: child.type === 'Video',
                        index: index + 1
                    })
                })
            } else {
                console.log(`Tipe: ${post.type}`);
                mediaToDownload.push({
                    url: post.type === 'Video' ? post.videoUrl : post.displayUrl,
                    isVideo: post.type === 'Video',
                    index: 1
                })
            }
    
            for (const media of mediaToDownload) {
                if (!media.url) {
                    console.log(`URL kosong pada slide ${media.index}, skip.`)
                    continue
                }
    
                if (media.isVideo && !media.url.includes('.mp4')) {
                    console.error(`Skip: Terdeteksi Video tapi URL bukan MP4`);
                    continue
                }
    
                const extension = media.isVideo ? 'mp4' : 'jpg';
                const fileId = `${String(media.index).padStart(2, '0')}_${uuidv4()}`;
                const fileName = `${postedAt.toISOString().split('T')[0]}_${fileId}.${extension}`;
                const filePath = path.join(saveDir, fileName);
                const dbUrl = `/photos/${member.nickname.toLowerCase()}/${fileName}`;
    
                let mediaTypeDB = 'IMAGE';
                if (media.isVideo) mediaTypeDB = 'VIDEO';
                else if (mediaToDownload.length > 1) mediaTypeDB = 'CAROUSEL_ALBUM';
    
                try {
                    console.log(`⏳ Downloading Slide ${media.index} (${media.isVideo ? 'VIDEO' : 'FOTO'})...`);
                    await downloadFile(media.url, filePath);
    
                    await prismaClient.photo.create({
                        data: {
                            srcUrl: dbUrl,
                            fileId: fileId,
                            caption: caption,
                            postUrl: postUrl,
                            mediaType: mediaTypeDB,
                            postedAt: postedAt,
                            memberId: member.id,
                            source: 'instagram'
                        }
                    });
                    console.log(`✅ Tersimpan: ${fileName}`);
                } catch (err) {
                    console.error(`❌ Gagal download: ${err.message}`);
                }
            }
        }
    } catch (error) {
        console.error("🔥 Error Apify:", error)
    }
}
runApifyScraper()