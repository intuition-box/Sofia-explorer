import { useState, useEffect, useRef, useMemo } from 'react'
import { createPublicClient, http, getAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'
import type { Address } from 'viem'
import { createAvatar } from '@dicebear/core'
import { glass } from '@dicebear/collection'
import { useGetAccountLabelsQuery } from '@0xsofia/dashboard-graphql'

// ENS fallback client for addresses not indexed by Intuition
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://rpc.ankr.com/eth'),
})

// Global caches persist across re-renders
const labelCache = new Map<string, string | null>()
const avatarCache = new Map<string, string | null>()

function isRealLabel(label?: string | null): boolean {
  if (!label) return false
  return !label.startsWith('0x') && !label.includes('...')
}

async function resolveViaGraphQL(addresses: string[]): Promise<void> {
  try {
    const checksumIds = addresses.map((a) => getAddress(a))
    const result = await useGetAccountLabelsQuery.fetcher({
      ids: checksumIds,
    })()

    for (const account of result.accounts || []) {
      const key = account.id.toLowerCase()
      const label = account.label || account.atom?.label || null
      const image = account.image || account.atom?.image || null
      if (isRealLabel(label)) {
        labelCache.set(key, label)
      }
      if (image) {
        avatarCache.set(key, image)
      }
    }
  } catch (err) {
    console.warn('[useEnsNames] GraphQL lookup failed:', err)
  }
}

async function resolveViaEns(address: string): Promise<void> {
  const key = address.toLowerCase()
  if (labelCache.has(key)) return

  try {
    const name = await ensClient.getEnsName({
      address: key as `0x${string}`,
    })
    labelCache.set(key, name)
  } catch {
    labelCache.set(key, null)
  }
}

async function resolveEnsAvatar(address: string): Promise<void> {
  const key = address.toLowerCase()
  if (avatarCache.has(key)) return

  const name = labelCache.get(key)
  if (!name) {
    avatarCache.set(key, null)
    return
  }

  try {
    const avatar = await ensClient.getEnsAvatar({ name: normalize(name) })
    avatarCache.set(key, avatar)
  } catch {
    avatarCache.set(key, null)
  }
}

const ENS_BATCH_SIZE = 5

async function batchResolve(
  addresses: string[],
  onUpdate: () => void,
): Promise<void> {
  const unique = [...new Set(addresses.map((a) => a.toLowerCase()))]
  const uncached = unique.filter((a) => !labelCache.has(a))

  if (uncached.length === 0) {
    // Still need to resolve avatars for cached labels without avatars
    await resolveAvatars(unique, onUpdate)
    return
  }

  // Step 1: batch GraphQL lookup (fast, already indexed)
  await resolveViaGraphQL(uncached)
  onUpdate()

  // Step 2: ENS fallback for any still-unresolved labels
  const stillMissing = uncached.filter((a) => !labelCache.has(a))
  for (let i = 0; i < stillMissing.length; i += ENS_BATCH_SIZE) {
    const batch = stillMissing.slice(i, i + ENS_BATCH_SIZE)
    await Promise.allSettled(batch.map(resolveViaEns))
    onUpdate()
  }

  // Step 3: resolve avatars for addresses that have a label but no avatar
  await resolveAvatars(unique, onUpdate)
}

async function resolveAvatars(
  addresses: string[],
  onUpdate: () => void,
): Promise<void> {
  const needAvatar = addresses.filter(
    (a) => labelCache.get(a) && !avatarCache.has(a)
  )
  if (needAvatar.length === 0) return

  for (let i = 0; i < needAvatar.length; i += ENS_BATCH_SIZE) {
    const batch = needAvatar.slice(i, i + ENS_BATCH_SIZE)
    await Promise.allSettled(batch.map(resolveEnsAvatar))
    onUpdate()
  }
}

export function useEnsNames(addresses: Address[]) {
  const [revision, setRevision] = useState(0)
  const runningRef = useRef(false)

  const addressKey = useMemo(
    () => addresses.map((a) => a.toLowerCase()).sort().join(','),
    [addresses],
  )

  useEffect(() => {
    if (!addressKey || runningRef.current) return
    runningRef.current = true

    batchResolve(addresses, () => setRevision((r) => r + 1)).finally(() => {
      runningRef.current = false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressKey])

  void revision

  function getDisplay(addr: Address): string {
    const name = labelCache.get(addr.toLowerCase())
    if (name) return name
    return addr.slice(0, 6) + '...' + addr.slice(-4)
  }

  function getAvatar(addr: Address): string {
    const cached = avatarCache.get(addr.toLowerCase())
    if (cached) return cached
    // DiceBear fallback — generate deterministic glass avatar from address
    const avatar = createAvatar(glass, { seed: addr })
    return avatar.toDataUri()
  }

  return { getDisplay, getAvatar }
}
