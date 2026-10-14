# Dossier de passation : Builder App Pro 2 reprend Edzii-Nku

- Destinataire : Builder App Pro 2 (id 49cb431d-26f5-4e0b-b3a9-d45a5caf5794).
- Agent remplacé : APP BUILDER PRO (id 39b372f9-88ae-4176-b883-cb110dbfab0c), qui ne répond plus.
- Client : Chaminade Dondah Adjolou (Lomé, Togo), GitHub **Donchaminade**. Il faut lui parler en **français**.
- Rédigé le 14/10/2026. **Règle du dossier :** rien n'y est inventé. Ce qui n'a pas pu être vérifié est marqué **INCONNU**.

---

## 0. Ce qui était accessible (et ce qui ne l'était pas)

| Source | Résultat |
|---|---|
| Transcript d'APP BUILDER PRO (ReadTranscript) | **INCONNU.** L'outil n'est pas disponible dans cette session, et la table locale `transcript_entries` de l'agent est vide (0 entrée). |
| Skills `/home/box/agent-data/workflows` | Le dossier est **vide**. |
| Mémoire partagée (RecallMemory) | L'outil n'est pas disponible. J'ai lu à la place `user-memory/by-agent/39b372f9…/profile.md` (voir §1.6). |
| Profil de l'agent | « Assistant full stack : apps, sites, repos GitHub, déploiements Vercel, sécurité, CI/CD et automatisation. » Titre : Full Stack Builder. |
| `/workspace/togosaas` (clone git) | Lu : README, CONTRIBUTING, SECURITY, CSS, composants. |
| GitHub `user:Donchaminade` | 136 dépôts au total, dont 100 listés ici. |
| Sites déployés | Consultés : togo-communities-hub.vercel.app et togosaas.vercel.app. |

---

## 1. Savoir-faire et habitudes (d'après les dépôts réels)

### 1.1 Stacks habituelles
- **Web :** React 19, TypeScript ~5.8, Vite 6, React Router 7, Tailwind CSS v4 (`@tailwindcss/vite`), et lucide-react pour les icônes. C'est la stack commune à `togosaas` et `togo-communities-hub`. La majorité de ses dépôts récents sont en TypeScript et déployés sur Vercel.
- **Mobile :** Flutter/Dart, avec de nombreux dépôts (donziky, AiOne-app, akontaa_v2, CoachFlow, CredHub, gozprez, 48laws…). Il a aussi un projet Kotlin, `soutiensur`, une app de signalement de VBG.
- **Backend :**
  - PHP 8 avec un routeur maison, JWT HS256 et PDO/MySQL (TogoSaaS, conseilbox-api, Emargement).
  - Go (`twinflow`, un sidecar Postgres).
  - Java Spring Boot : il le maîtrise d'après le contexte du Product Designer, mais aucun dépôt Spring n'a été vu dans la liste.
- **PWA :** `vite-plugin-pwa`, avec app installable, invite d'installation et web push VAPID (commit `f7793aa` de togosaas).
- **SEO :** prérendu SSG avec `scripts/prerender.mjs`, plus meta, JSON-LD et sitemap (commit `c295211`).

### 1.2 Déploiement
- **Front :** Vercel (`*.vercel.app`). Le `vercel.json` de togosaas fait :
  - un rewrite SPA `/(.*)` → `/index.html` ;
  - un cache `public, max-age=31536000, immutable` sur `/assets/*`.
- **Back PHP :** hébergé chez Hostinger/Apache, à l'URL `https://togosaas.grosbit.com`.
  - `DocumentRoot` pointe sur `backend/public`.
  - Le front passe PUT/PATCH/DELETE en **POST + override**, à cause de Hostinger (voir `src/lib/api.ts`).
- **Variables :**
  - front : `VITE_API_URL` ;
  - back : `DB_*`, `JWT_SECRET`, `JWT_TTL`, `FRONTEND_URL`, `APP_DEBUG=false`, `ADMIN_*`, `MAX_UPLOAD_SIZE`.
  - Des fichiers `.env.example` et `.env.production.example` sont versionnés.
