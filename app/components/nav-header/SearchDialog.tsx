import { FolderIcon, MagnifyingGlassIcon, XMarkIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Button, Detail, Dialog, HStack, Loader, Search, Tag, VStack } from '@navikt/ds-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useFetcher, useNavigate } from 'react-router'
import { decodeBehandlingStatus, decodeBehandlingStatusToVariant } from '~/common/decode'
import { decodeBehandling } from '~/common/decodeBehandling'
import { decodeTeam } from '~/common/decodeTeam'
import type { BehandlingDto, BehandlingerPage } from '~/types'
import styles from './SearchDialog.module.css'

const MAX_QUICK_SEARCH_RESULTS = 5

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Box
      as="kbd"
      paddingInline="space-6"
      paddingBlock="space-2"
      background="neutral-moderate"
      borderRadius="4"
      className={styles.kbd}
    >
      {children}
    </Box>
  )
}

type SearchResult = Pick<BehandlingDto, 'behandlingId' | 'type' | 'status' | 'ansvarligTeam'> & {
  matchedVerdiTypeDecodes: string[]
  matchedQuery: string
}

export default function SearchDialog({
  defaultOpen = false,
  initialQuery = '',
  isMac = false,
}: {
  defaultOpen?: boolean
  initialQuery?: string
  isMac?: boolean
} = {}) {
  const [open, setOpen] = useState(defaultOpen)
  const [query, setQuery] = useState(initialQuery)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const fetcher = useFetcher<{ behandlinger: BehandlingerPage | null; error: string | null }>()
  const listboxId = useId()
  const submittedQueryRef = useRef(initialQuery)
  const results: SearchResult[] = useMemo(
    () =>
      fetcher.data?.behandlinger?.content.map((b) => ({
        behandlingId: b.behandlingId,
        type: b.type,
        status: b.status,
        ansvarligTeam: b.ansvarligTeam,
        matchedVerdiTypeDecodes: b.matchedVerdiTypeDecodes ?? [],
        matchedQuery: submittedQueryRef.current,
      })) ?? [],
    [fetcher.data],
  )

  const prevDataRef = useRef(fetcher.data)
  if (prevDataRef.current !== fetcher.data) {
    prevDataRef.current = fetcher.data
    setSelectedIndex(0)
  }

  const resultsRef = useRef<SearchResult[]>([])
  const selectedIndexRef = useRef(0)
  const [isDebouncing, setIsDebouncing] = useState(false)
  resultsRef.current = results
  selectedIndexRef.current = selectedIndex

  const isLoading = isDebouncing || fetcher.state !== 'idle'
  const hasSearched = fetcher.data !== undefined
  const errorMessage = fetcher.data?.error ?? null
  const trimmedQuery = query.trim()
  const activeDescendantId = results.length > 0 ? `${listboxId}-option-${selectedIndex}` : undefined

  // fetcher.reset is stable per fetcher instance, but listed for correctness
  const closeDialog = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelectedIndex(0)
    setIsDebouncing(false)
    submittedQueryRef.current = ''
    fetcher.reset()
  }, [fetcher.reset])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      closeDialog()
      navigate(`/behandling/${result.behandlingId}`)
    },
    [navigate, closeDialog],
  )

  // Keyboard shortcut to open dialog (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifierPressed = isMac ? e.metaKey : e.ctrlKey
      if (modifierPressed && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMac])

  // Arrow key navigation and Enter to select
  useEffect(() => {
    if (!open) return

    const handleArrowKeys = (e: KeyboardEvent) => {
      const currentResults = resultsRef.current

      if (e.key === 'Escape') {
        e.preventDefault()
        closeDialog()
        return
      }

      const target = e.target as HTMLElement | null
      if (!(target instanceof HTMLInputElement)) return

      if (e.key === 'ArrowDown') {
        if (currentResults.length > 0) {
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, currentResults.length - 1))
        }
      } else if (e.key === 'ArrowUp') {
        if (currentResults.length > 0) {
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
        }
      } else if (e.key === 'Enter') {
        const idx = selectedIndexRef.current
        if (currentResults.length > 0 && idx < currentResults.length) {
          e.preventDefault()
          handleSelect(currentResults[idx])
        }
      }
    }

    window.addEventListener('keydown', handleArrowKeys)
    return () => window.removeEventListener('keydown', handleArrowKeys)
  }, [open, handleSelect, closeDialog])

  // Debounced search via fetcher
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || !open) {
      setIsDebouncing(false)
      fetcher.reset()
      return
    }

    setIsDebouncing(true)

    const timer = setTimeout(() => {
      setIsDebouncing(false)
      submittedQueryRef.current = trimmed
      fetcher.submit({ query: trimmed, size: String(MAX_QUICK_SEARCH_RESULTS) }, { method: 'POST', action: '/api/sok' })
    }, 300)

    return () => {
      clearTimeout(timer)
      setIsDebouncing(false)
    }
  }, [query, open, fetcher.submit, fetcher.reset])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeDialog()
        } else {
          setOpen(true)
        }
      }}
    >
      <Dialog.Trigger>
        <Button
          className={styles.triggerButton}
          size="small"
          data-color="neutral"
          variant="secondary"
          iconPosition="left"
          icon={<MagnifyingGlassIcon aria-hidden />}
        >
          Søk
          {isMac ? (
            <>
              <span>&nbsp;</span>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </>
          ) : (
            <>
              <span>&nbsp;</span>
              <Kbd>ctrl</Kbd>
              <Kbd>k</Kbd>
            </>
          )}
        </Button>
      </Dialog.Trigger>

      <Dialog.Popup
        width="large"
        position="center"
        closeOnOutsideClick
        initialFocusTo={() => searchInputRef.current}
        aria-label="Søk"
        className={styles.popup}
      >
        <Dialog.Header withClosebutton={false}>
          <HStack gap="space-16" align="center">
            <div className={styles.searchInputWrapper}>
              <Search
                ref={searchInputRef}
                label="Søk"
                hideLabel
                variant="simple"
                value={query}
                onChange={setQuery}
                autoComplete="off"
                role="combobox"
                aria-controls={!isLoading && results.length > 0 ? listboxId : undefined}
                aria-activedescendant={!isLoading && results.length > 0 ? activeDescendantId : undefined}
                aria-expanded={!isLoading && results.length > 0}
              />
            </div>
            <Button
              icon={<XMarkIcon aria-hidden />}
              aria-label="Lukk"
              variant="tertiary"
              data-color="neutral"
              onClick={closeDialog}
            />
          </HStack>
        </Dialog.Header>

        <Dialog.Body className={styles.body}>
          {isLoading && (
            <HStack justify="center" padding="space-24">
              <Loader size="medium" />
            </HStack>
          )}

          {trimmedQuery && hasSearched && !isLoading && errorMessage && (
            <Box padding="space-24">
              <BodyShort className={`${styles.subtleText} ${styles.textCenter}`}>{errorMessage}</BodyShort>
            </Box>
          )}

          {trimmedQuery && hasSearched && results.length === 0 && !isLoading && !errorMessage && (
            <Box padding="space-24">
              <BodyShort className={`${styles.subtleText} ${styles.textCenter}`}>Ingen resultater funnet</BodyShort>
            </Box>
          )}

          {results.length > 0 && !isLoading && (
            <Box paddingInline="space-12" paddingBlock="space-8">
              <VStack as="ul" gap="space-2" className={styles.resultList} role="listbox" id={listboxId}>
                {results.map((result, index) => {
                  const isSelected = index === selectedIndex
                  return (
                    <Box
                      as="li"
                      key={result.behandlingId}
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={isSelected}
                      padding="space-12"
                      paddingInline="space-16"
                      borderRadius="4"
                      className={isSelected ? styles.resultItemSelected : styles.resultItem}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => handleSelect(result)}
                    >
                      <HStack gap="space-12" align="center">
                        <FolderIcon aria-hidden className={styles.resultIcon} />
                        <VStack gap="space-2" className={styles.resultContent}>
                          <HStack gap="space-8" align="center">
                            <BodyShort weight="semibold" className={styles.ellipsis}>
                              {decodeBehandling(result.type)}
                            </BodyShort>
                            <BodyShort size="small" className={styles.subtleText}>
                              {result.behandlingId}
                            </BodyShort>
                            <Tag size="xsmall" variant={decodeBehandlingStatusToVariant(result.status)}>
                              {decodeBehandlingStatus(result.status)}
                            </Tag>
                            {result.ansvarligTeam && (
                              <Tag size="xsmall" variant="alt1">
                                {decodeTeam(result.ansvarligTeam)}
                              </Tag>
                            )}
                          </HStack>
                          <BodyShort size="small" className={`${styles.subtleText} ${styles.ellipsis}`}>
                            {result.matchedVerdiTypeDecodes.length > 0
                              ? `${result.matchedVerdiTypeDecodes.join(', ')}: ${result.matchedQuery}`
                              : 'Åpne behandling'}
                          </BodyShort>
                        </VStack>
                      </HStack>
                    </Box>
                  )
                })}
              </VStack>
            </Box>
          )}

          {!trimmedQuery && (
            <Box padding="space-24">
              <VStack gap="space-8" align="center">
                <BodyShort className={styles.subtleText}>Skriv inn søkeord for å søke i behandlinger</BodyShort>
              </VStack>
            </Box>
          )}
        </Dialog.Body>

        <Dialog.Footer className={styles.footer}>
          <HStack gap="space-8">
            <HStack gap="space-4" align="center">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <Detail>naviger</Detail>
            </HStack>
            <HStack gap="space-4" align="center">
              <Kbd>↵</Kbd>
              <Detail>velg</Detail>
            </HStack>
            <HStack gap="space-4" align="center">
              <Kbd>esc</Kbd>
              <Detail>lukk</Detail>
            </HStack>
          </HStack>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}
