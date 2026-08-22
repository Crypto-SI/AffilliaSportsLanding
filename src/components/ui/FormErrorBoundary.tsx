'use client'

import React from 'react'
import { Alert, AlertIcon, Box, AlertTitle, AlertDescription } from '@chakra-ui/react'

/**
 * Error boundary for the player application form. Keeps a crash inside the
 * modal from taking the whole page down.
 */
export class FormErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('PlayerApplicationForm Error:', error)
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PlayerApplicationForm Error Details:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Form Error</AlertTitle>
            <AlertDescription>
              Something went wrong with the application form. Please refresh the page and try again.
            </AlertDescription>
          </Box>
        </Alert>
      )
    }

    return this.props.children
  }
}
