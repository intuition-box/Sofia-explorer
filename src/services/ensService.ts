import { createPublicClient, http, getAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'
import { createAvatar } from '@dicebear/core'
import { glass } from '@dicebear/collection'
import { useGetAccountLabelsQuery } from '@0xsofia/dashboard-graphql'

// ENS client — always proxy through Nginx/Vite to avoid CORS
const ENS_RPC_URL = '/eth-rpc'
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(ENS_RPC_URL),
})

// Global caches persist as module-level singletons
const labelCache = new Map<string, string | null>()
const avatarCache = new Map<string, string | null>()

const ENS_BATCH_SIZE = 5

// ── Helpers ──────────────────────────────────────────────────────────

export function isRealLabel(label?: string | null): boolean {
  if (!label) return false
  return !label.startsWith('0x') && !label.includes('...')
}

export function isEnsName(label?: string | null): boolean {
  if (!label) return false
  return label.endsWith('.eth') || label.endsWith('.box')
}

export function formatEth(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

// ── Resolvers ────────────────────────────────────────────────────────

export async function resolveViaGraphQL(addresses: string[]): Promise<void> {
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
    console.warn('[ensService] GraphQL lookup failed:', err)
  }
}

const ENS_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

export async function resolveViaEns(address: string): Promise<void> {
  const key = address.toLowerCase()

  // 1. The Graph ENS subgraph — most reliable, indexes all domains
  try {
    const res = await fetch(ENS_SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{ domains(where: { resolvedAddress: "${key}" }) { name } }`,
      }),
    })
    if (res.ok) {
      const json = await res.json()
      const name = json.data?.domains?.[0]?.name
      if (name) {
        labelCache.set(key, name)
        return
      }
    }
  } catch {}

  // 2. ENSTATE API — fast, also provides avatar
  try {
    const res = await fetch(`https://enstate.rs/a/${key}`)
    if (res.ok) {
      const data = await res.json()
      if (data.name) {
        labelCache.set(key, data.name)
        if (data.avatar) avatarCache.set(key, data.avatar)
        return
      }
    }
  } catch {}

  // 3. On-chain reverse lookup (fallback)
  try {
    const name = await ensClient.getEnsName({
      address: key as `0x${string}`,
    })
    if (name) {
      labelCache.set(key, name)
    } else {
      labelCache.set(key, null)
    }
  } catch {
    labelCache.set(key, null)
  }
}

export async function resolveEnsAvatar(address: string): Promise<void> {
  const key = address.toLowerCase()
  if (avatarCache.has(key)) return

  const name = labelCache.get(key)
  if (!name || !isEnsName(name)) {
    avatarCache.set(key, null)
    return
  }

  // Try ENSTATE API first (fast, free, reliable)
  try {
    const res = await fetch(`https://enstate.rs/n/${name}`)
    if (res.ok) {
      const data = await res.json()
      if (data.avatar) {
        avatarCache.set(key, data.avatar)
        return
      }
    }
  } catch {}

  // Fallback to viem ENS resolution
  try {
    const avatar = await ensClient.getEnsAvatar({ name: normalize(name) })
    if (avatar) {
      avatarCache.set(key, avatar)
    } else if (!avatarCache.has(key)) {
      avatarCache.set(key, null)
    }
  } catch {
    if (!avatarCache.has(key)) {
      avatarCache.set(key, null)
    }
  }
}

/**
 * Resolve an ENS name to a wallet address.
 * Returns null if resolution fails.
 */
export async function resolveEnsToAddress(ensName: string): Promise<string | null> {
  try {
    const address = await ensClient.getEnsAddress({ name: normalize(ensName) })
    return address || null
  } catch {
    // Fallback: try ENSTATE API
    try {
      const res = await fetch(`https://enstate.rs/n/${ensName}`)
      if (res.ok) {
        const data = await res.json()
        if (data.address) return data.address
      }
    } catch {}
    return null
  }
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

export async function batchResolve(
  addresses: string[],
  onUpdate: () => void,
): Promise<void> {
  const unique = [...new Set(addresses.map((a) => a.toLowerCase()))]
  // Include addresses with null labels (failed lookups) so they get retried
  const uncached = unique.filter((a) => !labelCache.has(a) || labelCache.get(a) === null)

  if (uncached.length === 0) {
    await resolveAvatars(unique, onUpdate)
    return
  }

  // Step 1: batch GraphQL lookup (fast, already indexed)
  await resolveViaGraphQL(uncached)
  onUpdate()

  // Step 2: ENS reverse lookup for addresses without an ENS name yet
  // (safe: resolveViaEns won't overwrite a good GraphQL label)
  const needsEns = uncached.filter((a) => !isEnsName(labelCache.get(a)))
  for (let i = 0; i < needsEns.length; i += ENS_BATCH_SIZE) {
    const batch = needsEns.slice(i, i + ENS_BATCH_SIZE)
    await Promise.allSettled(batch.map(resolveViaEns))
    onUpdate()
  }

  // Step 3: resolve avatars for addresses that have a label but no avatar
  await resolveAvatars(unique, onUpdate)
}

// ── Display helpers (used by the hook) ───────────────────────────────

export function getDisplayName(addr: string): string {
  const name = labelCache.get(addr.toLowerCase())
  if (name) return name
  return formatEth(addr)
}

export function getAvatarUrl(addr: string): string {
  const cached = avatarCache.get(addr.toLowerCase())
  if (cached) return cached
  // DiceBear fallback — generate deterministic glass avatar from address
  const avatar = createAvatar(glass, { seed: addr })
  return avatar.toDataUri()
}
