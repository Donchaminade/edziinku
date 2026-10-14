# Edzii-Nku : maquettes UI haute fidélité

Identité du deck « nuit » : bleu nuit, cyan #5CE1F2 et bleu eau #2F86E8, polices Sora et Work Sans, logo en forme d'œil. Le fond de carte vient d'OpenStreetMap.

## Livrables
- **Edzii-Nku_maquettes_UI.pdf** : les 3 planches réunies, une par page.
- **boards/** : les planches de présentation.
  - 1_web_pwa.png : application web
  - 2_app_mobile.png : application mobile
  - 3_whatsapp.png : bot WhatsApp
- **screens/** : chaque écran en PNG 2x.
  - web/ (1440 × 900) : 01_accueil, 02_carte_en_direct, 03_signaler, 04_tableau_de_bord, 05_moderation_historique
  - mobile-web/ (390 × 844) : 01_accueil, 02_carte, 03_signaler
  - app/ (390 × 844, iOS) :
    - parcours d'accueil : 01 bienvenue et langue, 02 quartiers, 03 canaux
    - 04 alertes, 05 détail d'une alerte, 06 carte
    - signalement : 07 photo, 08 position, 09 niveau, 10 confirmation
    - 11 profil
    - thème clair : 12 alertes, 13 profil
  - whatsapp/ (390 × 844) : 01 abonnement au quartier, 02 alerte en français, 03 alerte en éwé, 04 signalement photo et confirmation
- **src/** : les générateurs Python, HTML et CSS.
  - common.py, base.css : socle commun
  - web.py, app.py, wa.py : les écrans
  - boards.py : les planches et le PDF
  - Pour tout régénérer : `cd src && python3 web.py && python3 app.py && python3 wa.py && python3 boards.py`

## À savoir
- Tous les chiffres affichés sont des données de démonstration, signalées en petit sur les écrans (alertes, signalements, taux d'obstruction, mm de pluie, références #EN-…, profil « Afi K. », numéros masqués). Aucune statistique réelle n'est inventée.
- Les noms des bassins sont réels (rapport ANPC de mai 2024) : Léo 2000, Gbézè, marché Hédzranawoé, Caméléon, Avédji 2, Ségbé. Leurs états sont fictifs.
- Le texte éwé (onboarding, alerte WhatsApp) est un premier jet : il doit être vérifié par un locuteur natif. L'écran WhatsApp en éwé porte une bannière qui le rappelle.
- Le 170 est le numéro vert de la protection civile, cité par Togo-Presse en mai 2024.
- Les domaines edzii-nku.tg et pro.edzii-nku.tg sont fictifs.
- Les photos sont de vraies photos de Lomé (Wikimedia Commons, voir /workspace/slides/edzii-nku-assets/photos.md). La photo du bassin Léo 2000 est sous CC BY-SA 4.0 : le crédit « Podjololé » est obligatoire si on la publie.
- Zogbédji est placé de façon approximative sur la carte (absent d'OSM), et les zones à risque sont illustratives.
- Le thème clair est disponible pour les écrans Alertes et Profil. La carte reste sombre dans les deux thèmes.
