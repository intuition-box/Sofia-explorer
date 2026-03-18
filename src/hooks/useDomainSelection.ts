import { useState, useCallback } from 'react'
import { getSuggestedPlatforms } from '../config/taxonomy'
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sofia_domain_selection'
const SYNC_EVENT = 'sofia_domain_selection_sync'

interface DomainSelectionState {
  selectedDomains: string[]
  selectedNiches: string[]
}

const DEFAULT_STATE: DomainSelectionState = { selectedDomains: [], selectedNiches: [] }

function getSnapshot(): DomainSelectionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_STATE
}

function save(state: DomainSelectionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event(SYNC_EVENT))
}

function subscribe(callback: () => void) {
  window.addEventListener(SYNC_EVENT, callback)
  return () => window.removeEventListener(SYNC_EVENT, callback)
}

// Cache the serialized string to avoid new objects on every getSnapshot call
let cachedJson = ''
let cachedState = DEFAULT_STATE

function getSnapshotStable(): DomainSelectionState {
  const raw = localStorage.getItem(STORAGE_KEY) || ''
  if (raw !== cachedJson) {
    cachedJson = raw
    try {
      cachedState = raw ? JSON.parse(raw) : DEFAULT_STATE
    } catch {
      cachedState = DEFAULT_STATE
    }
  }
  return cachedState
}

export function useDomainSelection() {
  const state = useSyncExternalStore(subscribe, getSnapshotStable)

  const toggleDomain = useCallback((domainId: string) => {
    const current = getSnapshot()
    const isSelected = current.selectedDomains.includes(domainId)
    save({
      selectedDomains: isSelected
        ? current.selectedDomains.filter((d) => d !== domainId)
        : [...current.selectedDomains, domainId],
      selectedNiches: current.selectedNiches,
    })
  }, [])

  const toggleNiche = useCallback((nicheId: string) => {
    const current = getSnapshot()
    const isSelected = current.selectedNiches.includes(nicheId)
    save({
      selectedDomains: current.selectedDomains,
      selectedNiches: isSelected
        ? current.selectedNiches.filter((n) => n !== nicheId)
        : [...current.selectedNiches, nicheId],
    })
  }, [])

  const suggestedPlatforms = getSuggestedPlatforms(state.selectedNiches)

  return {
    selectedDomains: state.selectedDomains,
    selectedNiches: state.selectedNiches,
    suggestedPlatforms,
    toggleDomain,
    toggleNiche,
  }
}
