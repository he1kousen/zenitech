import { motion } from 'framer-motion'

export default function AnimatedButton({ 
  children, 
  as = 'button', 
  className = '', 
  ...props 
}) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const Component = as === 'a' ? motion.a : motion.button

  return (
    <Component
      className={className}
      whileHover={prefersReducedMotion ? {} : { filter: 'brightness(1.08)' }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </Component>
  )
}
