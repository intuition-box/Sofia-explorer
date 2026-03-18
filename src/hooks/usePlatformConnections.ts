import { useState, useCallback, useEffect, useMemo } from 'react'
import type { PlatformConnection, ConnectionStatus } from '../types/reputation'
import {
  startOAuthFlow,
  exchangeOAuthCode,
  requestChallenge,
  verifyChallenge,
  getConnectionStrategy,
} from '../services/oauthService'

const STORAGE_KEY = 'sofia_platform_connections'

function loadFromStorage(): Map<string, PlatformConnection> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const arr: PlatformConnection[] = JSON.parse(raw)
      return new Map(arr.map((c) => [c.platformId, c]))
    }
  } catch {}
  return new Map()
}

function saveToStorage(connections: Map<string, PlatformConnection>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...connections.values()])
  )
}

export function usePlatformConnections() {
  const [connections, setConnections] = useState<Map<string, PlatformConnection>>(loadFromStorage)

  useEffect(() => {
    saveToStorage(connections)
  }, [connections])

  const updateConnection = useCallback(
    (platformId: string, update: Partial<PlatformConnection>) => {
      setConnections((prev) => {
        const next = new Map(prev)
        const existing = next.get(platformId) || {
          platformId,
          status: 'disconnected' as ConnectionStatus,
        }
        next.set(platformId, { ...existing, ...update })
        return next
      })
    },
    [],
  )

  /**
   * Connect via OAuth popup (oauth2 + oauth1 platforms).
   */
  const connect = useCallback(
    async (platformId: string) => {
      const strategy = getConnectionStrategy(platformId)

      if (strategy === 'auto') {
        // No auth needed (e.g. bandcamp)
        updateConnection(platformId, {
          status: 'connected',
          connectedAt: Date.now(),
        })
        return
      }

      if (strategy !== 'oauth_popup') {
        // username/siwe/siwf — handled by other methods
        return
      }

      updateConnection(platformId, {
        status: 'connecting',
        connectedAt: Date.now(),
        error: undefined,
      })

      try {
        const code = await startOAuthFlow(platformId)
        const result = await exchangeOAuthCode(platformId, code)

        if (result.success) {
          updateConnection(platformId, {
            status: 'connected',
            connectedAt: Date.now(),
            userId: result.userId,
            username: result.username,
          })
        } else {
          updateConnection(platformId, {
            status: 'error',
            error: result.error || 'Connection failed',
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Connection failed'
        if (message === 'OAuth cancelled') {
          updateConnection(platformId, { status: 'disconnected' })
        } else {
          updateConnection(platformId, {
            status: 'error',
            error: message,
          })
        }
      }
    },
    [updateConnection],
  )

  /**
   * Step 1 of bio challenge: request a code for a public/api_key platform.
   * User must paste this code in their profile bio, then call verifyChallengeCode().
   */
  const startChallenge = useCallback(
    async (platformId: string, username: string) => {
      updateConnection(platformId, {
        status: 'connecting',
        username,
        error: undefined,
      })

      try {
        const result = await requestChallenge(platformId, username)
        updateConnection(platformId, {
          status: 'pending_verification',
          username,
          challengeCode: result.challengeCode,
        })
      } catch (err) {
        updateConnection(platformId, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Challenge request failed',
        })
      }
    },
    [updateConnection],
  )

  /**
   * Step 2 of bio challenge: verify the code is in the user's bio.
   */
  const verifyChallengeCode = useCallback(
    async (platformId: string) => {
      const conn = connections.get(platformId)
      if (!conn?.username || !conn?.challengeCode) return

      updateConnection(platformId, {
        status: 'connecting',
        error: undefined,
      })

      try {
        const result = await verifyChallenge(
          platformId,
          conn.username,
          conn.challengeCode,
        )

        if (result.success) {
          updateConnection(platformId, {
            status: 'connected',
            connectedAt: Date.now(),
            userId: result.userId,
            challengeCode: undefined,
          })
        } else {
          updateConnection(platformId, {
            status: 'pending_verification',
            error: result.error || 'Code not found in bio',
          })
        }
      } catch (err) {
        updateConnection(platformId, {
          status: 'pending_verification',
          error: err instanceof Error ? err.message : 'Verification failed',
        })
      }
    },
    [connections, updateConnection],
  )

  const disconnect = useCallback((platformId: string) => {
    setConnections((prev) => {
      const next = new Map(prev)
      next.delete(platformId)
      return next
    })
  }, [])

  const getStatus = useCallback(
    (platformId: string): ConnectionStatus => {
      return connections.get(platformId)?.status ?? 'disconnected'
    },
    [connections]
  )

  const getConnection = useCallback(
    (platformId: string): PlatformConnection | undefined => {
      return connections.get(platformId)
    },
    [connections]
  )

  const connectedCount = useMemo(
    () => [...connections.values()].filter((c) => c.status === 'connected').length,
    [connections]
  )

  return {
    connections,
    connect,
    startChallenge,
    verifyChallengeCode,
    disconnect,
    getStatus,
    getConnection,
    connectedCount,
  }
}
