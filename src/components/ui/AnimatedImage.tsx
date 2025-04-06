'use client'

import { Box } from '@chakra-ui/react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { CSSProperties } from 'react'

interface AnimatedImageProps {
  src: string
  alt: string
  delay?: number
  duration?: number
  once?: boolean
  threshold?: number
  effect?: 'fade' | 'zoom' | 'slide' | 'reveal'
  imageStyle?: CSSProperties
  priority?: boolean
  imageFill?: boolean
  width?: number
  height?: number
  quality?: number
  sizes?: string
  className?: string
  containerHeight?: string | number
}

export function AnimatedImage({
  src,
  alt,
  delay = 0,
  duration = 0.7,
  once = true,
  threshold = 0.3,
  effect = 'fade',
  imageStyle,
  priority = false,
  imageFill = false,
  width,
  height,
  quality,
  sizes,
  className,
  containerHeight
}: AnimatedImageProps) {
  
  const getAnimationProps = () => {
    switch (effect) {
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 1.2 },
          whileInView: { opacity: 1, scale: 1 },
          transition: { 
            duration, 
            delay,
            ease: [0.25, 0.1, 0.25, 1.0]
          }
        }
      case 'slide':
        return {
          initial: { opacity: 0, x: 40 },
          whileInView: { opacity: 1, x: 0 },
          transition: { 
            duration, 
            delay,
            ease: [0.25, 0.1, 0.25, 1.0]
          }
        }
      case 'reveal':
        return {
          initial: { clipPath: 'inset(0 100% 0 0)' },
          whileInView: { clipPath: 'inset(0 0% 0 0)' },
          transition: { 
            duration: duration * 1.2, 
            delay,
            ease: [0.25, 0.1, 0.25, 1.0]
          }
        }
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          transition: { 
            duration, 
            delay,
            ease: [0.25, 0.1, 0.25, 1.0]
          }
        }
    }
  }
  
  const animationProps = getAnimationProps()

  // Default height for the container when using fill
  const defaultHeight = imageFill && !containerHeight ? '300px' : containerHeight;

  return (
    <Box 
      position="relative" 
      overflow="hidden" 
      className={className}
      height={imageFill ? defaultHeight : 'auto'}
      width="100%"
    >
      <motion.div
        initial={animationProps.initial}
        whileInView={animationProps.whileInView}
        viewport={{ once, amount: threshold }}
        transition={animationProps.transition}
        style={{ height: '100%', width: '100%', position: 'relative' }}
      >
        <Image
          src={src}
          alt={alt}
          fill={imageFill}
          width={!imageFill ? width : undefined}
          height={!imageFill ? height : undefined}
          style={{ objectFit: 'cover', ...imageStyle }}
          quality={quality || 85}
          priority={priority}
          sizes={sizes}
        />
      </motion.div>
    </Box>
  )
} 