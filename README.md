# Bekasen — Agence Digitale Premium

Site portfolio multilingue pour **Bekasen**, agence digitale premium au service des entreprises haïtiennes et de la diaspora.

## Tech Stack

- **Framework** : Next.js 16 (App Router, Turbopack)
- **UI** : React 19, TypeScript 5
- **Styling** : Tailwind CSS v4
- **Animations** : Framer Motion 12
- **i18n** : next-intl — 4 langues : Français (défaut), English, Kreyòl Ayisyen, Español
- **Thème** : next-themes (dark mode par défaut)
- **Icônes** : Lucide React
- **Polices** : Syne (titres), Inter (corps)

## Structure du projet

```
app/[locale]/       — Pages (App Router avec segment locale)
components/         — Composants React réutilisables
messages/           — Fichiers de traduction (fr.json, en.json, ht.json, es.json)
i18n/               — Configuration next-intl (routing, request, navigation)
public/             — Assets statiques
```

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start
```

## Locales

| Code | Langue           |
|------|------------------|
| `fr` | Français (défaut)|
| `en` | English          |
| `ht` | Kreyòl Ayisyen   |
| `es` | Español          |

## Licence

Privé — © Bekasen. Tous droits réservés.
