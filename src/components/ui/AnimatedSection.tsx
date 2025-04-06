'use client'

import { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Box } from '@chakra-ui/react'

interface AnimatedSectionProps {
  children: ReactNode
  delay?: number
  distance?: number
  duration?: number
  once?: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
  threshold?: number
  className?: string
}

export function AnimatedSection({ 
  children, 
  delay = 0,
  distance = 30,
  duration = 0.7,
  once = true,
  direction = 'up',
  threshold = 0.3,
  className
}: AnimatedSectionProps) {
  
  // Set initial animation properties based on direction
  const getInitialProps = () => {
    switch (direction) {
      case 'down':
        return { opacity: 0, y: -distance }
      case 'left':
        return { opacity: 0, x: distance }
      case 'right':
        return { opacity: 0, x: -distance }
      case 'up':
      default:
        return { opacity: 0, y: distance }
    }
  }
  
  // Get animate to properties (target state)
  const getAnimateProps = () => {
    switch (direction) {
      case 'down':
      case 'up':
        return { opacity: 1, y: 0 }
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 }
      default:
        return { opacity: 1 }
    }
  }

  return (
    <Box className={className}>
      <motion.div
        initial={getInitialProps()}
        whileInView={getAnimateProps()}
        viewport={{ once, amount: threshold }}
        transition={{ 
          duration, 
          delay,
          ease: [0.25, 0.1, 0.25, 1.0] // Smooth easing function
        }}
      >
        {children}
      </motion.div>
    </Box>
  )
} 