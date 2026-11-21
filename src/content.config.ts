import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
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
  }),
});

export const collections = { proyectos };
