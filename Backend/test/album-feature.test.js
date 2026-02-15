import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/main.js'

describe('Fitur Album & Grouping', () => {

    // 1. TEST MODE ALBUM (Harus Unik)
    it('GET harus mengembalikan 1 foto per postingan', async () => {
        const response = await request(app).get('/api/photos?mode=album&size=10')

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body).toHaveProperty('paging')

        const photos = response.body.data

        if (photos.length > 0) {
            // Cek apakah ada duplikat postUrl dalam satu halaman response
            // Logikanya: Jika backend benar pake 'distinct', maka jumlah item harus sama dengan jumlah Set(postUrl)
            const postUrls = photos.map(p => p.postUrl)
            const uniquePostUrls = new Set(postUrls)

            console.log(`📦 Mode Album: Ditemukan ${photos.length} item, Unik: ${uniquePostUrls.size}`)
            expect(postUrls.length).toBe(uniquePostUrls.size)
            
            // Cek apakah paging menghitung total item
            expect(response.body.paging.total_item).toBeGreaterThanOrEqual(0)
        } else {
            console.warn("⚠️ Database kosong, test distinct tidak bisa diverifikasi maksimal.")
        }
    })

    // 2. TEST DETAIL POSTINGAN (Isi Album)
    it('GET harus mengembalikan semua foto dalam postingan tersebut', async () => {
        // Step 1: Ambil dulu 1 album buat dapet contoh URL
        const albumRes = await request(app).get('/api/photos?mode=album&size=1')
        
        if (albumRes.body.data.length > 0) {
            const samplePostUrl = albumRes.body.data[0].postUrl
            console.log(`🔎 Testing Detail URL: ${samplePostUrl}`)

            // Step 2: Request detail postingan itu
            // PENTING: encodeURIComponent wajib karena URL mengandung karakter slashes (/)
            const detailRes = await request(app).get(`/api/photos?post_url=${encodeURIComponent(samplePostUrl)}`)

            expect(detailRes.status).toBe(200)
            const detailPhotos = detailRes.body.data

            console.log(`📸 Foto dalam album ini: ${detailPhotos.length} foto`)

            // Pastikan SEMUA foto yang dikembalikan punya postUrl yang SAMA dengan yang diminta
            detailPhotos.forEach(photo => {
                expect(photo.postUrl).toBe(samplePostUrl)
            })

        } else {
            console.warn("⚠️ Skip Test Detail: Tidak ada data album untuk ditest.")
        }
    })

    // 3. TEST VALIDASI MODE
    it('GET harus error 400 Bad Request', async () => {
        const response = await request(app).get('/api/photos?mode=ngawur')
        
        // Backend harus menolak value selain 'photo' atau 'album'
        expect(response.status).toBe(400) 
    })

    // 4. TEST FILTER DALAM MODE ALBUM
    it('GET instagram harus bisa difilter', async () => {
        const response = await request(app).get('/api/photos?mode=album&source=instagram')
        
        expect(response.status).toBe(200)
        if (response.body.data.length > 0) {
            response.body.data.forEach(item => {
                expect(item.source).toBe('instagram')
            })
        }
    })
})