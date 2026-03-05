import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

export const delay = (time) => new Promise(resolve => setTimeout(resolve, time))

export const downloadMedia = async (url, filepath, isVideo = false) => {
    console.log(`⬇️ Mendownload ${isVideo ? 'video' : 'gambar'}: ${path.basename(filepath)}...`)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`)
    }
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
    
    const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2)
    console.log(`✅ Berhasil disimpan: ${path.basename(filepath)} (${sizeMB} MB)`)
}