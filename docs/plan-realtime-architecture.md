# Refacto architecture temps reel — WebSocket subscriptions + cache unifie

> Date : 18 avril 2026
> Branche : `design/realtime-subscriptions`
> Statut : DESIGN — a valider et raffiner avant implementation
> Auteurs : Max (architecture), Claude (redaction)

---

## 1. Contexte et objectifs

### 1.1 Le probleme actuel

Le frontend de Sofia Explorer fait du **pull polling** sur de nombreuses queries GraphQL a chaque navigation :

- ~15 queries differentes sur `mainnet.intuition.sh/v1/graphql` par chargement de page
- `useQuery` individuels par composant, chacun avec son propre staleTime
- Chaque reload → rehydratation du cache + refetch en burst des queries stale
- Avec le persister localStorage recemment ajoute, le burst s'est amplifie et a declenche des 429 (rate limit Kong) qui apparaissent comme des erreurs CORS dans le browser
- Pas de notion de "real-time" : si quelqu'un te trust maintenant, tu ne le vois pas avant de refresh

### 1.2 L'intuition du refacto

Passer d'une architecture **pull** (chaque composant fetch ce dont il a besoin, quand il en a besoin) a **push** (une source unique de verite maintenue par subscription WS, tous les composants lisent dessus).

Benefices attendus :

