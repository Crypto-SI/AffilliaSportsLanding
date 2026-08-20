'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Container, Heading, Text, VStack, Input, Button, Alert, AlertIcon, InputGroup, InputLeftElement, Icon, Flex
} from '@chakra-ui/react'
import { FiLock, FiMail } from 'react-icons/fi'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { ADMIN_EMAIL, useAdminSession } from '@/lib/admin-auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useAdminSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already signed in as admin → straight to the dashboard
  useEffect(() => {
    if (!sessionLoading && session) router.replace('/admin/player-applications')
  }, [sessionLoading, session, router])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isSupabaseConfigured) {
      setError('Authentication is not configured. Contact support.')
      return
    }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError('This account is not authorized for admin access.')
      return
    }

    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setSubmitting(false)

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : signInError.message)
      return
    }
    // onAuthStateChange in useAdminSession picks this up and redirects
  }

  return (
    <Container maxW="container.sm" py={{ base: 12, md: 20 }}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg">Affillia Sports Admin</Heading>
          <Text mt={2} color="gray.500">Restricted area — authorized personnel only.</Text>
        </Box>

        <Box as="form" onSubmit={signIn} p={{ base: 6, md: 8 }} borderWidth={1} borderRadius="lg" boxShadow="sm">
          <VStack spacing={4} align="stretch">
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <InputGroup>
              <InputLeftElement pointerEvents="none"><Icon as={FiMail} color="gray.400" /></InputLeftElement>
              <Input
                type="email"
                required
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </InputGroup>

            <InputGroup>
              <InputLeftElement pointerEvents="none"><Icon as={FiLock} color="gray.400" /></InputLeftElement>
              <Input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </InputGroup>

            <Button type="submit" colorScheme="green" isLoading={submitting} loadingText="Signing in">
              Sign in
            </Button>
          </VStack>
        </Box>

        <Flex justify="center">
          <Text fontSize="sm" color="gray.400">
            Only the designated administrator account can access this area.
          </Text>
        </Flex>
      </VStack>
    </Container>
  )
}
