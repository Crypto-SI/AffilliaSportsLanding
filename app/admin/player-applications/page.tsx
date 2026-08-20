'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Container, Heading, Text, VStack, HStack, Button, Badge, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer, Spinner, Alert, AlertIcon, Select, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, IconButton, Tooltip
} from '@chakra-ui/react'
import { FiRefreshCw, FiLogOut, FiEye, FiDownload } from 'react-icons/fi'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAdminSession } from '@/lib/admin-auth'
import { calculatePlayerAge } from '@/lib/player-utils'
import type { PlayerApplication } from '@/lib/types'

// Shape of a player_applications row as returned by Supabase
interface AppRow {
  id: string
  name: string
  email: string
  phone?: string | null
  date_of_birth: string
  position?: string | null
  experience_level?: string | null
  application_notes?: string | null
  cv_file_path?: string | null
  cv_file_name?: string | null
  status: string
  created_at: string
}

type Row = AppRow & { age: number; isYouth: boolean }

const STATUS_COLORS: Record<string, string> = {
  pending: 'yellow', reviewing: 'blue', shortlisted: 'green',
  rejected: 'red', contacted: 'purple',
}

export default function AdminPlayerApplicationsPage() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useAdminSession()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [rows, setRows] = useState<Row[]>([])
  const [selected, setSelected] = useState<Row | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!sessionLoading && !session) router.replace('/admin/login')
  }, [sessionLoading, session, router])

  const load = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('player_applications')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else {
      const enriched: Row[] = (data || []).map((a: PlayerApplication) => {
        const c = calculatePlayerAge(a.date_of_birth)
        return { ...a, age: c.age, isYouth: c.isYouth }
      })
      setRows(enriched)
    }
    setLoading(false)
  }, [session])

  useEffect(() => { if (session) load() }, [session, load])

  if (sessionLoading || !session) {
    return (
      <Container maxW="container.xl" py={20} centerContent>
        <Spinner size="xl" />
      </Container>
    )
  }

  const visible = rows.filter(r =>
    filter === 'all' ? true : filter === 'youth' ? r.isYouth : filter === 'adult' ? !r.isYouth : r.status === filter
  )

  const updateStatus = async (id: string, status: string) => {
    const { error: err } = await supabase.from('player_applications').update({ status }).eq('id', id)
    if (err) setError(err.message)
    else setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)))
  }

  const exportCsv = () => {
    const head = ['Name', 'Email', 'Phone', 'DOB', 'Age', 'Position', 'Experience', 'Status', 'Submitted']
    const lines = visible.map(r =>
      [r.name, r.email, r.phone ?? '', r.date_of_birth, r.age, r.position ?? '', r.experience_level ?? '', r.status, r.created_at]
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `affillia-applications-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const signOut = async () => { await supabase.auth.signOut(); router.replace('/admin/login') }

  return (
    <Container maxW="container.xl" py={{ base: 8, md: 12 }}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" wrap="wrap" gap={4}>
          <Box>
            <Heading size="lg">Player Applications</Heading>
            <Text color="gray.500" fontSize="sm" mt={1}>
              {rows.length} total · {rows.filter(r => r.isYouth).length} youth
            </Text>
          </Box>
          <HStack spacing={2}>
            <Tooltip label="Refresh"><IconButton aria-label="Refresh" icon={<FiRefreshCw />} onClick={load} isLoading={loading} /></Tooltip>
            <Tooltip label="Export CSV"><IconButton aria-label="Export CSV" icon={<FiDownload />} onClick={exportCsv} isDisabled={!visible.length} /></Tooltip>
            <Button leftIcon={<FiLogOut />} variant="outline" onClick={signOut}>Sign out</Button>
          </HStack>
        </HStack>

        {error && <Alert status="error"><AlertIcon />{error}</Alert>}

        <HStack>
          <Select maxW="240px" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All applications</option>
            <option value="youth">Youth players</option>
            <option value="adult">Adult players</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="contacted">Contacted</option>
            <option value="rejected">Rejected</option>
          </Select>
        </HStack>

        <TableContainer borderWidth={1} borderRadius="lg">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th><Th>Age</Th><Th>Contact</Th><Th>Position</Th><Th>Status</Th><Th>Submitted</Th><Th />
              </Tr>
            </Thead>
            <Tbody>
              {visible.map(r => (
                <Tr key={r.id} _hover={{ bg: 'gray.50', cursor: 'pointer' }} onClick={() => { setSelected(r); onOpen() }}>
                  <Td fontWeight="medium">{r.name}{r.isYouth && <Badge ml={2} colorScheme="orange" fontSize="xs">Youth</Badge>}</Td>
                  <Td>{r.age}</Td>
                  <Td fontSize="sm">{r.email}{r.phone ? <><br />{r.phone}</> : null}</Td>
                  <Td>{r.position}</Td>
                  <Td onClick={e => e.stopPropagation()}>
                    <Select size="xs" value={r.status} onChange={e => updateStatus(r.id, e.target.value)} maxW="130px">
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                  </Td>
                  <Td fontSize="sm" color="gray.500">{new Date(r.created_at).toLocaleDateString()}</Td>
                  <Td onClick={e => e.stopPropagation()}>
                    <IconButton aria-label="View" size="sm" variant="ghost" icon={<FiEye />} onClick={() => { setSelected(r); onOpen() }} />
                  </Td>
                </Tr>
              ))}
              {!visible.length && (
                <Tr><Td colSpan={7} textAlign="center" py={10} color="gray.400">
                  {loading ? <Spinner /> : 'No applications yet'}
                </Td></Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selected?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <VStack spacing={3} align="stretch" fontSize="sm">
                <HStack justify="space-between"><Text color="gray.500">Status</Text><Badge colorScheme={STATUS_COLORS[selected.status] || 'gray'}>{selected.status}</Badge></HStack>
                <HStack justify="space-between"><Text color="gray.500">Age</Text><Text>{selected.age} (DOB {selected.date_of_birth})</Text></HStack>
                <HStack justify="space-between"><Text color="gray.500">Contact ({selected.isYouth ? 'parent/guardian' : 'player'})</Text><Text>{selected.email}{selected.phone ? ` · ${selected.phone}` : ''}</Text></HStack>
                <HStack justify="space-between"><Text color="gray.500">Position</Text><Text>{selected.position}</Text></HStack>
                <HStack justify="space-between"><Text color="gray.500">Experience</Text><Text>{selected.experience_level}</Text></HStack>
                {selected.cv_file_path && <HStack justify="space-between"><Text color="gray.500">CV</Text><Text>{selected.cv_file_name || selected.cv_file_path}</Text></HStack>}
                <Box pt={2}><Text color="gray.500" mb={1}>Notes</Text><Text>{selected.application_notes || '—'}</Text></Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
}
