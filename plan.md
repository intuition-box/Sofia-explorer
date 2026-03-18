# Plan: Redesign My Profile Page

## Context
La page Profile actuelle utilise un systeme de 5 onglets (overview/interests/niches/platforms/scores) dans un seul composant. L'objectif est de la transformer en une page inspiree du design Coursue avec :
- Un **Profile Drawer** (panneau droit glissant comme CartDrawer) pour les details profil
- Une **page Profile** redesignee avec Last Activity + Interests Grid
- Une **page par Interest** (`/profile/interest/:domainId`) avec trending, stats, platforms, et votes par domaine

## Architecture

```
Services (new)                    Hooks (new)                    Components (new)
domainActivityService.ts    -->   useUserActivity.ts        -->  LastActivitySection.tsx
domainTrendingService.ts    -->   useDomainTrending.ts      -->  InterestsGrid.tsx
domainDebateService.ts      -->   useDomainClaims.ts        -->  ProfileDrawer.tsx
                                                                  InterestPage.tsx
```

---

## Phase 1 — Profile Drawer

### Fichiers a creer
- `src/components/ProfileDrawer.tsx` — Panneau droit fixe (meme pattern que CartDrawer)
  - Avatar, wallet/ENS, stats (domains, niches, platforms, certifications)
  - Quick links vers sections profil
- `src/components/styles/profile-drawer.css` — Copie du pattern `cart-drawer.css` (fixed right, 400px, z-index 9999)

### Fichiers a modifier
- `src/App.tsx` — Ajouter state `profileDrawerOpen`, render `<ProfileDrawer />`
- `src/components/Header.tsx` — Ajouter prop `onProfileClick` pour trigger le drawer

### Data flow
```
usePrivy() → address
useEnsNames([address]) → display, avatar
useDiscoveryScore(address) → certifications, badges
useDomainSelection() → domain/niche counts
usePlatformConnections() → connected count
  → ProfileDrawer (presentation)
```

---

## Phase 2 — Services & Hooks

### Nouveaux services
- `src/services/domainActivityService.ts`
  - `filterItemsByUser(items, address)` — filtre par certifierAddress
  - Reutilise `fetchAllActivity` existant + filtre cote client

- `src/services/domainTrendingService.ts`
  - `fetchTrendingByDomain(domainId)` — wrap `trendingService` + filtre par platforms du domaine
  - Utilise `getPlatformsByDomain()` de `platformCatalog.ts`

- `src/services/domainDebateService.ts`
  - `fetchDomainClaims(domainId)` — wrap `fetchDebateClaims()` + filtre par domaine
  - Initialement retourne tous les claims (pas encore de claims par domaine dans la config)

### Nouveaux hooks
- `src/hooks/useUserActivity.ts` — appelle `fetchAllActivity` + `filterItemsByUser`
- `src/hooks/useDomainTrending.ts` — appelle `fetchTrendingByDomain(domainId)`
- `src/hooks/useDomainClaims.ts` — appelle `fetchDomainClaims(domainId)`

---

## Phase 3 — Redesign ProfilePage

### Fichiers a creer
- `src/components/profile/LastActivitySection.tsx`
  - Grille 2 colonnes reutilisant `CircleCard` et `QuestCard`
  - Limite a 6 items + lien "View all"

- `src/components/profile/InterestsGrid.tsx`
  - Grille de cards par domaine selectionne
  - Chaque card : icone, label, couleur, nombre de niches, score
  - `onClick → navigate('/profile/interest/:domainId')`

### Fichiers a modifier
- `src/pages/ProfilePage.tsx` — Remplacement complet du contenu :
  - Garder `ProfileHeader` + `ShareProfileModal`
  - Supprimer le state machine `view` (overview/interests/niches/platforms/scores)
  - Sections : `LastActivitySection` → `InterestsGrid`
  - Les anciens sous-composants (DomainSelector, NicheSelector, PlatformGrid, ScoreView) restent accessibles via InterestPage ou boutons "Edit"

---

## Phase 4 — Interest Page (nouvelle route)

### Fichiers a creer
- `src/pages/InterestPage.tsx` — Route `/profile/interest/:domainId`
  - `PageHeader` avec couleur du domaine
  - Section trending (top items du domaine)
  - Section stats user (score, niches, platforms connectees dans ce domaine)
  - Section platforms (filtre de `PLATFORM_CATALOG` par `targetDomains`)
  - Section vote (claims du domaine, reutilise le pattern UI de `VotePage`)
  - Bouton retour vers `/profile`

- `src/components/styles/interest-page.css`

### Fichiers a modifier
- `src/App.tsx` — Ajouter `<Route path="/profile/interest/:domainId" element={<InterestPage />} />`
- `src/config/pageColors.ts` — Ajouter entree dynamique pour interest pages

---

## Composants existants reutilises
- `CircleCard` / `QuestCard` — dans LastActivitySection
- `ProfileHeader` — en haut de ProfilePage
- `ShareProfileModal` — partage profil
- `Badge`, `Card`, `Button` — shadcn/ui
- Pattern `CartDrawer` — pour ProfileDrawer
- Pattern `VotePage` — pour section vote dans InterestPage
- `TrendingPages` pattern — pour trending par domaine

## Donnees existantes reutilisees
- `DOMAIN_BY_ID`, `getPlatformsByDomain()` — taxonomy.ts
- `PLATFORM_CATALOG`, `PLATFORM_BY_ID` — platformCatalog.ts
- `useReputationScores()` — scores par domaine deja calcules
- `useDomainSelection()` — domaines/niches selectionnes (localStorage)
- `usePlatformConnections()` — status connexion par plateforme
- `useDiscoveryScore()` — stats globales user

---

## Ordre d'implementation
1. ProfileDrawer (CSS + composant + branchement App/Header)
2. Services (domainActivityService, domainTrendingService, domainDebateService)
3. Hooks (useUserActivity, useDomainTrending, useDomainClaims)
4. LastActivitySection + InterestsGrid
5. Rewrite ProfilePage
6. InterestPage + route + pageColors

## Verification
- Ouvrir `/profile` → voir Last Activity (feed filtre user) + Interests Grid
- Cliquer sur un domaine → naviguer vers `/profile/interest/:domainId`
- Interest page affiche trending, stats, platforms, votes pour ce domaine
- Header → cliquer profil → ProfileDrawer s'ouvre a droite
- Drawer se ferme au clic X ou clic exterieur
- Dark/light mode fonctionne sur tous les nouveaux composants
