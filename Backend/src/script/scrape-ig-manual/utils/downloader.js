import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

export const delay = (time) => new Promise(resolve => setTimeout(resolve, time))

export const downloadImage = async (url, filepath) => {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))
}

export const downloadVideoWithFetch = async (url, filepath) => {
    console.log(`🎬 Mendownload video: ${url.substring(0, 80)}...`)
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`)
    }
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength < 10000) {
        throw new Error(`File terlalu kecil (${buffer.byteLength} bytes), kemungkinan bukan video utuh`)
    }
    fs.writeFileSync(filepath, Buffer.from(buffer))
    const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2)
    console.log(`✅ Video berhasil disimpan: ${path.basename(filepath)} (${sizeMB} MB)`)
}