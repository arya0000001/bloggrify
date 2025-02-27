import { serverQueryContent } from '#content/server'
import { Feed } from 'feed'
import {withLeadingSlash, withoutTrailingSlash} from 'ufo'

export default defineEventHandler(async (event) => {
    const config = useAppConfig()
    const runtimeConfig = useRuntimeConfig()
    const configUrl = runtimeConfig.public.url
    const url = withoutTrailingSlash(configUrl)

    const docs = await serverQueryContent(event)
        .where({ hidden: { $ne: true } })
        .sort({ date: -1 })
        .find()

    const now = new Date()

    const feed = new Feed({
        title: config.name,
        description: config.description,
        id: url,
        link: url,
        language: config.language,
        favicon: url + '/favicon.ico',
        copyright: `All rights reserved ${now.getFullYear()}, ${config.name}`,
        generator: 'bloggrify',
    })
    docs.forEach((post) => {
        const path = post._path
        if (post.date) {
            feed.addItem({
                title: post.title ?? '-',
                id: withoutTrailingSlash(url + path),
                link: withoutTrailingSlash(url + path),
                description: post.description,
                date: new Date(post.date),
                image: post.cover ? url + withLeadingSlash(post.cover) : undefined,
            })
        }
    })

    event.node.res.setHeader('content-type', 'text/xml')
    return feed.rss2()
})
