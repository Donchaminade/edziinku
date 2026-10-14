# Edzii-Nku

L’œil de la pluie : alertes d’inondation à Lomé, en français et en éwé. Le nom s’écrit avec deux **i**.

Trois applications partagent la même API :

| Dossier | Rôle |
| --- | --- |
| `edziinku/` | PWA publique et tableau de bord mairie / protection civile (React 19, Vite, Tailwind 4, Motion) |
| `edziimobile/` | Application Flutter (parcours, alertes, carte, signalement, profil) |
| `edzii-api/` | API Spring Boot 3, PostgreSQL + PostGIS, JWT, WhatsApp Cloud API, Open-Meteo |
| `design/` | Maquettes, logos et fiche projet |

Le thème **nuit** est le défaut. Un thème clair reprend les mêmes jetons (variables CSS côté web, `ThemeExtension` côté Flutter). Le choix est mémorisé sur l’appareil et, une fois connecté, renvoyé au profil. Les animations respectent `prefers-reduced-motion`. Les couleurs de l’interface sont des aplats de la charte : pas de dégradé, ni sur le web ni sur le mobile.

L’accueil public est une vitrine mobile d’abord : carrousel photo, voile flou aux courbes douces pour le texte, image nette à côté, puis un hero photo par section. Les photos sont des clichés réels Unsplash ou Pexels (pas des vues de Lomé) : le lieu, l’auteur et la source sont indiqués sur chaque image, fichiers dans `edziinku/public/photos/`. Il n’y a pas d’illustration SVG, ni de dégradé.

## Lancer

Prérequis : Docker, JDK 21, Node 20+, Flutter 3.24+.

```bash
cp .env.example .env
docker compose up -d
```

API :

```bash
cd edzii-api
export DATABASE_URL=jdbc:postgresql://localhost:5432/edziinku
export DATABASE_USER=edziinku
export DATABASE_PASSWORD=edziinku
mvn spring-boot:run
```

Web (http://localhost:5173) :

```bash
cd edziinku
cp .env.example .env
npm install
npm run dev
```

Mobile :

```bash
cd edziimobile
flutter pub get
flutter run
```

L’API mobile par défaut est `http://localhost:8080`. Sur un émulateur Android, passer `--dart-define=API_BASE=http://10.0.2.2:8080`. Sans API, les deux clients affichent les données de démonstration.

### Comptes de démonstration

Mot de passe : `Demo-Edzii-2026`

| Identifiant | Rôle |
| --- | --- |
| `afi@edzii.local` | Citoyen |
| `mairie@edzii.local` | Mairie |
| `pc@edzii.local` | Protection civile |

Santé de l’API : `GET /actuator/health`. Documentation : `/swagger-ui.html` (désactivable avec `SWAGGER_ENABLED=false`).

## WhatsApp

Le webhook est `GET/POST /api/whatsapp/webhook`. Renseignez `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` et `WHATSAPP_APP_SECRET`. Sans jeton, les messages sont conservés dans la file (écran admin Messages) et ne partent pas. Le parcours (langue, quartier, photo, position, niveau) est dans `BotEngine`. Les textes en éwé sont un premier jet : **à relire par un locuteur natif**.

Google OAuth : `POST /api/auth/google` existe. Il reste inactif tant que `GOOGLE_CLIENT_ID` est vide.

## Déployer

Le web et l’API ne vont pas au même endroit. Le front est une SPA Vite. L’API est un processus Java avec PostgreSQL et PostGIS.

### Web sur Vercel

1. Importer le dépôt. **Root Directory : `edziinku`.**
2. Framework : Vite. Build : `npm run build`. Sortie : `dist`.
3. `edziinku/vercel.json` renvoie toutes les routes (`/carte`, `/admin`, …) vers `index.html`. Les fichiers réels (images, `sw.js`) restent servis tels quels.
4. Variable d’environnement **`VITE_API_URL`** : l’URL publique de l’API, sans barre finale, par exemple `https://edzii-api.onrender.com`. Vite l’inscrit dans le JavaScript **au build**. Après un changement, il faut redéployer.

Ajouter cette origine Vercel à `FRONTEND_URL` côté API, sinon le navigateur bloque les appels.

### API sur Render

Render héberge le service Java. Vercel ne lance pas Spring Boot.

1. Nouveau **Web Service**, dépôt identique, runtime **Docker**.
2. Dockerfile : `edzii-api/Dockerfile` (contexte `edzii-api`). Le processus écoute `0.0.0.0` et le port `PORT`.
3. Contrôle de santé : `/actuator/health`.
4. Base **PostgreSQL** avec l’extension **PostGIS** (la première migration exécute `CREATE EXTENSION IF NOT EXISTS postgis`).
5. Variables : celles de `.env.example` (`DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, WhatsApp, `GOOGLE_CLIENT_ID`). `APP_ENV=prod` désactive les origines localhost automatiques : lister explicitement l’URL Vercel dans `FRONTEND_URL`.
6. Les photos déposées dans `UPLOAD_DIR` disparaissent au redémarrage du disque éphémère. Pour les garder, attacher un disque persistant Render et pointer `UPLOAD_DIR` dessus.

Le client web lit uniquement `VITE_API_URL`. Le mobile lit `API_BASE` (`--dart-define=API_BASE=https://edzii-api.onrender.com`).

## Ce qui est en place

- Schéma PostGIS, migrations Flyway, quartiers, alertes, signalements, bassins, équipes, file WhatsApp.
- Auth JWT (accès + rafraîchissement), rôles, limite de débit, contrôle du type réel des photos.
- Web : accueil, carte Leaflet, signalement, fonctionnement, communes, simulation WhatsApp, connexion, profil, admin (vue d’ensemble, carte, modération, alertes, points noirs, historique, équipes, messages).
- Mobile : accueil, langue, quartiers, canaux, liste et détail d’alerte (transition Hero), carte, signalement en étapes, profil, bascule de thème.
- Motion sur le web (révélation au défilement, listes en cascade, parallaxe légère, survol, transitions de route, compteurs, graphiques, tiroirs, modales, squelettes, bascule de thème). Flutter : animations implicites et explicites, Hero, retour au toucher, listes révélées.

## À faire ensuite

- Relire tous les textes éwé avec un locuteur natif.
- Brancher l’envoi réel WhatsApp et la signature du webhook en production.
- Terminer Google OAuth (bouton web et mobile).
- Envoyer le signalement mobile directement à `POST /api/reports` (le flux prépare le dossier, l’envoi complet est déjà sur le web).
- Affiner les polygones de quartiers encore marqués approximatifs.
- Notifications push mobiles.
- Découper le bundle web (Leaflet pèse dans le premier chargement).
- Jeux de tests d’interface au-delà du test de thème Flutter et des tests d’API.
