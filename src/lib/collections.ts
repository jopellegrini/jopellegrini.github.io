import { getCollection, type CollectionEntry } from 'astro:content';

type OrderedCollection = 'experience' | 'education' | 'skills' | 'languages' | 'projects';

export async function getOrderedCollection<C extends OrderedCollection>(
  name: C,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(name);
  return entries.sort((a, b) => a.data.order - b.data.order);
}
