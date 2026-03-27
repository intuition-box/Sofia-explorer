# Plan Responsive — Sofia Explorer

## Analyse Graphique Actuelle

```
DESKTOP (état actuel — layout fixe ~1200px+ minimum)
┌──────────────────────────────────────────────────────────────┐
│  HEADER (sticky, h-14, zoom 1.25)                            │
│  [Logo] [Search...............] [Cart][Home][Bell][Theme][👤] │
├──────────┬────────────────────────────────┬──────────────────┤
│ SIDEBAR  │       MAIN CONTENT             │  RIGHT SIDEBAR   │
│ 320px    │   margin-left: 262px           │    320px fixed   │
│ fixed    │   margin-right: 262px          │                  │
│          │   zoom: 1.25                   │    - Top Reps    │
│ - Nav    │                                │    - Trending    │
│ - Quick  │   Feed / Profile / etc.        │    - Activity    │
│ - Topics │                                │                  │
│ - EthCC  │                                │                  │
│ - Season │                                │                  │
└──────────┴────────────────────────────────┴──────────────────┘
```

### Problèmes identifiés

1. **Sidebars fixes 320px** — pas de rétraction possible, mangent 640px de l'écran
2. **`zoom: 1.25`** partout — aggrave le problème, le layout réel demande ~1500px minimum
3. **`margin-left/right: 262px`** en dur — le contenu ne peut pas s'étendre
4. **Aucun media query** sauf landing page (640px pour le grid)
5. **Aucun mécanisme hamburger/toggle** pour les sidebars
6. **Header** : la barre de recherche + tous les boutons débordent sous ~900px
7. **Grids internes** (`auto-fill, minmax(150-200px, 1fr)`) sont déjà semi-responsives mais les margins fixes les empêchent de profiter de l'espace

---

## Breakpoints

| Breakpoint | Cible | Layout |
|---|---|---|
| `>= 1280px` (xl) | Desktop | Layout actuel, 2 sidebars visibles |
| `1024-1279px` (lg) | Laptop / petit écran | Left sidebar rétractable, right sidebar cachée |
| `768-1023px` (md) | Tablette | Les 2 sidebars cachées, header compact |
| `< 768px` (sm) | Mobile | Full mobile, hamburger menu, pas de zoom |

---

## Phase 1 — Infrastructure responsive (fondations)

### 1.1 — Hook `useMediaQuery` + state sidebar
- Créer un hook `useMediaQuery` basé sur `window.matchMedia` (pas de resize polling)
- Créer un hook `useSidebarState` qui gère `leftOpen`, `rightOpen`, `isMobile`, `isTablet`
- State remonté dans `App.tsx` pour coordonner Header / Sidebar / RightSidebar / Main

### 1.2 — Supprimer le `zoom: 1.25` conditionnel
- Sur mobile/tablette : `zoom: 1` (le zoom 1.25 est catastrophique sur petit écran)
- Sur desktop : garder le zoom actuel

### 1.3 — Modifier `layout.css` avec media queries
```css
/* Mobile */
@media (max-width: 767px) {
  .main-content { margin-left: 0; margin-right: 0; padding-top: 48px; }
}
/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .main-content { margin-left: 0; margin-right: 0; }
}
/* Laptop */
@media (min-width: 1024px) and (max-width: 1279px) {
  .main-content { margin-left: 0; margin-right: 0; }
  .main-content.sb-open { margin-left: 262px; }
}
```

### Fichiers concernés
- Nouveau : `src/hooks/useMediaQuery.ts`
- `src/App.tsx`
- `src/components/styles/layout.css`

---

## Phase 2 — Left Sidebar rétractable

### 2.1 — Drawer mode
- Sur mobile/tablette : la sidebar devient un **drawer** (position fixed, overlay sombre, slide-in depuis la gauche)
- Sur laptop : sidebar toggle avec un bouton hamburger dans le header
- Transition CSS : `transform: translateX(-100%)` quand fermée

