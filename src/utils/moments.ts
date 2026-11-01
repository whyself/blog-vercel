import { getCollection, type CollectionEntry } from 'astro:content';

export type MomentEntry = CollectionEntry<'moments'>;

const momentListDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

export function formatMomentListDate(date: Date): string {
  return momentListDateFormatter.format(date);
}

export async function getPublishedMoments(): Promise<MomentEntry[]> {
  return getCollection('moments', ({ data }) => !data.draft);
}

export function sortMomentsByDateDesc(moments: MomentEntry[]): MomentEntry[] {
  return [...moments].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
