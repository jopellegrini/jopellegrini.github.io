import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { PARTIAL_DATE_PATTERN } from './lib/period';

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

const partialDate = z.coerce.string().regex(PARTIAL_DATE_PATTERN);

const period = {
  startDate: partialDate,
  endDate: partialDate.optional(),
};

function isValidPeriod({ startDate, endDate }: { startDate: string; endDate?: string }) {
  return !endDate || (endDate.length === startDate.length && endDate >= startDate);
}

const invalidPeriod = {
  message: 'endDate must use the same format as startDate and not be before it',
};

const experience = defineCollection({
  loader: orderedYaml('src/content/cv/experience.yml'),
  schema: z
    .object({
      order,
      title: z.string(),
      company: z.string(),
      description: z.string(),
      ...period,
    })
    .refine(isValidPeriod, invalidPeriod),
});

const education = defineCollection({
  loader: orderedYaml('src/content/cv/education.yml'),
  schema: z
    .object({
      order,
      title: z.string(),
      details: z.string().optional(),
      school: z.string(),
      ...period,
    })
    .refine(isValidPeriod, invalidPeriod),
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
  schema: z
    .object({
      order,
      title: z.string(),
      description: z.string(),
      tech: z.array(tech),
      ...period,
    })
    .refine(isValidPeriod, invalidPeriod),
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