- **CI/CD :** **INCONNU.** Il n'y a pas de dossier `.github/` dans togosaas. Le seul contrôle trouvé est `npm run lint` (`tsc --noEmit`).

### 1.3 Sécurité (backend/SECURITY.md de TogoSaaS, audit du 24/06/2026)
- **Correctifs appliqués :**
  - CORS strict, limité à l'origine exacte `FRONTEND_URL` ;
  - JWT : secret obligatoire de longueur minimale, algorithme vérifié ;
  - plus de fuite d'erreurs PDO ;
  - uploads contrôlés : `is_uploaded_file`, vrai contrôle d'image ;
  - en-têtes de sécurité HTTP ;
  - rate limiting sur login, register et contact.
- **Déjà en place avant l'audit :**
  - requêtes préparées ;
  - mots de passe en bcrypt ;
  - `requireAdmin` / `requireUser` ;
  - contrôle IDOR ;
  - fichiers sensibles stockés hors webroot.
- Ce niveau de rigueur est le minimum attendu sur edzii-api.

### 1.4 Structure de dépôt type (TogoSaaS)
- Racine : le front (`src/`, `public/`, `scripts/`, `vite.config.ts`, `vercel.json`).
- `backend/` : `public/`, `src/`, `config/`, `database/`, `storage/`, `SECURITY.md`.
- `.private/` est gitignoré et contient les exports de BDD.
- Organisation de `src/` : `components/{ui,layout,dashboard,home,motion,pwa,reports,community}`, `pages/` et `pages/dashboard/`, `context/`, `hooks/`, `lib/`, `data/`, `sw.ts`, `types.ts`.
- Documentation : README très complet (badges, problème, solution, fonctionnalités, stack, installation, déploiement, routes et rôles, API, comptes de démo) et CONTRIBUTING. Licence MIT, auteur « Chaminade Dondah Adjolou ».

### 1.5 Commits
- Conventional Commits (CONTRIBUTING de TogoSaaS) : `<type>(<scope>): <résumé à l'impératif>`.
- Types : feat, fix, docs, style, refactor, perf, test, chore.
- Les messages sont **en français**, par exemple `feat(pwa): app installable + …` ou `fix(admin): corriger …`.

### 1.6 Préférences exprimées par Chaminade
- Mémoire de l'ancien agent : son compte GitHub est Donchaminade. Les autres préférences notées concernent le blog du portfolio : articles longs, images, partage LinkedIn/FB/X après validation.
- Préférences vues dans la conversation du Product Designer :
  - il veut un résultat « impeccable » et « prêt » ;
  - le nom s'écrit **Edzii-Nku**, avec deux i ;
  - la structure des dossiers est imposée (voir §4) ;
  - il veut une UI **complète**, aussi soignée que TogoSaaS et TCH.
- Choix de la stack de l'API : **non tranché**, Chaminade en discute avec Builder. Les pistes évoquées sont Spring Boot sur Postgres/Supabase, ou NestJS. La fiche projet prévoyait Supabase.

---

## 2. Références UI : TogoSaaS et TCH

| | TCH (Togo Communities Hub) | TogoSaaS |
|---|---|---|
| Ce que c'est | L'annuaire des communautés togolaises : leads, validation admin, signalements anonymes avec un code de suivi `TCH-XXXX-XXXX-XXXX` | « Le hub des solutions SaaS du Togo » : annuaire des SaaS togolais vérifiés. Il est né du même code, et le dépôt garde des traces de TCH. |
| Repo | github.com/Donchaminade/togo-communities-hub | github.com/Donchaminade/togosaas (clone dans `/workspace/togosaas`) |
| URL | https://togo-communities-hub.vercel.app | https://togosaas.vercel.app (API : togosaas.grosbit.com) |
| Captures | `/workspace/tch/full.png`, `p0.png`, `p1.png`, `p2.png` (thèmes sombre et clair, faites avec le script `tch/s.js`) | — |

