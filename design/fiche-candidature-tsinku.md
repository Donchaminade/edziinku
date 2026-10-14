# Edzi-Nku – « l'œil de la pluie »
Hackathon Climat & Innovation 2026 – Défi : Inondations et pluies extrêmes
Togolaises In Science × Expertise France (ACDC, UE) – Finale le 7 novembre 2026, Institut français du Togo

## 1. Le problème
Chaque saison des pluies, plusieurs quartiers de Lomé (Agoè, Bè, Zogbédji, Adakpamé…) sont inondés. Les habitants ne reçoivent pas d'alerte à temps, les secours ne savent pas où se trouvent les points critiques, et les communes manquent de données fiables pour planifier le curage des caniveaux et les travaux.

## 2. Notre solution : Edzi-Nku
Une plateforme web et mobile, accessible aussi par WhatsApp et SMS, qui aide les habitants avant, pendant et après les pluies.
- **Prévenir.** Les prévisions de pluie (API Open-Meteo) sont croisées avec une carte des zones à risque. Les habitants abonnés de ces zones reçoivent une alerte en français et en éwé.
- **Signaler.** Les habitants envoient une photo géolocalisée avec le niveau d'eau (cheville, genou, taille), ce qui alimente une carte en temps réel. Le signalement se fait aussi via WhatsApp.
- **Agir.** Un tableau de bord pour la mairie et la protection civile affiche les points noirs récurrents et les caniveaux bouchés, avec un historique pour prioriser les travaux.

## 3. Impact attendu
- Moins de pertes matérielles grâce aux alertes envoyées avant la pluie.
- Une intervention plus rapide des secours, guidée par la carte en temps réel.
- Les premières données ouvertes sur les inondations à Lomé, utiles pour la planification urbaine.
- Une solution inclusive : SMS et WhatsApp, langues locales, sans besoin de smartphone récent.

## 4. Innovation
Edzi-Nku combine des données météo ouvertes avec les signalements des citoyens. Son volet multicanal (web, WhatsApp, SMS) et multilingue (français et éwé) est pensé pour les réalités togolaises.

## 5. Faisabilité technique (MVP pour la finale)
- Front-end en React ou Next.js, avec une carte Leaflet / OpenStreetMap.
- Backend avec Supabase (base de données, authentification, stockage des photos).
- Bot WhatsApp via l'API WhatsApp Cloud et prévisions via Open-Meteo, tous deux gratuits.
- Démo en finale : on simule une forte pluie, l'alerte part, les signalements remplissent la carte et le tableau de bord se met à jour.

## 6. Équipe (2 à 5 étudiantes, 100 % féminine)
- Développeuse web/mobile, profil obligatoire selon le règlement.
- Profil data ou SIG, pour la carte et les zones à risque.
- Profil design ou communication, pour l'UX et le pitch.
- Optionnel : profil environnement ou génie civil, pour la crédibilité scientifique.

## 7. Perspectives
- Pilote dans un quartier avec la mairie.
- Partenariats avec la Croix-Rouge togolaise et la Météo nationale.
- Extension à d'autres villes (Kara, Sokodé, Aného).
- Financement par subventions climat et par des partenariats avec les opérateurs télécoms pour les SMS.

## 8. Pitch en une phrase
« Edzi-Nku, l'œil de la pluie : prévenir, signaler et agir contre les inondations, quartier par quartier. »
