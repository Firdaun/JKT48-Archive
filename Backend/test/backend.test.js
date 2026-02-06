import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/main.js' // Import app yang tadi kita export

describe('Backend Diagnosa', () => {

    // TEST 1: Cek apakah API JSON jalan?
    it('GET /api/photos harus mengembalikan JSON data foto', async () => {
        const response = await request(app).get('/api/photos')
        
        console.log("📡 Status API:", response.status)
        console.log("📦 Tipe Data:", response.header['content-type'])

        // Harapannya: Status 200
        expect(response.status).toBe(200)
        
        // Harapannya: Mengembalikan JSON
        expect(response.header['content-type']).toContain('application/json')
        
        // Harapannya: Ada properti 'data' (array)
        expect(response.body).toHaveProperty('data')
        console.log("✅ Jumlah Foto di DB:", response.body.data.length)

        if (response.body.data.length > 0) {
            console.log("📸 Contoh URL Foto pertama:", response.body.data[0].srcUrl)
        }
    })

    // TEST 2: Cek apakah folder Static Image terbuka?
    it('GET /photos/... harus bisa diakses (Cek Static Serving)', async () => {
        // Kita ambil salah satu foto dari API dulu (kalau ada)
        const apiRes = await request(app).get('/api/photos')
        
        if (apiRes.body.data && apiRes.body.data.length > 0) {
            const firstPhotoUrl = apiRes.body.data[0].srcUrl // misal: /photos/fritzy/xxx.jpg
            
            console.log(`🔎 Mencoba akses file fisik di: ${firstPhotoUrl}`)
            
            const imgRes = await request(app).get(firstPhotoUrl)
            
            console.log("📡 Status File Gambar:", imgRes.status)
            console.log("📦 Tipe Data Gambar:", imgRes.header['content-type'])

            // Harapannya: Status 200 (Ketemu)
            expect(imgRes.status).toBe(200)
            
            // Harapannya: Tipe konten adalah gambar (image/jpeg dll)
            expect(imgRes.header['content-type']).toContain('image')
        } else {
            console.warn("⚠️ SKIP Test Gambar: Database kosong, tidak ada sampel foto untuk ditest.")
        }
    })
    
    // TEST 3: Cek apakah Admin Route tabrakan?
    it('GET /api/photos tidak boleh bentrok dengan Admin', async () => {
        const response = await request(app).get('/api/photos')
        expect(response.status).not.toBe(404)
        expect(response.status).not.toBe(401) // Gak boleh Unauthorized (karena ini public)
    })
})