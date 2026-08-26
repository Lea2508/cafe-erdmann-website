import './styles/global.css'
import Lenis from 'lenis'
import {initMenus} from './menu'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function initSmoothScroll() {
  if (prefersReducedMotion()) return null

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  const raf = (time: number) => {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  return lenis
}

function initReveals() {
  const blocks = document.querySelectorAll<HTMLElement>('.reveal')
  if (!blocks.length) return

  if (prefersReducedMotion()) {
    blocks.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const reveal = (el: Element) => {
    // Wait until opacity:0 has painted, so above-the-fold blocks still animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('is-visible')
      })
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target)
          reveal(entry.target)
        }
      })
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )

  blocks.forEach((el) => observer.observe(el))
}

function initAnchorScroll(lenis: Lenis | null) {
  const scrollToTarget = (target: HTMLElement, updateHash = true) => {
    if (lenis) {
      lenis.scrollTo(target, { offset: 0 })
    } else {
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    }
    if (updateHash && target.id) {
      history.pushState(null, '', `#${target.id}`)
    }
  }

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: prefersReducedMotion() })
    } else {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      })
    }
  }

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]')
    if (!(link instanceof HTMLAnchorElement)) return

    const href = link.getAttribute('href')
    if (!href) return

    // Footer logo / home link: on Startseite zurück nach oben
    if (
      link.classList.contains('footer-brand') &&
      (href === '/' || href === '/index.html')
    ) {
      const path = window.location.pathname
      if (path === '/' || path === '/index.html' || path.endsWith('/index.html')) {
        event.preventDefault()
        history.pushState(null, '', '/')
        scrollToTop()
        return
      }
    }

    if (!href.startsWith('#') || href === '#') return

    const target = document.querySelector(href)
    if (!(target instanceof HTMLElement)) return

    event.preventDefault()
    scrollToTarget(target)
  })

  const hash = window.location.hash
  if (hash && hash.length > 1) {
    const target = document.querySelector(hash)
    if (target instanceof HTMLElement) {
      requestAnimationFrame(() => scrollToTarget(target, false))
    }
  }
}

function initCustomCursor() {
  const finePointerMq = window.matchMedia('(pointer: fine)')
  if (!finePointerMq.matches) return

  // DOM cursor: 15px coral dot, snap follow. Always the dot — never a hand.
  const cursor = document.createElement('div')
  cursor.className = 'site-cursor'
  cursor.setAttribute('aria-hidden', 'true')
  document.body.appendChild(cursor)
  document.documentElement.classList.add('has-custom-cursor')

  let visible = false

  const show = () => {
    if (visible) return
    visible = true
    cursor.classList.add('is-visible')
  }

  const hide = () => {
    if (!visible) return
    visible = false
    cursor.classList.remove('is-visible')
  }

  const move = (clientX: number, clientY: number) => {
    // Instant follow (zero lag)
    cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`
    show()
  }

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return
      move(event.clientX, event.clientY)
    },
    { passive: true },
  )

  document.addEventListener('mouseenter', show)
  document.addEventListener('mouseleave', hide)
  window.addEventListener('blur', hide)

  return () => {
    cursor.remove()
    document.documentElement.classList.remove('has-custom-cursor')
  }
}

function initReserveToggle() {
  document.querySelectorAll<HTMLDetailsElement>('details.reserve').forEach((el) => {
    const panel = el.querySelector('.reserve__panel')
    panel?.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('a')) return
      el.open = false
    })
  })
}

function initMobileLoopSlideshow() {
  const loops = document.querySelectorAll<HTMLElement>('.team-loop')
  if (!loops.length) return

  const mobileMq = window.matchMedia('(max-width: 720px)')
  const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const INTERVAL_MS = 1000

  type LoopState = {
    el: HTMLElement
    images: HTMLImageElement[]
    index: number
    timer: ReturnType<typeof setInterval> | null
  }

  const states: LoopState[] = Array.from(loops)
    .map((el) => {
      const firstGroup = el.querySelector('.team-loop__group')
      const images = firstGroup
        ? Array.from(firstGroup.querySelectorAll<HTMLImageElement>('img'))
        : []
      return { el, images, index: 0, timer: null }
    })
    .filter((state) => state.images.length > 0)

  if (!states.length) return

  const clearTimer = (state: LoopState) => {
    if (state.timer !== null) {
      clearInterval(state.timer)
      state.timer = null
    }
  }

  const setActive = (state: LoopState, index: number) => {
    state.index = index
    state.images.forEach((img, i) => {
      img.classList.toggle('is-active', i === index)
    })
  }

  const teardown = (state: LoopState) => {
    clearTimer(state)
    state.el.classList.remove('is-slideshow')
    state.images.forEach((img) => img.classList.remove('is-active'))
    state.index = 0
  }

  const sync = () => {
    const isMobile = mobileMq.matches
    const reduced = reducedMq.matches

    states.forEach((state) => {
      clearTimer(state)

      if (!isMobile) {
        teardown(state)
        return
      }

      state.el.classList.add('is-slideshow')
      setActive(state, state.index % state.images.length)

      if (reduced || state.images.length < 2) return

      state.timer = setInterval(() => {
        setActive(state, (state.index + 1) % state.images.length)
      }, INTERVAL_MS)
    })
  }

  sync()
  mobileMq.addEventListener('change', sync)
  reducedMq.addEventListener('change', sync)
}

const lenis = initSmoothScroll()
void initMenus()
initReveals()
initAnchorScroll(lenis)
initReserveToggle()
initCustomCursor()
initMobileLoopSlideshow()
