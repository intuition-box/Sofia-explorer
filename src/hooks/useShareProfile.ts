import { useState, useCallback, useMemo } from 'react'
import { OG_BASE_URL } from '../config'
import { DOMAIN_BY_ID } from '../config/taxonomy'
import type { DomainScore } from '../types/reputation'

interface UseShareProfileParams {
  walletAddress: string
  domainScores: DomainScore[]
  connectedCount: number
  totalCertifications: number
}

export function useShareProfile({
  walletAddress,
  domainScores,
  connectedCount,
  totalCertifications,
}: UseShareProfileParams) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const displayName =
    walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)

  const interests = domainScores
    .map((d) => {
      const label = DOMAIN_BY_ID.get(d.domainId)?.label ?? d.domainId
      return `${label}:${d.score}`
    })
    .join(',')

  const level =
    domainScores.length > 0
      ? Math.round(
          domainScores.reduce((s, d) => s + d.score, 0) / domainScores.length,
        )
      : 0

  const ogParams = new URLSearchParams({
    wallet: walletAddress,
    name: displayName,
    level: String(level),
    signals: String(connectedCount),
    interests,
    trustCircle: String(totalCertifications),
    pioneer: '0',
    explorer: '0',
  })

  const ogImageUrl = useMemo(
    () => `${OG_BASE_URL}/api/og?${ogParams.toString()}`,
    [ogParams.toString()],
  )

  const openShareModal = useCallback(async () => {
    setIsModalOpen(true)
    setError(null)
    setShareUrl(null)
    setIsLoading(true)

    try {
      const res = await fetch(`${OG_BASE_URL}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: walletAddress,
          name: displayName,
          level,
          signals: connectedCount,
          interests,
          trustCircle: totalCertifications,
          pioneer: 0,
          explorer: 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to create share link')

      const { url } = await res.json()
      setShareUrl(url)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress, displayName, level, connectedCount, interests, totalCertifications])

  const closeShareModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareUrl])

  const handleShareOnX = useCallback(() => {
    if (!shareUrl) return
    const text = encodeURIComponent(
      'Check out my behavioral reputation profile on Sofia!',
    )
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
    )
  }, [shareUrl])

  return {
    isModalOpen,
    openShareModal,
    closeShareModal,
    shareUrl,
    ogImageUrl,
    isLoading,
    error,
    handleCopyLink,
    handleShareOnX,
    copied,
  }
}