### Ce qui rend ces interfaces belles (relevé dans `togosaas/src/index.css` et les composants)
- **Librairies :** Tailwind v4, utilisé avec `@theme` et des tokens CSS, plus lucide-react. **Pas de shadcn/ui** : les composants UI sont faits maison (`components/ui` : Modal, Toast, ConfirmDialog, SearchBar, SearchableSelect, Pagination, ThemeToggle, SplashScreen, Wave, RichTextEditor, ImageUpload/GalleryUpload, UserAvatar, PageBanner, StatusBadge…).
- **Typographie :** Inter (400 à 900), chargée depuis Google Fonts.
- **Couleurs :**
  - tokens aux couleurs du drapeau togolais : `togo-green #006a4e`, `togo-red #d21034`, `togo-yellow #ffce00`, `surface #f6f8f5`, `ink #10231d` ;
  - fond en dégradés radiaux discrets ;
  - **dark mode** piloté par la classe `.dark`, avec un fond `#020617` / `#07111c`.
- **Formes :** coins très arrondis. Par nombre d'occurrences : `rounded-xl` (244), `2xl` (112), `full` (108), `3xl` (75). Ombre de marque `shadow-togo` et `backdrop-blur-sm` pour l'effet verre.
- **Animations :**
  - keyframes `fadeIn`, `rise`, `pageIn` (avec easing expo `cubic-bezier(0.16,1,0.3,1)`), `float`, `blob` (formes de fond animées), `wave`, `shimmer` (skeletons) ;
  - classes de délai ;
  - **ScrollReveal** (`motion-reveal`, fade-up/down/zoom, 1050 ms) ;
  - défilement fluide.
- **Layout :**
  - partie publique : Navbar, hero avec 2 CTA, compteurs (communautés, villes, thématiques), grille d'avantages, « Comment ça marche » en 4 étapes numérotées, bloc signalement anonyme, CTA final, Footer ;
  - `AuthShell` pour l'authentification ;
  - `DashboardLayout` pour les espaces lead et admin : tableaux, drawers, modales de détail, graphiques d'aperçu (`AdminOverviewCharts`), panneaux de modération, de signalements, de support (chat) et d'emailing/automatisations.
- **À transposer à Edzii-Nku :** garder la qualité d'exécution (motion, arrondis, verre, dark/light, composants soignés, dashboard riche), mais avec **l'identité Edzii-Nku**, pas celle du drapeau. Voir §3.

---

## 3. Ce qui existe déjà sur Edzii-Nku / Tsinku

- **Fiche projet :** `/workspace/tsinku/fiche-candidature-tsinku.md`, plus les PDF et le deck HTML dans `/workspace/tsinku/`.
  - Projet : Hackathon Climat & Innovation 2026 (Togolaises In Science × Expertise France). Finale le 7/11/2026 à l'Institut français du Togo.
  - Fonctions : Prévenir (Open-Meteo et zones à risque, alertes FR/éwé), Signaler (photo géolocalisée et niveau cheville/genou/taille, aussi par WhatsApp), Agir (dashboard pour la mairie et la protection civile).
  - Stack MVP indiquée : React/Next.js, Leaflet/OSM, Supabase, WhatsApp Cloud API, Open-Meteo, SMS.
- **Deck v2 :** `/workspace/slides/edzii-nku-v2-wsnbFq/`, en PPTX et PDF, aussi sur Drive.
- **Assets :** `/workspace/slides/edzii-nku-assets/` (logos, carte de Lomé, schéma d'architecture, vraies photos d'inondations avec crédits dans `photos.md`, chiffres sourcés dans `figures.md`).
- **Maquettes UI :** `/workspace/edzii-nku-ui/` (README, `Edzii-Nku_maquettes_UI.pdf`, `boards/`, `screens/`, générateurs dans `src/`).
- **Design system « nuit » :**
  - fonds bleu nuit `#030B1E`, `#03132f`, `#071733`, `#061433` ;
  - cyan `#5CE1F2`, bleu eau `#2F86E8`, bleu clair `#7FD8FF` ;
  - alerte rouge `#FF5C7A`, vigilance ambre `#F5B84B` ;
  - polices Sora (titres) et Work Sans (texte) ;
  - logo en forme d'œil ;
  - un thème clair existe pour les écrans Alertes et Profil ; la carte reste sombre.
