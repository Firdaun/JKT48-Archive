export const setupGraphQLInterceptor = (page, postDataCollector) => {
    page.on('response', async (response) => {
        const url = response.url()

        if (url.includes('graphql') && (url.includes('TweetDetail') || url.includes('TweetResultByRestId'))) {
            if (response.request().method() === 'OPTIONS') return

            if (response.status() !== 200) return

            const contentType = response.headers()['content-type'] || ''
            if (!contentType.includes('application/json')) return
            try {
                const json = await response.json()
                const tweetResult = extractTweetResult(json)
                if (!tweetResult) return

                const legacy = tweetResult.legacy
                if (!legacy) return

                const hasMedia = legacy?.extended_entities?.media?.length > 0
                if (!hasMedia) return

                console.log(`📡 [API Tersadap] Tweet ditemukan: ${legacy.id_str}`)

                const noteText = tweetResult.note_tweet?.note_tweet_results?.result?.text

                const rawCaption = noteText || legacy.full_text || legacy.text || ''

                const caption = rawCaption.replace(/https:\/\/t\.co\/\w+/g, '').trim()

                const postedAt = legacy.created_at
                    ? new Date(legacy.created_at)
                    : new Date()

                const images = []
                const videos = []

                for (const media of legacy.extended_entities.media) {
                    if (media.type === 'photo') {
                        images.push(`${media.media_url_https}?format=jpg&name=large`)
                    } else if (media.type === 'video' || media.type === 'animated_gif') {
                        const variants = media.video_info?.variants || []
                        const best = variants
                            .filter(v => v.content_type === 'video/mp4')
                            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]
                        if (best?.url) videos.push(best.url)
                    }
                }

                if (images.length > 0 || videos.length > 0) {
                    postDataCollector.push({
                        caption,
                        postedAt,
                        images: [...new Set(images)],
                        videos: [...new Set(videos)]
                    })
                }
            } catch (e) {
                console.error(`❌ Gagal parse response dari ${url}:`, e.message)
            }
        }
    })
}

function extractTweetResult(json) {
    const byRestId = json?.data?.tweetResult?.result || json?.data?.tweetResultByRestId?.result
    if (byRestId?.legacy) return byRestId

    const instructions = json?.data?.threaded_conversation_with_injections_v2?.instructions || []
    for (const instruction of instructions) {
        for (const entry of instruction.entries || []) {
            const main = entry?.content?.itemContent?.tweet_results?.result
            if (main?.legacy) return main

            for (const item of entry?.content?.items || []) {
                const result = item?.item?.itemContent?.tweet_results?.result
                if (result?.legacy) return result
            }
        }
    }
    return null
}