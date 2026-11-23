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

const mes = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Formato AAAA-MM');

// Trayectoria (HU-05): src/content/experiencia.yaml. Alimenta /experiencia/ y el CV en PDF.
const experiencia = defineCollection({
  loader: file('src/content/experiencia.yaml'),
  schema: z.object({
    order: z.number().int(),
    company: z.string().min(1),
    start: mes,
    /** Sin fin: trabajo actual. */
    end: mes.optional(),
    role: texto,
    location: texto,
    achievements: z.array(texto).min(2).max(4),
  }),
});

const formacion = defineCollection({
  loader: file('src/content/formacion.yaml'),
  schema: z.object({
    order: z.number().int(),
    years: z.string().min(1),
    institution: z.string().min(1),
    degree: texto,
    detail: texto.optional(),
  }),
});

const certificaciones = defineCollection({
  loader: file('src/content/certificaciones.yaml'),
  schema: z.object({
    order: z.number().int(),
    name: z.union([z.string().min(1), texto]),
    platform: z.string().min(1),
    date: mes,
  }),
});

// Servicios (HU-06): src/content/servicios.yaml. Cada ejemplo enlaza un proyecto real.
const servicios = defineCollection({
  loader: file('src/content/servicios.yaml'),
  schema: z.object({
    order: z.number().int(),
    title: texto,
    summary: texto,
    includes: z.array(texto).min(3).max(5),
    example: z.object({
      name: z.union([z.string().min(1), texto]),
      /** Ruta sin prefijo de idioma, p. ej. /proyectos/sca/ o /proyectos/#cconet. */
      path: z.string().regex(/^\/proyectos\//),
      note: texto,
    }),
  }),
});

export const collections = { proyectos, casos, experiencia, formacion, certificaciones, servicios };
