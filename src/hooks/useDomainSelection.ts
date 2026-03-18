import { useState, useCallback, useEffect } from 'react'
import { getSuggestedPlatforms } from '../config/taxonomy'

const STORAGE_KEY = 'sofia_domain_selection'

interface DomainSelectionState {
  selectedDomains: string[]
  selectedNiches: string[]
}

function loadFromStorage(): DomainSelectionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { selectedDomains: [], selectedNiches: [] }
}

function saveToStorage(state: DomainSelectionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useDomainSelection() {
  const [state, setState] = useState<DomainSelectionState>(loadFromStorage)

  useEffect(() => {
    saveToStorage(state)
  }, [state])

  const toggleDomain = useCallback((domainId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedDomains.includes(domainId)
      if (isSelected) {
        return {
          selectedDomains: prev.selectedDomains.filter((d) => d !== domainId),
          selectedNiches: prev.selectedNiches,
        }
      }
      return {
        selectedDomains: [...prev.selectedDomains, domainId],
        selectedNiches: prev.selectedNiches,
      }
    })
  }, [])

  const toggleNiche = useCallback((nicheId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedNiches.includes(nicheId)
      return {
        selectedDomains: prev.selectedDomains,
        selectedNiches: isSelected
          ? prev.selectedNiches.filter((n) => n !== nicheId)
          : [...prev.selectedNiches, nicheId],
      }
    })
  }, [])

  const clearSelection = useCallback(() => {
    setState({ selectedDomains: [], selectedNiches: [] })
  }, [])

  const suggestedPlatforms = getSuggestedPlatforms(state.selectedNiches)

  return {
    selectedDomains: state.selectedDomains,
    selectedNiches: state.selectedNiches,
    suggestedPlatforms,
    toggleDomain,
    toggleNiche,
    clearSelection,
  }
}
