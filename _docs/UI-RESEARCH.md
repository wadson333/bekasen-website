# Bekasen — UI Research Walkthrough

> Ce document est mis à jour à chaque session de recherche UI avant l'implémentation d'un composant.
> Il suit le processus de recherche défini dans l'agent `bekasen-dev`.

## Recherche effectuée le 2025-07-12

**Composant / Page ciblé(e)** : Hero (composant principal)
**Objectif** : Améliorer le design du Hero — corriger les violations i18n, animer les orbs de fond, ajouter un effet texte mot-par-mot, supprimer les styles inline, ajouter un indicateur de scroll.

---

## 1. Sources d'inspiration

Références visuelles collectées sur Pinterest (Dribbble bloqué par WAF).

| # | Source | Style visuel | Notes |
|---|--------|-------------|-------|
| 1 | Pinterest | Purple/dark agency — "Pumpkin Modern Creative Agency Framer Template" | Fond sombre, accents violet/gradient, layout centré, typographie bold |
| 2 | Pinterest | "Unfair Advantage" design purple/noir | Gradient violet intense, text glow, hero plein écran |
| 3 | Pinterest | TechVerse hero sections | Dark mode avec orbs de couleur animés, grid overlay subtil |
| 4 | Pinterest | "Build brands that win in the digital era" | CTA gradient, badge en haut, stats en dessous du CTA |
| 5 | Pinterest | Purple gradient dark theme designs (multiples) | Motif récurrent : fond noir + gradient purple/indigo, blur, glass morphism |

**Tendances observées** : Fond noir profond avec des orbs/blobs de couleur flottants (purple + indigo), badge "glass" en haut, titre bold en 2 lignes (ligne 2 en gradient), stats sous les CTAs, puis des tags de spécialisation. Les meilleurs designs utilisent du mouvement subtil sur les éléments de fond.

---

## 2. Composants & Animations

Découvertes sur Aceternity UI et MagicUI — patterns et animations à adapter.

| Composant | Pattern d'animation | Adaptation Bekasen |
|-----------|--------------------|--------------------|
| Background Gradient Animation (Aceternity) | 5 blobs colorés flottants avec blur, keyframes CSS 20-40s (moveVertical, moveInCircle, moveHorizontal) | Framer Motion `animate` avec y/x/scale en boucle infinie, 3 orbs, durées 20-30s |
| Text Generate Effect (Aceternity) | Texte apparaît mot par mot avec fade-in et un léger blur | Framer Motion `motion.span` par mot, opacity + y + filter blur, stagger 0.08s |
| Animated Gradient Text (MagicUI) | Gradient de couleur qui se déplace sur le texte en boucle | Gardé statique (gradient CSS) — le mot-par-mot suffit pour l'impact |

**Composants aussi repérés** : Aurora Background, Background Beams, Sparkles, Lamp Effect — retenus comme options futures.

**Rappel** : Les composants Aceternity/MagicUI sont shadcn/React — on extrait les **concepts**, on implémente avec Framer Motion + Tailwind CSS v4.

---

## 3. Design System généré

Output du UI/UX Pro Max (`py .github/prompts/ui-ux-pro-max/scripts/search.py`).

### Design System principal

```
PATTERN: Video-First Hero → Adapté en "Animated Background Hero" (orbs animés au lieu de vidéo)
  Conversion: 86% higher engagement
  CTA: Overlay center + bottom section
  Sections: Hero with animated background, Key features overlay, Benefits, CTA

STYLE: Liquid Glass
  Keywords: Flowing glass, morphing, smooth transitions, translucent, animated blur
  Best For: Premium SaaS, luxury portfolios, creative platforms
  Performance: ⚠ Moderate | Accessibility: ⚠ Text contrast → mitigé avec backdrop-blur léger

COLORS: Bekasen brand (inchangé)
  Primary:    #6B21A8 (purple-800)
  Secondary:  #4338CA (indigo-700)
  Accent:     #A855F7 (purple-400)
  Background: #0A0A0F (dark)
  Text:       #FFFFFF / #A1A1AA

TYPOGRAPHY: Syne / Inter (inchangé)

KEY EFFECTS:
  Morphing orbs (Framer Motion), fluid animations (400-600ms curves)
  Dynamic blur (backdrop-filter), smooth color transitions
```

