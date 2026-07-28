import './styles/global.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HERO_BACKGROUNDS = [
  '/hero-table-bw.png',
  '/hero-sorbet.png',
  '/hero-olives-wine.png',
  '/hero-pasta-tray.png',
  '/hero-table-pasta.png',
  '/hero-fish.png',
] as const

const SLIDE_INTERVAL_MS = 5000
const SLIDE_TRANSITION_MS = 900
const SWIPE_THRESHOLD_PX = 48

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

function initHeroSlideshow() {
  const root = document.querySelector<HTMLElement>('.hero__slideshow')
  const hero = document.querySelector<HTMLElement>('.hero')
  if (!root || !hero) return

  const track = document.createElement('div')
  track.className = 'hero__slideshow-track'

  const realCount = HERO_BACKGROUNDS.length
  const slideUrls: string[] = [...HERO_BACKGROUNDS]
  if (!prefersReducedMotion && realCount > 1) {
    slideUrls.push(HERO_BACKGROUNDS[0])
  }

  for (const src of slideUrls) {
    const slide = document.createElement('div')
    slide.className = 'hero__slide'
    slide.style.backgroundImage = `url('${src}')`
    track.appendChild(slide)
  }

  root.appendChild(track)

  if (prefersReducedMotion || realCount < 2) return

  let index = 0
  let autoplayId = 0
  let locked = false
  let pointerStartX = 0
  let pointerStartY = 0
  let dragging = false

  const setTransition = (on: boolean) => {
    track.style.transition = on
      ? `transform ${SLIDE_TRANSITION_MS}ms ease-in-out`
      : 'none'
  }

  const applyTransform = () => {
    track.style.transform = `translate3d(-${index * 100}%, 0, 0)`
  }

  const scheduleAutoplay = () => {
    window.clearInterval(autoplayId)
    autoplayId = window.setInterval(() => goNext(false), SLIDE_INTERVAL_MS)
  }

  const goNext = (fromUser: boolean) => {
    if (locked) return
    if (fromUser) scheduleAutoplay()
    locked = true
    index += 1
    setTransition(true)
    applyTransform()
  }

  const goPrev = (fromUser: boolean) => {
    if (locked) return
    if (fromUser) scheduleAutoplay()

    if (index === 0) {
      setTransition(false)
      index = realCount
      applyTransform()
      requestAnimationFrame(() => {
        index -= 1
        setTransition(true)
        applyTransform()
        locked = true
      })
      return
    }

    locked = true
    index -= 1
    setTransition(true)
    applyTransform()
  }

  track.addEventListener('transitionend', () => {
    locked = false
    if (index < realCount) return
    setTransition(false)
    index = 0
    applyTransform()
  })

  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return
    dragging = true
    pointerStartX = e.clientX
    pointerStartY = e.clientY
    root.setPointerCapture(e.pointerId)
    root.classList.add('is-dragging')
  })

  root.addEventListener('pointerup', (e) => {
    if (!dragging) return
    dragging = false
    root.releasePointerCapture(e.pointerId)
    root.classList.remove('is-dragging')

    const dx = e.clientX - pointerStartX
    const dy = e.clientY - pointerStartY
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    if (Math.abs(dx) < Math.abs(dy)) return

    if (dx < 0) goNext(true)
    else goPrev(true)
  })

  root.addEventListener('pointercancel', () => {
    dragging = false
    root.classList.remove('is-dragging')
  })

  hero.addEventListener(
    'wheel',
    (e) => {
      const absX = Math.abs(e.deltaX)
      const absY = Math.abs(e.deltaY)
      if (absX < 15 && absY < 15) return

      if (absX >= absY) {
        e.preventDefault()
        if (e.deltaX > 0) goNext(true)
        else goPrev(true)
        return
      }

      if (e.shiftKey) {
        e.preventDefault()
        if (e.deltaY > 0) goNext(true)
        else goPrev(true)
      }
    },
    { passive: false },
  )

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goNext(true)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev(true)
    }
  })

  scheduleAutoplay()
}

function initSmoothScroll() {
  if (prefersReducedMotion) return null

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

function initReveals() {
  const blocks = document.querySelectorAll<HTMLElement>('.reveal')
  if (!blocks.length) return

  if (prefersReducedMotion) {
    blocks.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )

  blocks.forEach((el) => observer.observe(el))
}

function initHeroScrollPush() {
  if (prefersReducedMotion) return

  const hero = document.querySelector<HTMLElement>('.hero')
  const menu = document.querySelector<HTMLElement>('.menu-section')
  if (!hero || !menu) return

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    endTrigger: menu,
    end: 'top top',
    pin: true,
    pinSpacing: false,
    invalidateOnRefresh: true,
  })

  gsap.to(hero, {
    yPercent: -100,
    ease: 'none',
    scrollTrigger: {
      trigger: menu,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
    },
  })
}

initHeroSlideshow()
const lenis = initSmoothScroll()
initReveals()
initHeroScrollPush()

if (lenis) {
  ScrollTrigger.addEventListener('refresh', () => lenis.resize())
  ScrollTrigger.refresh()
}
