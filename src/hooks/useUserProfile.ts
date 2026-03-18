import { useState, useEffect, useCallback } from 'react'
import { fetchUserProfile } from '../services/profileService'
import type { UserProfileData } from '../services/profileService'

interface UseUserProfileResult {
  profile: UserProfileData | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useUserProfile(walletAddress: string | undefined): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!walletAddress) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchUserProfile(walletAddress)
      setProfile(data)
    } catch (err) {
      console.error('[useUserProfile]', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    profile,
    isLoading,
    error,
    refresh: fetchData,
  }
}
