'use client'

import { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Text, TextProps } from '@chakra-ui/react'

interface AnimatedTextProps extends TextProps {
  children: ReactNode
  delay?: number
  staggerChildren?: boolean
  staggerDelay?: number
  duration?: number
  once?: boolean
  threshold?: number
}

export function AnimatedText({ 
  children, 
  delay = 0,
  staggerChildren = false,
  staggerDelay = 0.1,
  duration = 0.5,
  once = true,
  threshold = 0.3,
  ...props
}: AnimatedTextProps) {
  
  // If not staggering, just animate the whole text block
  if (!staggerChildren) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once, amount: threshold }}
        transition={{ 
          duration, 
          delay,
          ease: [0.25, 0.1, 0.25, 1.0]
        }}
      >
        <Text 
          as="div" 
          {...props}
          sx={{
            ...(props.sx || {}),
            fontFamily: props.as?.toString().startsWith('h') ? 'var(--font-alice), serif !important' : props.fontFamily,
            '& span, & div, & p': {
              fontFamily: 'inherit !important'
            }
          }}
        >
          {children}
        </Text>
      </motion.div>
    )
  }
  
  // For staggered text, handle it as a string and animate each word
  if (typeof children === 'string') {
    const words = children.split(' ')
    
    return (
      <Text 
        as="div" 
        {...props}
        sx={{
          ...(props.sx || {}),
          fontFamily: props.as?.toString().startsWith('h') ? 'var(--font-alice), serif !important' : props.fontFamily,
          letterSpacing: props.as?.toString().startsWith('h') ? '0.01em' : props.letterSpacing,
          wordSpacing: '0.1em',
          '& span, & div, & p': {
            fontFamily: 'inherit !important'
          }
        }}
      >
        {words.map((word, i) => (
          <motion.span
            key={word + i}
            style={{ 
              display: 'inline-block', 
              marginRight: '0.3em',
              whiteSpace: 'normal',
              fontFamily: 'inherit'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, amount: threshold }}
            transition={{ 
              duration, 
              delay: delay + (i * staggerDelay),
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
          >
            {word}
          </motion.span>
        ))}
      </Text>
    )
  }
  
  // Fallback for non-string children
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
    >
      <Text 
        as="div" 
        {...props}
        sx={{
          ...(props.sx || {}),
          fontFamily: props.as?.toString().startsWith('h') ? 'var(--font-alice), serif !important' : props.fontFamily,
          '& span, & div, & p': {
            fontFamily: 'inherit !important'
          }
        }}
      >
        {children}
      </Text>
    </motion.div>
  )
} 