'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'

// Define the initial theme based on brand guidelines
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5f5f5',
      100: '#e2e2e2', // Swatch 6
      200: '#cccccc',
      300: '#b3b3b3',
      400: '#999999',
      500: '#2a2a2a', // Swatch 3 - Dark Grey
      600: '#111111', // Swatch 1 - Dark Black
      700: '#000000', // Swatch 4 - Pure Black
      900: '#000000',
    },
    neutral: {
      50: '#fcfcfc', // Swatch 2 - Off-white
      100: '#f9f9f9',
      200: '#e2e2e2', // Swatch 6 - Light Grey
      300: '#d3d3d3',
      400: '#b3b3b3',
      500: '#666666',
      600: '#2a2a2a', // Swatch 3 - Dark Grey
      800: '#111111', // Swatch 1 - Dark Black
      900: '#000000', // Swatch 4 - Pure Black
    },
    white: '#ffffff', // Swatch 5 - White
  },
  fonts: {
    heading: 'var(--font-alice), serif !important',
    body: 'var(--font-inter), sans-serif !important',
  },
  styles: {
    global: {
      'h1, h2, h3, h4, h5, h6': {
        fontFamily: 'var(--font-alice), serif !important',
      },
      'body': {
        fontFamily: 'var(--font-inter), sans-serif !important',
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '400',
        borderRadius: '4px',
        fontFamily: 'var(--font-alice), serif !important',
        textTransform: 'uppercase',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        outline: {
          borderColor: 'neutral.900',
          color: 'neutral.900',
          _hover: {
            bg: 'neutral.50',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'var(--font-alice), serif !important',
        fontWeight: '400',
      },
    },
    Text: {
      variants: {
        heading: {
          fontFamily: 'var(--font-alice), serif !important',
        }
      }
    }
  },
})

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>{children}</ChakraProvider>
  )
}
