import {escapeHtml, getSanityClient} from './sanity'

export type HoursLine = {
  days?: string
  hours?: string
}

export type OpeningHoursDoc = {
  cafe?: {lines?: HoursLine[]}
  restaurant?: {lines?: HoursLine[]}
  brunch?: {intro?: string; lines?: HoursLine[]}
}

type HoursSection = 'cafe' | 'restaurant' | 'brunch'

function formatHours(value: string): string {
  return escapeHtml(value).replace(/ Uhr$/, '&nbsp;Uhr')
}

function renderLines(lines: HoursLine[] | undefined): string {
  return (lines || [])
    .filter((line) => line?.days && line?.hours)
    .map(
      (line) =>
        `<li>${escapeHtml(line.days!)}: ${formatHours(line.hours!)}</li>`,
    )
    .join('')
}

function renderSummary(lines: HoursLine[] | undefined): string {
  return (lines || [])
    .filter((line) => line?.days && line?.hours)
    .map((line) => `${escapeHtml(line.days!)}: ${formatHours(line.hours!)}`)
    .join('<br />')
}

function applyList(section: HoursSection, lines: HoursLine[] | undefined) {
  const html = renderLines(lines)
  if (!html) return

  document.querySelectorAll<HTMLElement>(`[data-hours="${section}"]`).forEach((el) => {
    el.innerHTML = html
  })
}

function applySummary(section: HoursSection, lines: HoursLine[] | undefined) {
  const html = renderSummary(lines)
  if (!html) return

  document.querySelectorAll<HTMLElement>(`[data-hours-summary="${section}"]`).forEach((el) => {
    el.innerHTML = html
  })
}

export async function initHours() {
  const needsHours =
    document.querySelector('[data-hours]') ||
    document.querySelector('[data-hours-summary]') ||
    document.querySelector('[data-hours-intro]')
  if (!needsHours) return

  const client = getSanityClient()
  if (!client) return

  try {
    const doc = await client.fetch<OpeningHoursDoc | null>(
      `*[_type == "openingHours" && _id == "openingHours"][0]{
        cafe{lines[]{days, hours}},
        restaurant{lines[]{days, hours}},
        brunch{intro, lines[]{days, hours}}
      }`,
    )
    if (!doc) return

    applyList('cafe', doc.cafe?.lines)
    applyList('restaurant', doc.restaurant?.lines)
    applyList('brunch', doc.brunch?.lines)
    applySummary('cafe', doc.cafe?.lines)
    applySummary('restaurant', doc.restaurant?.lines)
    applySummary('brunch', doc.brunch?.lines)

    const intro = doc.brunch?.intro?.trim()
    if (intro) {
      document.querySelectorAll<HTMLElement>('[data-hours-intro="brunch"]').forEach((el) => {
        el.textContent = intro
      })
    }
  } catch (error) {
    console.warn(
      'Öffnungszeiten konnten nicht aus Sanity geladen werden – Fallback bleibt sichtbar.',
      error,
    )
  }
}