- **Code :** **aucun pour l'instant.** Je n'ai trouvé aucun dépôt edzi/tsinku/nku sur GitHub ni de dossier `edziinku` sur la box.
- **Mises en garde :**
  - tous les chiffres des maquettes sont des données de démonstration ;
  - le texte éwé doit être relu par un locuteur natif ;
  - les domaines `edzii-nku.tg` et `pro.edzii-nku.tg` sont fictifs ;
  - Zogbédji est placé de façon approximative sur la carte ;
  - la photo du bassin Léo 2000 est en CC BY-SA, avec crédit « Podjololé ».

---

## 4. Structure cible (imposée par Chaminade)

```
edziinku/            ← web React (site public + PWA + admin mairie/protection civile)
├── edziimobile/     ← application mobile Flutter
└── edzii-api/       ← API commune au web et au mobile (stack à trancher avec Chaminade)
```
- **Hébergement de l'API, choix du bot WhatsApp (Cloud API), CI/CD :** INCONNU, à décider.

---

## 5. Les écrans à construire (UI complète)

> Note : le dossier contient **25** écrans, pas 23 : web 5, mobile-web 3, app 13, WhatsApp 4. Tous sont à construire.

### Web React / PWA et admin (`edziinku`), 1440×900, dans `screens/web/`
1. `01_accueil` : accueil public
2. `02_carte_en_direct` : carte des signalements en temps réel
3. `03_signaler` : formulaire de signalement (photo et niveau d'eau)
4. `04_tableau_de_bord` : tableau de bord pour la mairie et la protection civile
5. `05_moderation_historique` : modération et historique (admin)

### PWA mobile web (`edziinku`, responsive), 390×844, dans `screens/mobile-web/`
6. `01_accueil`
7. `02_carte`
8. `03_signaler`

### App Flutter (`edziimobile`), 390×844, dans `screens/app/`
9. `01_onboarding_bienvenue` : bienvenue et choix de la langue (FR/éwé)
10. `02_onboarding_quartiers` : choix des quartiers suivis
11. `03_onboarding_canaux` : canaux d'alerte (push, WhatsApp, SMS)
12. `04_alertes` : liste des alertes
13. `05_alerte_detail` : détail d'une alerte
14. `06_carte` : carte
15. `07_signaler_1_photo` : signalement, étape 1, la photo
16. `08_signaler_2_position` : signalement, étape 2, la position
17. `09_signaler_3_niveau` : signalement, étape 3, le niveau d'eau
18. `10_signaler_confirmation` : confirmation du signalement
19. `11_profil` : profil
20. `12_alertes_clair` : alertes, thème clair
21. `13_profil_clair` : profil, thème clair

### Bot WhatsApp (via `edzii-api`), dans `screens/whatsapp/`
22. `01_inscription_quartier` : abonnement à un quartier
23. `02_alerte_francais` : alerte pluie en français
24. `03_alerte_ewe` : alerte pluie en éwé (à faire relire)
25. `04_signalement_photo` : signalement par photo et confirmation

Tous les fichiers sont en `@2x.png`, sous `/workspace/edzii-nku-ui/screens/`. Les planches sont dans `boards/`.

---

## 6. Points ouverts (INCONNU / à demander à Chaminade)
- La stack d'edzii-api : Spring Boot, NestJS, Supabase seul… Elle n'est pas choisie.
- L'hébergement (Vercel pour le web ? où pour l'API ?), la base de données, la CI/CD.
- Le transcript d'APP BUILDER PRO : je n'ai pas pu le lire, donc ses éventuelles autres conventions restent inconnues.
- Les comptes et clés : WhatsApp Cloud API, fournisseur SMS, nom de domaine. Aucun n'a été fourni.
