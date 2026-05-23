import { useEffect } from 'react'
import gsap from '../lib/gsap'

export function useScrollAnimation(ref, options = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 })
      return
    }

    const {
      delay = 0,
      duration = 0.6,
      y = 40,
      opacity = 0,
      ease = 'power2.out',
      stagger = 0,
      start = 'top 85%'
    } = options

    gsap.set(el, { opacity, y })

    const anim = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
      stagger,
      scrollTrigger: {
        trigger: el,
        start,
      }
    })

    return () => {
      if (anim.scrollTrigger) {
        anim.scrollTrigger.kill()
      }
      anim.kill()
    }
  }, [ref, options])
}
