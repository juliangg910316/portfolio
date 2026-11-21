import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categories } from './lib/projects';

const texto = z.object({ es: z.string().min(1), pt: z.string().min(1), en: z.string().min(1) });

// Datos de las tarjetas de proyecto (HU-03). El id de cada entrada es el slug del caso de estudio.
// Contenido real: CV, notas del vault y el portafolio de Google Sites. Nunca usar "Lanetalk".
const proyectos = defineCollection({
  loader: file('src/content/proyectos.yaml'),
  schema: z.object({
    name: z.union([z.string().min(1), texto]),
    order: z.number().int(),
    featured: z.boolean(),
    category: z.enum(categories),
    kind: texto,
    summary: texto,
    stack: z.array(z.string()).min(1).max(5),
    internal: z.boolean().default(false),
    inDevelopment: z.boolean().default(false),
    fullStack: z.boolean().default(false),
    /** Enlaces externos del caso de estudio (HU-04). */
    links: z
      .array(
        z.object({
          type: z.enum(['repo', 'web', 'store']),
          url: z.url(),
          /** Nombre de la tienda, para el texto del enlace («Ver en Apklis»). */
          store: z.string().optional(),
        }),
      )
      .default([]),
  })
  .refine((p) => !(p.internal && p.links.some((l) => l.type === 'store')), {
    message: 'Las apps internas no pueden enlazar a tiendas',
  }),
});

// Casos de estudio (HU-04): src/content/casos/<idioma>/<slug>.md, con las 6 secciones como «##».
const casos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/casos' }),
  schema: z.object({}),
});

export const collections = { proyectos, casos };
