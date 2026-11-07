import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';

function orderedYaml(path: string) {
  return file(path, {
    parser: (text) =>
      (parse(text) as Record<string, unknown>[]).map((entry, order) => ({ ...entry, order })),
  });
}

const tech = z.object({
  name: z.string(),
  icon: z.string(),
});

const order = z.number().int();

const experience = defineCollection({
  loader: orderedYaml('src/content/cv/experience.yml'),
  schema: z.object({
    order,
    title: z.string(),
    company: z.string(),
    description: z.string(),
    period: z.string(),
  }),
});

const education = defineCollection({
  loader: orderedYaml('src/content/cv/education.yml'),
  schema: z.object({
    order,
    title: z.string(),
    details: z.string().optional(),
    school: z.string(),
    period: z.string(),
  }),
});

const skills = defineCollection({
  loader: orderedYaml('src/content/cv/skills.yml'),
  schema: z.object({
    order,
    title: z.string(),
    items: z.array(tech),
  }),
});

const languages = defineCollection({
  loader: orderedYaml('src/content/cv/languages.yml'),
  schema: z.object({
    order,
    icon: z.string(),
    label: z.string(),
  }),
});

const projects = defineCollection({
  loader: orderedYaml('src/content/cv/projects.yml'),
  schema: z.object({
    order,
    title: z.string(),
    period: z.string(),
    description: z.string(),
    tech: z.array(tech),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: 'src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      cover: image(),
      coverAlt: z.string(),
      bibliography: z.array(z.url()).default([]),
    }),
});

export const collections = { experience, education, skills, languages, projects, blog };
