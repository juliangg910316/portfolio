// Acceso a la colección del blog (HU-08) desde páginas y feeds.
import { getCollection, type CollectionEntry } from 'astro:content';
import { languages, type Lang } from '../i18n/ui';
import { localizePath } from '../i18n/utils';
import { postSlug, postsForLang, readingTime } from './blog';

export type Post = CollectionEntry<'blog'>;

export const postsOf = async (lang: Lang) => postsForLang(await getCollection('blog'), lang);

export const postPath = (post: Post, lang: Lang) => localizePath(`/blog/${postSlug(post.id)}/`, lang);

export const postMinutes = (post: Post) => readingTime(post.body ?? '');

/** Rutas de las traducciones que existen de un artículo (mismo `translationKey`). */
export async function postTranslations(post: Post): Promise<Partial<Record<Lang, string>>> {
  const all = await getCollection('blog', (p) => p.data.translationKey === post.data.translationKey);
  return Object.fromEntries(
    (Object.keys(languages) as Lang[])
      .map((l) => [l, all.find((p) => p.id.startsWith(`${l}/`))] as const)
      .filter(([, p]) => p)
      .map(([l, p]) => [l, postPath(p!, l)]),
  );
}

/** getStaticPaths de /<lang>/blog/[slug]/. */
export async function blogPaths(lang: Lang) {
  return (await postsOf(lang)).map((post) => ({ params: { slug: postSlug(post.id) }, props: { post } }));
}
