import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const shots = '/opt/cursor/artifacts/screenshots/geo-meteo';

test.beforeAll(async () => {
  await mkdir(shots, { recursive: true });
});

test.describe('Géo météo satellite — 390 clair', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    colorScheme: 'light',
  });

  test('accueil : consentement de position', async ({ page, context }) => {
    await context.clearPermissions();
    await page.addInitScript(() => {
      localStorage.setItem('edzii-theme', 'light');
      localStorage.removeItem('edzii-geo-consent');
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Partager ma position pour voir le risque/ })).toBeVisible();
    await page.locator('.local-risk').screenshot({ path: `${shots}/accueil-consentement.png` });
    await page.screenshot({ path: `${shots}/accueil.png`, fullPage: true });
  });

  test('accueil : position accordée montre le secteur', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 6.136, longitude: 1.229, accuracy: 8 });
    await page.addInitScript(() => {
      localStorage.setItem('edzii-theme', 'light');
      localStorage.removeItem('edzii-geo-consent');
    });
    await page.goto('/');
    await page.getByRole('button', { name: /Partager ma position pour voir le risque/ }).click();
    await expect(page.locator('.local-risk')).toContainText(/Bè-Kpota|hors zone|Risque près de chez vous/i, { timeout: 12_000 });
    await page.locator('.local-risk').screenshot({ path: `${shots}/accueil-risque.png` });
  });

  test('signaler : Position et coller un lien', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 6.1328, longitude: 1.2342, accuracy: 7 });
    await page.addInitScript(() => localStorage.setItem('edzii-theme', 'light'));
    await page.goto('/signaler');
    await page.getByRole('button', { name: /Continuer sans photo/ }).click();
    await expect(page.getByRole('heading', { name: /Où est l’eau/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Position' })).toBeVisible();
    await expect(page.getByLabel('Coller un lien')).toBeVisible();
    await page.getByLabel('Coller un lien').fill('6.1328, 1.2342');
    await expect(page.getByText('6.13280, 1.23420')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: `${shots}/signaler-lien.png`, fullPage: true });
    await expect(page.locator('.map-basemap button[aria-pressed="true"]')).toHaveText('Satellite');
  });

  test('carte : satellite sélectionné par défaut', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('edzii-theme', 'light'));
    await page.goto('/carte');
    const satellite = page.locator('.map-basemap button', { hasText: 'Satellite' });
    await expect(satellite).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.map-frame')).toHaveAttribute('data-basemap', 'satellite');
    await page.locator('.map-frame').screenshot({ path: `${shots}/carte-satellite.png` });
    await page.screenshot({ path: `${shots}/carte.png`, fullPage: true });
  });

  test('admin : connexion démo puis signes météo si API', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('edzii-theme', 'light'));
    await page.goto('/connexion?suite=admin');
    await page.screenshot({ path: `${shots}/connexion-admin.png`, fullPage: true });
    const submit = page.getByRole('button', { name: /Se connecter|Connexion/i }).first();
    if (await submit.isVisible()) {
      await submit.click();
    }
    await page.waitForTimeout(1500);
    if (page.url().includes('/admin')) {
      await page.goto('/admin/alertes');
      await expect(page.getByRole('tab', { name: 'Orage' })).toBeVisible({ timeout: 8000 });
      await expect(page.getByRole('tab', { name: 'Forte pluie' })).toBeVisible();
      await page.screenshot({ path: `${shots}/admin-signes-meteo.png`, fullPage: true });
    }
  });
});
