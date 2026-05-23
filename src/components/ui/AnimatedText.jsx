import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from '../../lib/gsap'

export default function AnimatedText({ 
  children, 
  animation = 'fadeUp', 
  delay = 0, 
  duration = 0.6,
  className = ''
}) {
  const ref = useRef(null)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // splitWords or splitChars with GSAP
  useEffect(() => {
    if (animation === 'fadeUp' || !ref.current || prefersReducedMotion) return
    
    const elements = ref.current.children
    
    const anim = gsap.fromTo(elements, 
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: duration,
        delay: delay,
        stagger: animation === 'splitWords' ? 0.08 : 0.03,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
        }
      }
    )

    return () => {
      if (anim.scrollTrigger) {
        anim.scrollTrigger.kill()
      }
      anim.kill()
    }
  }, [animation, delay, duration, prefersReducedMotion])

  if (animation === 'fadeUp') {
    return (
      <motion.span
        ref={ref}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ 
          duration: prefersReducedMotion ? 0 : duration, 
          delay: prefersReducedMotion ? 0 : delay, 
          ease: "easeOut" 
        }}
        style={{ display: 'inline-block' }}
      >
        {children}
      </motion.span>
    )
  }

  const content = typeof children === 'string' ? children : ''
  const items = animation === 'splitWords' ? content.split(' ') : content.split('')

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block' }}>
      {prefersReducedMotion ? (
        children
      ) : (
        items.map((item, index) => (
          <span 
            key={index} 
            style={{ 
              display: 'inline-block', 
              whiteSpace: animation === 'splitWords' ? 'normal' : 'pre' 
            }}
          >
            {item}{animation === 'splitWords' && index < items.length - 1 ? '\u00A0' : ''}
          </span>
        ))
      )}
    </span>
  )
}
