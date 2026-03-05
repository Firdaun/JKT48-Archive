export const setupGraphQLInterceptor = (page, postDataCollector) => {
    page.on('response', async (response) => {
        const url = response.url();
        
        // Tangkap response API GraphQL Twitter khusus untuk TweetDetail
        if (url.includes('graphql') && url.includes('TweetDetail')) {
            try {
                const json = await response.json();
                const jsonString = JSON.stringify(json);
                
                // Cek apakah ada media di tweet ini
                if (jsonString.includes('media_url_https') || jsonString.includes('video_info')) {
                    
                    // 1. Ekstrak Caption
                    let caption = '';
                    const textMatch = jsonString.match(/"full_text":"(.*?)"/);
                    if (textMatch) caption = textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');

                    // 2. Ekstrak Tanggal
                    let postedAt = new Date();
                    const dateMatch = jsonString.match(/"created_at":"(.*?)"/);
                    if (dateMatch) postedAt = new Date(dateMatch[1]);

                    // 3. Ekstrak Link Gambar (JPG)
                    const imgUrls = [...jsonString.matchAll(/"media_url_https":"(https:\/\/pbs\.twimg\.com\/media\/.*?)"/g)]
                        .map(m => m[1] + '?format=jpg&name=large');

                    // 4. Ekstrak Link Video (MP4) menggunakan regex trik rahasia
                    const mp4Urls = [...jsonString.matchAll(/(https:\/\/video\.twimg\.com\/ext_tw_video\/[^"']+\.mp4)/g)]
                        .map(m => m[1]);

                    postDataCollector.push({
                        caption,
                        postedAt,
                        images: [...new Set(imgUrls)],
                        videos: [...new Set(mp4Urls)]
                    });
                }
            } catch (e) {
            }
        }
    });
}