### 2.2 — Modifier `Sidebar.tsx`
- Accepter `isOpen` et `onClose` en props
- Ajouter un backdrop clickable pour fermer
- Fermeture auto sur navigation (route change)

### 2.3 — Bouton hamburger dans `Header.tsx`
- Visible uniquement sous 1280px
- Icône `Menu` / `X` de lucide-react

### Fichiers concernés
- `src/components/Sidebar.tsx`
- `src/components/styles/sidebar.css`
- `src/components/Header.tsx`

---

## Phase 3 — Right Sidebar rétractable

### 3.1 — Même pattern que la left sidebar
- Sur < 1280px : cachée par défaut
- Accessible via un bouton dans le header (ou swipe gesture)
- Le `ProfileDrawer` et `CartDrawer` existants prennent déjà sa place sur profile/cart — on garde ce comportement

### 3.2 — Modifier `RightSidebar.tsx`
- Props `isOpen` / `onClose`
- Drawer depuis la droite sur mobile/tablette

### Fichiers concernés
- `src/components/RightSidebar.tsx`
- `src/components/styles/layout.css`

---

## Phase 4 — Header responsive

### 4.1 — Mobile header
```
┌─────────────────────────────┐
│ [☰] [Logo Sofia] [🔔][👤]  │
└─────────────────────────────┘
```
- Recherche cachée dans un expandable (icône loupe qui ouvre un champ plein écran)
- Boutons secondaires (Home, Theme) migrés dans le menu hamburger
- Cart badge reste visible

### 4.2 — Tablette header
```
┌──────────────────────────────────────┐
│ [☰] [Logo] [Search........] [🔔][👤]│
└──────────────────────────────────────┘
```

### Fichiers concernés
- `src/components/Header.tsx`
- `src/components/styles/header.css`

---

## Phase 5 — Contenu principal responsive

### 5.1 — Feed / Dashboard
- Les cards Post sont déjà flex, vérifier qu'elles font `width: 100%` sur mobile

### 5.2 — Grids (platforms, interests, niches)
- Les `minmax()` existants fonctionneront une fois les margins fixes supprimées
- Ajuster les minimums sur mobile (ex: `minmax(120px, 1fr)`)

### 5.3 — Profile page
- Le `ProfileHeader` et les tabs doivent passer en layout vertical sur mobile

### 5.4 — Modals / Drawers
- Les `Dialog` et `Drawer` Radix sont déjà responsifs, vérifier les largeurs fixes

### Fichiers concernés
- CSS des grids (`interests.css`, `platforms.css`, etc.)
- `src/components/profile/ProfileHeader.tsx`
- Composants Dialog/Modal avec largeurs en dur

---

## Phase 6 — Polish

- Transitions fluides pour l'ouverture/fermeture des sidebars
- `body overflow: hidden` quand un drawer est ouvert sur mobile
- Test des touch events (swipe to close sidebar)
- Ajuster les font-sizes sur mobile si nécessaire

---

## Ordre d'exécution recommandé

| Étape | Effort | Impact |
|---|---|---|
| Phase 1 (infra) | Moyen | Prérequis pour tout |
| Phase 2 (left sidebar) | Moyen | Gros impact visuel |
| Phase 4 (header) | Moyen | Critique pour mobile |
| Phase 3 (right sidebar) | Faible | Déjà semi-géré |
| Phase 5 (contenu) | Faible-Moyen | Finition |
| Phase 6 (polish) | Faible | UX finale |

## Fichiers principaux à modifier

- `src/App.tsx` — orchestration state sidebar
- `src/components/styles/layout.css` — media queries
- `src/components/Header.tsx` — hamburger + responsive
- `src/components/Sidebar.tsx` — drawer mode
- `src/components/RightSidebar.tsx` — drawer mode
- `src/components/styles/header.css` — responsive header
- `src/components/styles/sidebar.css` — transitions
- Nouveau : `src/hooks/useMediaQuery.ts`
