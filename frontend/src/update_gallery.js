import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';

const KABESHA_DIR = './public/kabesha'; 
const APP_FILE = './src/App.jsx';
const URL_PREFIX = '/kabesha/'; 

if (!existsSync(KABESHA_DIR)) {
    console.error(`❌ Error: Folder ${KABESHA_DIR} tidak ditemukan! Jalankan bot scraper dulu.`);
    process.exit(1);
}

console.log("📂 Membaca file gambar...");
const files = readdirSync(KABESHA_DIR).filter(file => {
    return file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png');
});

if (files.length === 0) {
    console.error("⚠️ Tidak ada gambar JPG/PNG di folder kabesha.");
    process.exit(1);
}

console.log(`✅ Ditemukan ${files.length} gambar.`);

const newArrayContent = files.map(file => {
    return `        { src: '${URL_PREFIX}${file}' }`;
}).join(',\n');

const newCodeBlock = `const photoProfile = [\n${newArrayContent}\n    ]`;

let appContent = '';
try {
    appContent = readFileSync(APP_FILE, 'utf-8');
} catch (err) {
    console.error("❌ Gagal membaca src/App.jsx. Pastikan path-nya benar.");
    process.exit(1);
}

const regexPattern = /const photoProfile = \[\s*([\s\S]*?)\s*\]/;

if (!regexPattern.test(appContent)) {
    console.error("❌ Gagal menemukan variabel 'const photoProfile' di dalam App.jsx.");
    console.log("   Pastikan tulisannya persis: const photoProfile = [ ... ]");
    process.exit(1);
}

const updatedAppContent = appContent.replace(regexPattern, newCodeBlock);

writeFileSync(APP_FILE, updatedAppContent, 'utf-8');

console.log("========================================");
console.log(`🎉 SUKSES! App.jsx telah diupdate dengan ${files.length} foto baru.`);
console.log("   Silakan cek website frontend kamu sekarang.");
console.log("========================================");