| Metric | Avant | Apres |
|---|---|---|
| Requetes HTTP par session | ~50-100 | ~5-10 (seed + actions user) |
| Latence mise a jour apres une action | 2-10 secondes (polling) | <500ms (push WS) |
| Risque 429 rate limit | Eleve (burst au reload) | Nul (WS maintient l'etat) |
| UX "flash empty" au reload | 1-3s | Instantane (cache hydrate depuis le precedent WS) |
| Bande passante | ~500KB par session | ~50KB (diffs WS) |
| Reactivite cross-user (quelqu'un te trust) | 0 (statique) | Live |

### 1.3 Objectifs non-fonctionnels

- **Robustesse** : reconnection automatique, retry exponentiel, fallback HTTP si WS fail
- **Progressif** : migration par hook, pas de big-bang
- **Retro-compatible** : les composants existants continuent a marcher pendant la transition
- **Observabilite** : logging des events WS, metrics de reconnexion
- **Mode degrade** : si le backend WS est down, on tombe sur du polling intelligent (pas de crash)

---

## 2. Etat actuel — architecture pull

### 2.1 Schema

```
┌──────────────────────────────────────────────────────────────┐
│                      COMPOSANT A                              │
│  useQuery(['signals', wallet, platforms])  ──> fetch          │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│                      COMPOSANT B                              │
│  useQuery(['userProfile', wallet])         ──> fetch          │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│                      COMPOSANT C                              │
│  useQuery(['topicPositions', wallet, ...]) ──> fetch          │
└──────────────────────────────────────────────────────────────┘
                          │
                          │ Chaque query declenche son propre fetch
                          ▼
          ┌────────────────────────────────────┐
          │  React Query cache (localStorage)   │
          └────────────────────────────────────┘
                          │
                          │ HTTP/2 GraphQL
                          ▼
          ┌────────────────────────────────────┐
          │  Kong → Hasura → Postgres          │
          │  mainnet.intuition.sh/v1/graphql   │
          └────────────────────────────────────┘
```

### 2.2 Inventaire des queries (par frequence de changement)

**Tres volatile** (change apres chaque action user ou autre user qui trust/vote) :
- `positions(account_id: wallet)` — toutes les positions on-chain du user
- `events(receiver_id: wallet, type: Deposited/Redeemed)` — activite du user
- `trust_circle(from: wallet)` — qui le user trust
- `trusted_by(to: wallet)` — qui trust le user
- `topic_positions(wallet)` — positions sur les topic atoms
- `topic_certifications(wallet, topic)` — certifs par topic

**Moyennement volatile** (change de temps en temps, global) :
- `trending(topic)` — plateformes tendance par topic
- `leaderboard()` — top users
- `domain_claims(topic)` — claims par topic
- `top_claims()` — URL les plus certifiees

**Quasi-statique** (change rarement, global) :
- `taxonomy()` — topics + categories
- `platform_catalog()` — liste des plateformes
- `atom_ids()` — mapping slug → termId

### 2.3 Problemes concrets observes

1. **Burst 429** au reload : 15 queries stale rehydrates → refetch parallele → Kong limit hit
2. **Flash empty state** : durant 1-3s apres reload, les composants montrent des zeros avant que les fetch aboutissent
3. **Desynchronisation** : composant A a les positions fraiches, composant B a les siennes 30s plus vieilles → scores incoherents entre pages
4. **Pas de real-time** : si un ami te trust, tu vois rien avant de refresh
5. **Refetch inutile** : apres un simple switch d'onglet, React Query refire des queries qui n'ont pas change

---

## 3. Architecture cible — push avec WebSocket

### 3.1 Schema cible

```
┌──────────────────────────────────────────────────────────────┐
│                    SubscriptionManager                        │
│  (singleton, mount au niveau App.tsx)                         │
│                                                               │
│  1 connection WS persistante                                  │
│  N subscriptions actives :                                    │
│    • positions(account_id = wallet)                           │
│    • events(receiver_id = wallet)                             │
│    • trust_relationships(subject_or_object = wallet)          │
│                                                               │
│  Chaque delta WS ──► queryClient.setQueryData([...], updater) │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
          ┌────────────────────────────────────┐
          │  React Query cache (localStorage)   │
          │  staleTime: Infinity                 │
          │  refetchOnMount: false               │
          └────────────────────────────────────┘
                          │
                 ┌────────┴────────┐
                 │                 │
                 ▼                 ▼
┌────────────────────┐   ┌────────────────────┐
│   COMPOSANT A      │   │   COMPOSANT B      │
│   useQuery(...)    │   │   useQuery(...)    │
│   Lit le cache,    │   │   Lit le cache,    │
│   jamais fetch     │   │   jamais fetch     │
└────────────────────┘   └────────────────────┘

Les composants ne fetchent JAMAIS eux-memes.
Le seed initial se fait au mount du SubscriptionManager.
Les actions user (deposit/redeem) invalident ponctuellement.
```

### 3.2 Responsabilites par layer

| Layer | Responsabilite |
|---|---|
| **SubscriptionManager** | Gerer la connection WS, les subscriptions actives, l'auth, le reconnect |
| **Subscription hooks** (`usePositionsSubscription`, etc.) | Declarer les subscriptions a ouvrir selon le contexte (wallet connecte, etc.) |
| **React Query cache** | Stocker l'etat unifie, persister sur localStorage, invalidation ciblee |
| **Composants** | `useQuery` avec `staleTime: Infinity` — lecture seule du cache |
| **Action hooks** (`useDeposit`, `useRedeem`, etc.) | Optimistic update + attente confirmation + re-sync via WS |

---

## 4. Classification des donnees

Toutes les donnees ne doivent pas passer par le WS. Trois categories :

### 4.1 Real-time (WebSocket subscription)

**Critere** : donnees user-scoped qui changent suite a des actions (siennes ou d'autres users).

- Positions du user (topic, category, platform, URL)
- Events du user (deposits, redemptions)
- Trust entrant (qui trust ce wallet)
- Trust sortant (qui ce wallet trust)
- Shares par triple

**Subscription Hasura** :
```graphql
subscription UserPositions($account: String!) {
  positions(where: { account_id: { _ilike: $account } }) {
    term_id
    shares
    vault { ... }
  }
}
```

### 4.2 Lazy polling (fetch a la demande, cache long)

**Critere** : donnees global qui interessent le user uniquement quand il les regarde.

- Trending par topic
- Leaderboard
- Claims par topic
- Domain trending
- Activite d'autres users

**Pattern** : `useQuery` classique avec `staleTime: 5min`, fetch on mount, pas de WS.

### 4.3 Quasi-statique (cache agressif)

**Critere** : donnees qui changent rarement et sont partagees par tous les users.

- Taxonomie (topics + categories)
- Platform catalog
- Atom IDs / predicate IDs

**Pattern** : `useQuery` avec `staleTime: 24h`, fetch 1 fois au mount de l'app, persiste.

---

## 5. Stack technique

### 5.1 Librairie WebSocket : `graphql-ws`

- Officielle, maintenue par la Guild
- Supporte le protocole `graphql-transport-ws` (nouveau) + `graphql-ws` legacy
- Reconnect automatique, keep-alive configurable
- Compatible Hasura out-of-the-box
- TypeScript first

```bash
bun add graphql-ws
```

### 5.2 Cache : React Query (existant)

On garde React Query. On ne change rien a l'outil, juste le pattern :

- `staleTime: Infinity` sur les queries alimentees par WS
- `queryClient.setQueryData([key], updater)` appelle depuis le SubscriptionManager
- Le persister existant garde le cache entre sessions

### 5.3 Store optionnel : Zustand

**Pas necessaire** dans un premier temps. React Query fait office de store via son cache. On peut ajouter Zustand plus tard si on a besoin de state derivé qui doit etre partage (ex: status de la connection WS).

### 5.4 Pas d'IndexedDB

Le volume de donnees par user est petit (<100KB), localStorage suffit via le persister React Query.

---

## 6. Architecture detaillee

### 6.1 SubscriptionManager (coeur du systeme)

Fichier : `src/lib/realtime/SubscriptionManager.ts`

```typescript
import { createClient, type Client } from 'graphql-ws'
import type { QueryClient } from '@tanstack/react-query'

export class SubscriptionManager {
  private client: Client | null = null
  private subscriptions = new Map<string, () => void>()
  private queryClient: QueryClient
  private wsUrl: string
  private walletAddress: string | null = null

  constructor(queryClient: QueryClient, wsUrl: string) {
    this.queryClient = queryClient
    this.wsUrl = wsUrl
  }

  connect(walletAddress: string) {
    if (this.walletAddress === walletAddress && this.client) return
    this.disconnect()
    this.walletAddress = walletAddress

    this.client = createClient({
      url: this.wsUrl,
      shouldRetry: () => true,
      retryAttempts: Infinity,
      keepAlive: 10_000,
      // connectionParams pour auth si besoin
      connectionParams: async () => ({
        // headers si besoin
      }),
      on: {
        connected: () => console.log('[WS] connected'),
        closed: (e) => console.log('[WS] closed', e),
        error: (e) => console.error('[WS] error', e),
      },
    })

    this.subscribeAll()
  }

  private subscribeAll() {
    this.subscribePositions()
    this.subscribeEvents()
    this.subscribeTrust()
    // ... autres subs
  }

  private subscribePositions() {
    if (!this.client || !this.walletAddress) return

    const unsub = this.client.subscribe(
      {
        query: `subscription Positions($addr: String!) {
          positions(where: { account_id: { _ilike: $addr } }) {
            term_id
            shares
            vault { term { triple { term_id object_id predicate_id } } }
          }
        }`,
        variables: { addr: this.walletAddress },
      },
      {
        next: (data) => this.onPositionsUpdate(data.data),
        error: (err) => console.error('[WS positions]', err),
        complete: () => console.log('[WS positions] complete'),
      }
    )

    this.subscriptions.set('positions', unsub)
  }

  private onPositionsUpdate(data: any) {
    // Hasura renvoie le state complet a chaque delta.
    // On met a jour toutes les query keys derivees :
    this.queryClient.setQueryData(
      ['positions', this.walletAddress],
      data.positions
    )
    // Derive vers les caches existants :
    this.queryClient.setQueryData(
      ['topic-positions', this.walletAddress],
      derivePositionsByTopic(data.positions)
    )
    // etc.
  }

  disconnect() {
    for (const unsub of this.subscriptions.values()) unsub()
    this.subscriptions.clear()
    this.client?.dispose()
    this.client = null
    this.walletAddress = null
  }
}

// Singleton instancie dans providers.tsx
export let subscriptionManager: SubscriptionManager | null = null
```

### 6.2 Hook d'activation

Fichier : `src/hooks/useRealtimeSync.ts`

```typescript
import { useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { SubscriptionManager } from '@/lib/realtime/SubscriptionManager'

let manager: SubscriptionManager | null = null

const WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL ||
  'wss://mainnet.intuition.sh/v1/graphql'

export function useRealtimeSync() {
  const { ready, authenticated } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const qc = useQueryClient()

  useEffect(() => {
    if (!manager) manager = new SubscriptionManager(qc, WS_URL)
  }, [qc])

  useEffect(() => {
    if (!ready || !authenticated || !wallet?.address || !manager) return
    manager.connect(wallet.address)
    return () => manager?.disconnect()
  }, [ready, authenticated, wallet?.address])
}
```

Monte dans `App.tsx` : un composant invisible `<RealtimeSyncBoundary />` qui appelle le hook.

### 6.3 Fonctions de derivation

Fichier : `src/lib/realtime/derivations.ts`

Convertit les payloads WS bruts vers les shapes attendues par les caches existants :

```typescript
export function derivePositionsByTopic(positions: Position[]) {
  const byTopic = new Map<string, bigint>()
  for (const p of positions) {
    const topicId = p.vault?.term?.triple?.object_id
    if (!topicId) continue
    const slug = ATOM_ID_TO_TOPIC.get(topicId)
    if (!slug) continue
    byTopic.set(slug, (byTopic.get(slug) ?? 0n) + BigInt(p.shares))
  }
  return byTopic
}

export function derivePositionsByPlatform(positions: Position[]) { ... }
export function deriveUserStats(positions: Position[]) { ... }
export function deriveVerifiedPlatforms(positions: Position[]) { ... }
// etc.
```

Chaque derivation feed une query key specifique que les hooks existants consomment.

### 6.4 Migration des hooks existants

**Pattern "strangler fig"** : on garde les hooks existants mais on change leur comportement interne.

Exemple pour `useTopicPositions` :

```typescript
// AVANT : fetch on mount, poll on staleness
export function useTopicPositions(topics: string[]) {
  return useQuery({
    queryKey: ['topic-positions', wallet, topics],
    queryFn: () => getSharesBatch(wallet, topics.map(t => TOPIC_ATOM_IDS[t])),
    staleTime: 2 * 60 * 1000,
    // ...
  })
}

// APRES : lit le cache maintenu par WS, jamais de fetch
export function useTopicPositions(topics: string[]) {
  return useQuery({
    queryKey: ['topic-positions', wallet],  // key simplifiee
    queryFn: () => getSharesBatch(wallet, ALL_TOPIC_TERM_IDS), // seed initial
    staleTime: Infinity,                      // jamais stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => filterTopics(data, topics),  // filtre par topics demandes
  })
}
```

Le hook existe toujours, les composants ne changent pas. Seule la plomberie interne mute.

### 6.5 Invalidation sur action user

Quand le user fait un deposit / redeem / vote, on a deux strategies :

**Strategy A (optimiste)** : on update le cache localement juste apres l'appel, puis le WS confirme.

```typescript
export async function deposit(args: DepositArgs) {
  const tx = await executeDeposit(args)
  
  // Optimistic update : on ajoute la position au cache local
  qc.setQueryData(['positions', wallet], (old) => [
    ...old,
    { term_id: args.termId, shares: args.amount, pending: true },
  ])
  
  const receipt = await waitForReceipt(tx.hash)
  // WS va eventuellement pousser le vrai state indexe
  // Entre-temps, l'UI montre l'optimistic
}
```

**Strategy B (attente WS)** : on attend juste que le WS push l'update (1-3s de latence indexer).

Choix recommande : **A** pour les actions frequentes (deposit, vote), **B** pour les rares (creation d'atomes).

---

## 7. Phases d'implementation

### Phase 1 — Infrastructure (2-3 jours)

1. Installer `graphql-ws`
2. Creer `src/lib/realtime/SubscriptionManager.ts` (squelette, 1 subscription test)
3. Creer `src/hooks/useRealtimeSync.ts`
4. Monter dans `App.tsx` via `<RealtimeSyncBoundary />`
5. Logger tous les events WS dans la console (debug)
6. **Test** : verifier que la connection WS marche sur `mainnet.intuition.sh`
7. **Fallback** : si le WS marche pas, documenter et passer en mode polling

**Deliverable** : WS connecte, une subscription test qui log les positions du user.

### Phase 2 — Cache foundation (3-4 jours)

1. Creer `src/lib/realtime/derivations.ts` avec les fonctions de derivation
2. Ajouter une subscription `positions` qui met a jour plusieurs query keys
3. Tester que le cache React Query se met a jour correctement
4. Ajouter un indicateur visuel de connection WS (pastille verte/rouge dans la UI)

**Deliverable** : positions du user maintenues en temps reel dans le cache.

### Phase 3 — Migration des hooks volatile (5-7 jours)

Migrer un hook a la fois, en commencant par les plus critiques :

1. `useTopicPositions` → lit du cache, pas de fetch
2. `useSignals` → migre (mais la subscription est sur Mastra, pas Hasura)
3. `useUserProfile` → derive des positions
4. `useDiscoveryScore` → derive des events
5. `useTrustCircle` → subscription trust_relationships
6. `useUserActivity` → subscription events

Chaque migration :
- Feature flag `enableRealtimeFor<Hook>` si besoin de rollback
- Test local avec network throttling
- Deploy progressif en prod

**Deliverable** : tous les hooks user-scoped lisent du cache WS.

### Phase 4 — Optimistic updates (2-3 jours)

Ajouter optimistic update sur les actions :

1. `useDeposit` → optimistic add position
2. `useRedeem` → optimistic remove position
3. `useVote` → optimistic update vote count
4. `useTrust` / `useDistrust` → optimistic relationship

**Deliverable** : UI instantanee apres chaque action user.

### Phase 5 — Polish et observabilite (2 jours)

1. Metrics WS : nombre de reconnections, latence, erreurs
2. Fallback HTTP si WS down depuis > 30s (polling 1 fois par minute)
3. Badge "offline" dans la UI si le WS est deconnecte
4. Clean up des feature flags
5. Retrait du polling / refetchOnMount dans les hooks migres

**Deliverable** : systeme production-ready.

### Phase 6 — Nettoyage et stale code (1 jour)

1. Supprimer les hooks maintenant inutilises
2. Supprimer les defaultOptions aggressifs de React Query (staleTime court qu'on avait mis)
3. Retirer les imports `useInterestsHydration` si integre au WS
4. Documentation finale

---

## 8. Migration progressive — ordre precis

### Ordre de migration des hooks (du plus critique au moins)

1. **useTopicPositions** — impact immediat sur "my interests"
2. **useSignals** — scoring reputation (mais subscription sur mastra, different endpoint)
3. **useTrustScore** — composite trust
4. **useDiscoveryScore** — pioneer/explorer/contributor counts
5. **useTrustCircle** — qui le user trust
6. **useUserActivity** — derniers events
7. **useTopClaims** — top URL certifiees
8. **useTopicCertifications** — certifs par topic

### Hooks qui restent en pull

- **useDomainTrending** — global, change lentement, pas besoin WS
- **useDomainClaims** — idem
- **useLeaderboard** — global, recalcul periodique cote serveur
- **useTaxonomy** — static, 1 fetch par session
- **usePlatformCatalog** — static, idem

---

## 9. Strategie de test

### 9.1 Tests unitaires

- `SubscriptionManager` : connect/disconnect/reconnect, gestion des erreurs
- Fonctions de derivation : chaque `derive*()` testee avec des payloads fixtures

### 9.2 Tests integration (manuels en dev)

**Scenario 1 — Happy path**
1. Login, WS connecte, subscription active
2. Faire un deposit depuis une autre session (ou script)
3. Attendu : nouvelle position apparait dans la UI en <1s

**Scenario 2 — Reconnection**
1. Login, WS connecte
2. Couper le reseau 10s
3. Attendu : WS se reconnecte automatiquement, pull un snapshot recent
4. Les donnees restent coherentes

**Scenario 3 — Optimistic + confirmation**
1. Faire un deposit depuis l'UI
2. Attendu : position apparait instantanement (optimistic)
3. 1-3s apres : le WS confirme le vrai state (no-op car deja bon)

**Scenario 4 — Race condition**
1. Faire un deposit
2. Avant que la tx soit minee, faire un redeem sur une autre position
3. Attendu : les deux mises a jour s'ordonnancent correctement, pas de state inconsistent

**Scenario 5 — Fallback**
1. Forcer WS a echouer (URL invalide en dev)
2. Attendu : apres 30s de retry, fallback sur polling HTTP
3. Badge "offline" visible
4. Les features degradees mais rien ne crash

### 9.3 Tests de charge

- Simuler 100 positions sur un wallet → tous les composants doivent rester fluides
- Simuler 1000 events cumules → derivation doit prendre <50ms

---

## 10. Risques et mitigations

| Risque | Probabilite | Impact | Mitigation |
|---|---|---|---|
| Kong ne laisse pas passer le WS upgrade | Moyenne | Bloquant | Contacter Intuition, ou endpoint alternatif, ou fallback polling |
| Charge backend trop elevee avec N users simultanes | Basse | Moyen | Subscription par wallet, pas par topic. Hasura supporte 10k+ WS |
| Disconnections frequentes | Moyenne | Bas | `graphql-ws` gere le reconnect, badge offline, polling fallback |
| Race condition cache vs WS vs action | Moyenne | Moyen | Tests integration + invariants (shares >= 0, etc.) |
| Memory leak via subscriptions jamais nettoyees | Basse | Haut | useEffect cleanup strict, tests avec React DevTools Profiler |
| Indexer lag (WS pousse state de y a 5s) | Certaine | Bas | Afficher "syncing..." si delta observe |
| Schema subscription != schema query | Basse | Moyen | Valider avec l'equipe Intuition les shapes des subs |
| Browser limite les WS (IE11, Safari vieux) | Quasi-nulle | Bas | Fallback polling automatique |

### Risque bloquant #1 : Kong + WS

Le test curl a montre que Kong 3.9.1 est devant Hasura. Kong supporte le WebSocket upgrade mais doit etre **explicitement configure** (`ws=true` dans la route service).

**Action prealable** : verifier avec `wscat -c wss://mainnet.intuition.sh/v1/graphql -s graphql-transport-ws`. Si connection refusee, contacter l'equipe Intuition pour activer le WS upgrade sur la route `/v1/graphql`.

Si impossibles a activer → **plan B** : deployer un proxy WS dedie (sur mastra Phala ou un autre VPS Coolify) qui fait la bridge HTTP↔WS vers Hasura en interne.

---

## 11. Questions ouvertes

1. **Auth** : est-ce que Hasura demande un token pour les subscriptions ? Si oui, quelle strategie ? (Admin secret cote client = non. JWT via Privy = oui peut-etre.)
2. **Multi-onglets** : si le user a 3 onglets ouverts, on ouvre 3 WS ou on partage via BroadcastChannel ? Simplest : un par onglet, negligeable.
3. **Scoping des subs** : on subscribe globalement par wallet, ou par topic ? Globalement, plus simple, volume ok.
4. **Mastra signals** : les metrics de plateformes viennent de Mastra, pas Hasura. Est-ce qu'on les met en WS aussi ou on garde le polling actuel ? Pour V1, on garde le polling (1h staleTime deja).
5. **Cross-user data** : si on affiche le profil de quelqu'un d'autre (view-as), est-ce qu'on ouvre une subscription pour lui aussi ? Non. Le view-as reste pull.

---

## 12. Metrics de succes

Apres deploy complet, on devrait observer :

- **Requetes HTTP par session** : divise par 10
- **Latence UI apres action** : <500ms (vs 2-10s avant)
- **Taux d'erreurs 429** : 0
- **Temps "flash empty"** : 0 (cache persiste via WS)
- **Engagement** : measurable via retention 7j (hypothese : +15-20% car UX plus reactive)

---

## 13. Calendrier indicatif

| Phase | Duree | Cumul |
|---|---|---|
| 1. Infrastructure | 3 j | 3 j |
| 2. Cache foundation | 4 j | 7 j |
| 3. Migration hooks | 7 j | 14 j |
| 4. Optimistic updates | 3 j | 17 j |
| 5. Polish | 2 j | 19 j |
| 6. Nettoyage | 1 j | 20 j |

**Total : ~4 semaines** en solo. Peut etre compresse a 2 semaines avec 2 devs en parallele (un sur l'infra + hooks, l'autre sur derivations + tests).

---

## 14. Prerequis avant demarrage

- [x] **Confirmer que Kong laisse passer le WS upgrade** — VALIDE le 18 avril 2026
- [x] **Confirmer le protocole supporte** — `graphql-transport-ws` fonctionne
- [ ] Obtenir le schema GraphQL Hasura a jour (pour typer les subscriptions)
- [ ] Clarifier l'auth subscriptions avec l'equipe Intuition
- [ ] Valider le plan avec l'equipe avant d'attaquer la Phase 1

### Preuve empirique du support WS

Test effectue avec wscat :
```
$ wscat -c wss://mainnet.intuition.sh/v1/graphql -s graphql-transport-ws
Connected (press CTRL+C to quit)
< {"type":"ping","payload":{"message":"keepalive"}}
Disconnected (code: 4408, reason: "Connection initialisation timed out")
```

Analyse :
- `Connected` → le WS upgrade passe Kong ✅
- `{"type":"ping"}` → Hasura envoie ses keepalives du protocole graphql-transport-ws ✅
- `Disconnected 4408` → normal, wscat n'envoie pas le `connection_init` obligatoire du protocole dans les premieres secondes → Hasura timeout. Un vrai client `graphql-ws` envoie ce message en premier.

**Conclusion** : infrastructure WS 100% fonctionnelle, on peut demarrer la Phase 1.

---

## 15. Annexe — exemple concret

### Avant (actuel)

Un user ouvre /profile :
```
Timeline :
t+0ms   : Page mount. 8 composants montent leurs useQuery.
t+100ms : Privy ready, wallet dispo.
t+150ms : Les 8 queries fire en parallele (dont 3 sur mainnet.intuition.sh)
t+500ms : Premieres reponses arrivent.
t+800ms : Toutes les queries resolues, UI stabilisee.
t+60s   : staleTime des queries expire.
t+65s   : User switch d'onglet, revient. refetchOnWindowFocus → les 3 queries refire.
t+120s  : User clic "deposit" → tx, puis on doit attendre staleTime + refetch pour voir la nouvelle position.
```

### Apres (realtime)

Meme scenario :
```
Timeline :
t+0ms   : Page mount. Composants montent leurs useQuery avec staleTime=Infinity.
t+0ms   : Cache rehydrate depuis localStorage → UI affiche instantanement.
t+100ms : Privy ready, wallet dispo.
t+100ms : SubscriptionManager.connect(wallet) → ouvre WS, fire subscriptions.
t+200ms : WS recoit le snapshot initial → setQueryData → composants re-renderent avec data fraiche.
t+60s   : Rien ne se passe, staleTime=Infinity.
t+60s   : User switch d'onglet → rien ne refire (refetchOnWindowFocus=false).
t+120s  : User clic "deposit" → optimistic update (instantane) + tx.
t+123s  : WS push la vraie position indexee → reconcile avec l'optimistic.
```

**Gain : UI instantanee, zero 429, zero flash empty, real-time cross-user.**
