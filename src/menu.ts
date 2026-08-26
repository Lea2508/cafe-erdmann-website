import {escapeHtml, getSanityClient} from './sanity'

export type RestaurantMenuDoc = {
  title?: string
  menus?: Array<{
    name?: string
    price?: number
    courses?: string[]
  }>
  categories?: Array<{
    name?: string
    items?: Array<{
      name?: string
      price?: number
    }>
  }>
  note?: string
}

export type BrunchMenuDoc = {
  title?: string
  lead?: string
  description?: string
  items?: Array<{
    text?: string
    note?: string
    price?: number
  }>
}

function renderRestaurant(doc: RestaurantMenuDoc): string {
  const parts: string[] = []

  for (const menu of doc.menus || []) {
    if (!menu?.name) continue
    const courses = (menu.courses || [])
      .filter(Boolean)
      .map((course) => `<li>${escapeHtml(course)}</li>`)
      .join('')
    parts.push(`
      <div class="menu-set reveal is-visible">
        <h3 class="menu-set__heading">${escapeHtml(menu.name)}${
          menu.price != null ? ` <span>${escapeHtml(String(menu.price))}</span>` : ''
        }</h3>
        <ul class="menu-set__list">${courses}</ul>
      </div>
    `)
  }

  for (const category of doc.categories || []) {
    if (!category?.name) continue
    const items = (category.items || [])
      .filter((item) => item?.name)
      .map(
        (item) => `
        <li>
          <span class="menu-list__name">${escapeHtml(item.name!)}</span>
          <span class="menu-list__price">${escapeHtml(String(item.price ?? ''))}</span>
        </li>`,
      )
      .join('')
    parts.push(`
      <div class="menu-group reveal is-visible">
        <h3 class="menu-group__heading">${escapeHtml(category.name)}</h3>
        <ul class="menu-list">${items}</ul>
      </div>
    `)
  }

  if (doc.note) {
    parts.push(`<p class="menu-note reveal is-visible">${escapeHtml(doc.note)}</p>`)
  }

  return parts.join('')
}

function renderBrunch(doc: BrunchMenuDoc): string {
  const parts: string[] = []

  if (doc.lead) {
    parts.push(
      `<p class="menu-note reveal is-visible">${escapeHtml(doc.lead)}</p>`,
    )
  }
  if (doc.description) {
    parts.push(
      `<p class="menu-note reveal is-visible">${escapeHtml(doc.description)}</p>`,
    )
  }

  const items = (doc.items || [])
    .filter((item) => item?.text)
    .map((item) => {
      const note = item.note
        ? `<br /><em>${escapeHtml(item.note)}</em>`
        : ''
      const price =
        item.price != null
          ? `<span class="menu-list__price">${escapeHtml(String(item.price))}</span>`
          : ''
      return `
        <li>
          <span class="menu-list__name">${escapeHtml(item.text!)}${note}</span>
          ${price}
        </li>`
    })
    .join('')

  parts.push(`
    <div class="menu-group reveal is-visible">
      <ul class="menu-list">${items}</ul>
    </div>
  `)

  return parts.join('')
}

async function loadRestaurantMenu(root: HTMLElement) {
  const client = getSanityClient()
  if (!client) return

  const doc = await client.fetch<RestaurantMenuDoc | null>(
    `*[_type == "restaurantMenu" && _id == "restaurantMenu"][0]{
      title, menus[]{name, price, courses}, categories[]{name, items[]{name, price}}, note
    }`,
  )
  if (!doc) return

  const titleEl = root.querySelector('.menu-section__title')
  const bodyHost =
    root.querySelector<HTMLElement>('[data-menu-body]') ||
    root.querySelector<HTMLElement>('.menu-section__inner')
  if (!bodyHost) return

  if (titleEl && doc.title) titleEl.textContent = doc.title

  const titleHtml = titleEl?.outerHTML || ''
  const rendered = renderRestaurant(doc)
  if (!rendered.trim()) return

  bodyHost.innerHTML = `${titleHtml}${rendered}`
}

async function loadBrunchMenu(root: HTMLElement) {
  const client = getSanityClient()
  if (!client) return

  const doc = await client.fetch<BrunchMenuDoc | null>(
    `*[_type == "brunchMenu" && _id == "brunchMenu"][0]{
      title, lead, description, items[]{text, note, price}
    }`,
  )
  if (!doc) return

  const titleEl = root.querySelector('.menu-section__title')
  const bodyHost =
    root.querySelector<HTMLElement>('[data-menu-body]') ||
    root.querySelector<HTMLElement>('.menu-section__inner')
  if (!bodyHost) return

  if (titleEl && doc.title) titleEl.textContent = doc.title

  const titleHtml = titleEl?.outerHTML || ''
  const rendered = renderBrunch(doc)
  if (!rendered.trim()) return

  bodyHost.innerHTML = `${titleHtml}${rendered}`
}

export async function initMenus() {
  const restaurant = document.querySelector<HTMLElement>('[data-menu="restaurant"]')
  const brunch = document.querySelector<HTMLElement>('[data-menu="brunch"]')

  try {
    if (restaurant) await loadRestaurantMenu(restaurant)
    if (brunch) await loadBrunchMenu(brunch)
  } catch (error) {
    // Keep static HTML fallback if Sanity is unreachable
    console.warn('Menü konnte nicht aus Sanity geladen werden – Fallback bleibt sichtbar.', error)
  }
}
