---
name: qa-haiti
description: Skill QA spécialisé pour les contraintes haïtiennes. Tests de performance sur connexion 3G, tests d'accessibilité vocale volet Fondation, simulation Android bas de gamme, et validation multi-tenant.
---

# QA Haïti — Konprann Skill

## Configuration Playwright pour Tests E2E

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Desktop Web
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Mobile Android (priorité Haïti)
    { name: 'android-low-end', use: {
        ...devices['Pixel 4'],
        // Simuler connexion 3G haïtienne
        launchOptions: {
          args: ['--throttle-cpu=4'],
        },
    }},
  ],
  use: {
    // Réseau 3G : 750kbps down, 250kbps up, 200ms latence
    networkThrottling: { download: 750_000, upload: 250_000, latency: 200 },
    baseURL: process.env.STAGING_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  // Timeout généreux pour 3G haïtienne
  timeout: 30_000,
  expect: { timeout: 10_000 },
});
```

## Scénarios de Test — Volet Excellence

```typescript
// tests/excellence/tutor.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tuteur IA — Volet Excellence', () => {

  test('réponse avec source en moins de 4 secondes (3G)', async ({ page }) => {
    await page.goto('/excellence/tutor');
    const start = Date.now();
    await page.fill('[data-testid="question-input"]', 'Explique la photosynthèse');
    await page.click('[data-testid="ask-button"]');
    await page.waitForSelector('[data-testid="tutor-response"]');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(4000);

    // Vérifier la source
    const sourceEl = page.locator('[data-testid="response-source"]');
    await expect(sourceEl).toBeVisible();
    const sourceText = await sourceEl.textContent();
    expect(sourceText).toMatch(/page \d+/i);
  });

  test('les 4 modes d\'explication fonctionnent', async ({ page }) => {
    for (const mode of ['academique', 'creole', 'analogie', 'schema']) {
      await page.click(`[data-testid="mode-${mode}"]`);
      await page.fill('[data-testid="question-input"]', 'Qu\'est-ce que la mitose?');
      await page.click('[data-testid="ask-button"]');
      await page.waitForSelector('[data-testid="tutor-response"]');
      const badge = page.locator('[data-testid="mode-badge"]');
      await expect(badge).toHaveText(mode, { ignoreCase: true });
    }
  });

  test('isolation multi-tenant — école A ne voit pas école B', async ({ page, request }) => {
    // Connexion élève école A
    const tokenA = await loginStudent(request, 'student-school-a@test.ht');
    // Tenter d'accéder à une ressource de l'école B
    const res = await request.get('/api/v1/schools/school-b-id/resources', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    expect(res.status()).toBe(403);
  });

  test('simulation examen d\'État — format officiel respecté', async ({ page }) => {
    await page.goto('/excellence/quiz/simulation');
    // Vérifier le minuteur
    await expect(page.locator('[data-testid="exam-timer"]')).toBeVisible();
    // Vérifier le nombre de questions selon le niveau
    const questions = page.locator('[data-testid="question-item"]');
    await expect(questions).toHaveCount(await getExpectedQuestionCount('NS3'));
    // Vérifier qu'on ne peut pas revenir en arrière (format examen réel)
    await page.click('[data-testid="next-question"]');
    await expect(page.locator('[data-testid="prev-question"]')).toBeDisabled();
  });
});
```

## Scénarios de Test — Volet Fondation

```typescript
// tests/fondation/vocal-navigation.spec.ts
test.describe('Navigation Vocale — Volet Fondation', () => {

  test('navigation complète sans lire de texte', async ({ page }) => {
    await page.goto('/fondation');
    // Vérifier que toutes les zones tactiles sont ≥ 64x64px
    const buttons = page.locator('[role="button"], button');
    for (const button of await buttons.all()) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.width, `Bouton trop petit: ${await button.textContent()}`).toBeGreaterThanOrEqual(64);
        expect(box.height, `Bouton trop petit: ${await button.textContent()}`).toBeGreaterThanOrEqual(64);
      }
    }
  });

  test('feedback Manman Marie jamais négatif', async ({ page, request }) => {
    // Simuler une mauvaise réponse phonétique
    const response = await request.post('/api/v1/fondation/phoneme/evaluate', {
      data: { audio: 'bad_pronunciation_sample', target: 'kay', score: 0.3 }
    });
    const feedback = await response.json();
    // Vérifier aucun mot interdit
    const FORBIDDEN = ["Mal", "Faux", "Incorrect", "Non", "Erreur", "Wòng"];
    for (const word of FORBIDDEN) {
      expect(feedback.message).not.toContain(word);
    }
    // Vérifier présence d'encouragement
    expect(feedback.message).toMatch(/Prèske|Eseye ankò|ou ka fè sa/i);
  });

  test('mode hors-ligne — leçon disponible sans connexion', async ({ page, context }) => {
    // Télécharger une leçon
    await page.goto('/fondation/lessons/lesson-1');
    await page.click('[data-testid="download-lesson"]');
    await page.waitForSelector('[data-testid="download-complete"]');
    // Couper la connexion
    await context.setOffline(true);
    // Vérifier que la leçon fonctionne encore
    await page.reload();
    await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="audio-play"]')).toBeEnabled();
  });
});
```

## Tests de Performance — Seuils Haïti

```typescript
// tests/performance/haiti-3g.spec.ts
test.describe('Performance sur connexion 3G haïtienne', () => {
  const SEUILS = {
    pageAccueil: 3000,       // ms
    reponseTuteur: 4000,     // ms
    demarrageAudio: 1000,    // ms — Manman Marie doit parler vite
    chargementLecon: 5000,   // ms
    soumissionQuiz: 2000,    // ms
  };

  test(`page d'accueil < ${SEUILS.pageAccueil}ms`, async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(Date.now() - start).toBeLessThan(SEUILS.pageAccueil);
  });

  test(`démarrage audio Manman Marie < ${SEUILS.demarrageAudio}ms`, async ({ page }) => {
    await page.goto('/fondation/lesson/1');
    const start = Date.now();
    await page.click('[data-testid="play-manman-marie"]');
    await page.waitForFunction(() => {
      const audio = document.querySelector('audio');
      return audio && !audio.paused;
    });
    expect(Date.now() - start).toBeLessThan(SEUILS.demarrageAudio);
  });
});
```

## Checklist de Validation Avant Déploiement Production

```markdown
## QA Gate — Pré-Production

### Sécurité Multi-Tenant
- [ ] Tests d'isolation école A / école B passants
- [ ] Aucune donnée d'une école visible depuis une autre
- [ ] Validation des rôles sur tous les endpoints sensibles

### Performance 3G Haïti
- [ ] Page d'accueil < 3s
- [ ] Réponse Tuteur IA < 4s
- [ ] Audio Manman Marie démarre < 1s
- [ ] App mobile < 10MB au téléchargement initial

### Volet Fondation — Accessibilité
- [ ] Navigation complète sans texte validée
- [ ] Toutes zones tactiles ≥ 64x64px
- [ ] Feedback Manman Marie 100% bienveillant
- [ ] Mode hors-ligne fonctionnel pour les leçons téléchargées

### Tests de Régression
- [ ] Suite E2E complète passante sur staging
- [ ] Aucune régression sur les modules existants
- [ ] Logs sans erreurs critiques depuis 24h sur staging

### Données
- [ ] Aucune donnée personnelle dans les logs
- [ ] Classements communautaires anonymes confirmés
- [ ] Sauvegardes PostgreSQL vérifiées
```
