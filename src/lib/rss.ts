// Feed RSS del blog por idioma (HU-08, CA4): /blog/rss.xml, /pt/blog/rss.xml y /en/blog/rss.xml.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { ui, type Lang } from '../i18n/ui';
import { localizePath } from '../i18n/utils';
import { postPath, postsOf } from './blog-data';

export async function blogFeed(context: APIContext, lang: Lang) {
  const posts = await postsOf(lang);
  return rss({
    title: ui[lang]['blog.rss.title'],
    description: ui[lang]['blog.lead'],
    site: new URL(localizePath('/blog/', lang), context.site).href,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: new URL(postPath(post, lang), context.site).href,
    })),
    customData: `<language>${lang}</language>`,
  });
}