### Anti-patterns identifiés

- [x] ~~Cheap visuals + Fast animations~~ → Animations lentes (20-30s), fluides
- [x] ~~Texte hardcodé~~ → Tout passe par i18n

### Checklist qualité

- [x] Pas d'emojis comme icônes (Lucide React utilisé)
- [x] cursor-pointer sur les éléments cliquables
- [x] Hover states avec smooth transitions (150-300ms)
- [x] prefers-reduced-motion respecté
- [x] Responsive : 375px, 768px, 1024px, 1440px
- [x] Focus states pour navigation clavier
- [x] Contraste texte > 4.5:1

---

## 4. Processus frontend

Checklist basée sur le cycle SpaceO en 6 étapes.

- [x] **Requirements** — Corriger i18n (stats + niches), animer fond, ajouter scroll indicator, supprimer inline styles
- [x] **Design / Prototype** — Recherche UI complète (Pinterest + Aceternity + Pro Max), direction choisie
- [x] **Environnement** — Stack configurée, Framer Motion + next-intl + Tailwind v4 prêts
- [x] **Code** — Composant Hero réécrit, i18n (4 locales), animations Framer Motion, TypeScript strict
- [x] **Test** — Responsivité vérifiée, prefers-reduced-motion respecté, accessibilité checklist
- [x] **Deploy** — Build vérifié, zéro erreurs TypeScript, traductions complètes

---

## Synthèse de recherche

> **Cette section est TOUJOURS la dernière du document.** Elle consolide les décisions prises après analyse de toutes les sources.

### Direction choisie

**"Animated Orbs Dark Hero"** — hero plein écran avec fond sombre, 3 orbs colorés en mouvement lent, badge glassmorphism, titre en 2 lignes (L2 gradient + effet mot-par-mot), stats et niches internationalisés, scroll indicator. Style premium cohérent avec la marque Bekasen et le marché haut de gamme haïtien/diaspora.

### Décisions de design

| Décision | Justification | Source |
|----------|--------------|--------|
| 3 orbs animés (Framer Motion, 20-30s) | Mouvement subtil = premium, pas distrayant | Aceternity Background Gradient Animation + Pinterest |
| Effet texte mot-par-mot sur le subtitle | Impact visuel fort, attire l'attention sur la tagline | Aceternity Text Generate Effect |
| Badge avec backdrop-blur | Effet "glass" subtil, cohérent avec le style Liquid Glass | UI/UX Pro Max |
| Grid overlay en CSS class (pas inline) | Élimine le `style={{}}`, respect des conventions Tailwind | Conventions Bekasen |
| Stats + niches internationalisés | Obligation i18n du projet — 4 locales synchronisées | Copilot Instructions |
| Scroll indicator (ChevronDown animé) | Guide l'utilisateur, pattern standard des hero plein écran | Pinterest / Pro Max |
| prefers-reduced-motion | Accessibilité obligatoire, animations désactivées si préféré | Pro Max checklist |
| Hover micro-interactions sur niche tags | Polish premium, réponse visuelle aux interactions | Pro Max checklist |

### Éléments clés retenus

- Fond sombre (#0A0A0F) + gradient orbs purple/indigo avec blur important
- Typographie Syne bold pour titres, Inter pour le corps — inchangé
- Mobile-first : orbs plus petits sur mobile, texte adapt avec sm:/lg:
- Animations d'entrée staggerées (badge → titre → description → CTAs → stats → niches → scroll)
- Palette de couleurs fidèle au brand : #6B21A8, #A855F7, #4338CA

- **De Dribbble/Pinterest** : [Ce qui a été retenu]
- **De 21st.dev** : [Patterns/animations sélectionnés]
- **Du Design System** : [Recommandations appliquées]

### Points d'attention pour l'implémentation

1. [Point critique 1]
2. [Point critique 2]
3. [Point critique 3]
