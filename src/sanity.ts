import {createClient, type SanityClient} from '@sanity/client'

export function getSanityClient(): SanityClient | null {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
  const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'
  if (!projectId) return null

  return createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    useCdn: true,
    perspective: 'published',
  })
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
