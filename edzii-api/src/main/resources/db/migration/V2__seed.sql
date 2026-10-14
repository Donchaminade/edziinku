-- Jeu de démonstration aligné sur les maquettes (14 octobre 2026).
-- Les chiffres du tableau de bord et les statuts sont fictifs.
-- Les textes éwé sont un premier jet : à relire par un locuteur natif.
-- Zogbédji est un polygone approximatif (absent d’OSM).

-- Mot de passe de démonstration, identique pour les trois comptes : Demo-Edzii-2026
-- Empreinte bcrypt.

INSERT INTO neighborhoods (id, slug, name, commune, risk_level, latitude, longitude, approximate, geom) VALUES
('11111111-0000-4000-8000-000000000001', 'be', 'Bè', 'Golfe 1', 'ELEVE', 6.1315, 1.2320, FALSE,
    ST_Buffer(ST_SetSRID(ST_MakePoint(1.2320, 6.1315), 4326)::geography, 1800)::geometry),
('11111111-0000-4000-8000-000000000002', 'agoe-nyive', 'Agoè-Nyivé', 'Agoè-Nyivé 1', 'ELEVE', 6.2280, 1.1780, FALSE,
    ST_Buffer(ST_SetSRID(ST_MakePoint(1.1780, 6.2280), 4326)::geography, 2200)::geometry),
('11111111-0000-4000-8000-000000000003', 'zogbedji', 'Zogbédji', 'Agoè-Nyivé', 'A_SURVEILLER', 6.2050, 1.1650, TRUE,
    ST_Buffer(ST_SetSRID(ST_MakePoint(1.1650, 6.2050), 4326)::geography, 1600)::geometry),
('11111111-0000-4000-8000-000000000004', 'adakpame', 'Adakpamé', 'Golfe 4', 'A_SURVEILLER', 6.1480, 1.2180, FALSE,
    ST_Buffer(ST_SetSRID(ST_MakePoint(1.2180, 6.1480), 4326)::geography, 1400)::geometry),
('11111111-0000-4000-8000-000000000005', 'hedzranawoe', 'Hédzranawoé', 'Golfe 2', 'A_SURVEILLER', 6.1680, 1.2550, FALSE,
    ST_Buffer(ST_SetSRID(ST_MakePoint(1.2550, 6.1680), 4326)::geography, 1500)::geometry),
('11111111-0000-4000-8000-000000000006', 'tokoin', 'Tokoin', 'Golfe 3', 'MODERE', 6.1550, 1.2080, FALSE,
    ST_Buffer(ST_SetSRID(ST_MakePoint(1.2080, 6.1550), 4326)::geography, 1500)::geometry);

INSERT INTO users (id, email, phone, password_hash, display_name, role, language, theme, verified, created_at) VALUES
('22222222-0000-4000-8000-000000000001', 'afi@edzii.local', '+22890004217',
    '$2b$10$hApc9WdEWhPtD6qpCSJyceXWeU0TDqVwkFCYmw8exMkWHZCJ5mpxC',
    'Afi K.', 'CITOYEN', 'fr', 'dark', TRUE, '2026-09-02T08:00:00Z'),
('22222222-0000-4000-8000-000000000002', 'mairie@edzii.local', NULL,
    '$2b$10$hApc9WdEWhPtD6qpCSJyceXWeU0TDqVwkFCYmw8exMkWHZCJ5mpxC',
    'Mairie du Golfe', 'MAIRIE', 'fr', 'dark', TRUE, '2026-09-02T08:05:00Z'),
('22222222-0000-4000-8000-000000000003', 'pc@edzii.local', NULL,
    '$2b$10$hApc9WdEWhPtD6qpCSJyceXWeU0TDqVwkFCYmw8exMkWHZCJ5mpxC',
    'Protection civile', 'PROTECTION_CIVILE', 'fr', 'dark', TRUE, '2026-09-02T08:10:00Z');

INSERT INTO notification_preferences (user_id, push_enabled, whatsapp_enabled, sms_enabled, night_alerts, alert_language) VALUES
('22222222-0000-4000-8000-000000000001', TRUE, TRUE, TRUE, FALSE, 'fr'),
('22222222-0000-4000-8000-000000000002', TRUE, FALSE, FALSE, TRUE, 'fr'),
('22222222-0000-4000-8000-000000000003', TRUE, TRUE, TRUE, TRUE, 'both');

INSERT INTO user_neighborhoods (user_id, neighborhood_id) VALUES
('22222222-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001'),
('22222222-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000002');

INSERT INTO alerts (id, title, body, body_ewe, ewe_needs_review, level, kind, neighborhood_id, starts_at, ends_at, rain_mm_min, rain_mm_max, rain_series, source, created_at) VALUES
('33333333-0000-4000-8000-000000000001',
 'Forte pluie prévue à Bè',
 'De fortes pluies sont prévues ce soir de 18 h à 23 h (45 à 60 mm). Risque d’inondation élevé. Surélevez vos biens et vos documents, évitez les caniveaux et les bassins. Urgence : 170.',
 'Tsi gã adza fiẽ sia tso gaƒoƒo 18 vaseɖe 23 (45–60 mm). Tsiɖɔɖɔ ƒe afɔku le wò kɔƒe me. Ɖo wò nuwo kple wò agbalẽwo ɖe dzi. Mègaɖo tsiveɖawo kple tsiƒuwo gbɔ o. Kpekpeɖeŋu: 170.',
 TRUE, 'ELEVE', 'RAIN', '11111111-0000-4000-8000-000000000001',
 '2026-10-14T18:00:00Z', '2026-10-14T23:00:00Z', 45, 60,
 '[{"hour":18,"mm":4},{"hour":19,"mm":12},{"hour":20,"mm":22},{"hour":21,"mm":18},{"hour":22,"mm":9},{"hour":23,"mm":3}]',
 'Open-Meteo', '2026-10-14T16:42:00Z'),
('33333333-0000-4000-8000-000000000002',
 'Eau signalée au genou',
 'Bè Ahligo · 3 signalements concordants. Le caniveau devant le marché est bouché.',
 NULL, TRUE, 'VIGILANCE', 'REPORT', '11111111-0000-4000-8000-000000000001',
 NULL, NULL, NULL, NULL, NULL, 'Signalements citoyens', '2026-10-14T15:10:00Z'),
('33333333-0000-4000-8000-000000000003',
 'Curage du bassin Léo 2000',
 'Mairie · intervention prévue jeudi.',
 NULL, TRUE, 'INFO', 'WORKS', NULL,
 NULL, NULL, NULL, NULL, NULL, 'Mairie', '2026-10-13T09:00:00Z'),
('33333333-0000-4000-8000-000000000004',
 'Fin de vigilance à Agoè',
 'La pluie est passée. Restez prudents près des caniveaux encore pleins.',
 NULL, TRUE, 'INFO', 'CLEAR', '11111111-0000-4000-8000-000000000002',
 NULL, NULL, NULL, NULL, NULL, 'Edzii-Nku', '2026-10-13T18:40:00Z'),
('33333333-0000-4000-8000-000000000005',
 'Averses orageuses',
 'Agoè-Nyivé · demain après-midi. Nous préciserons le créneau avec la prochaine prévision.',
 NULL, TRUE, 'VIGILANCE', 'RAIN', '11111111-0000-4000-8000-000000000002',
 '2026-10-15T14:00:00Z', '2026-10-15T18:00:00Z', 15, 30, NULL, 'Open-Meteo', '2026-10-13T07:00:00Z');

INSERT INTO reports (id, reference, author_id, neighborhood_id, place_label, latitude, longitude, accuracy_m, water_level, comment, status, channel, confirmations, created_at) VALUES
('44444444-0000-4000-8000-000000000018', 'EN-0318', '22222222-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001',
 'Bè Ahligo, près du marché', 6.1328, 1.2342, 8, 'GENOU', 'Caniveau bouché, eau dans les cours.', 'VALIDE', 'APP', 3, '2026-10-14T16:40:00Z'),
('44444444-0000-4000-8000-000000000020', 'EN-0320', NULL, '11111111-0000-4000-8000-000000000002',
 'Agoè Kitidjan, rue pavée', 6.2260, 1.1810, 15, 'TAILLE', 'La rue est coupée.', 'VALIDE', 'WHATSAPP', 5, '2026-10-14T16:20:00Z'),
('44444444-0000-4000-8000-000000000025', 'EN-0325', NULL, '11111111-0000-4000-8000-000000000001',
 'Bassin Léo 2000, débordement', 6.1600, 1.2700, 20, 'GENOU', 'Le bassin déborde sur la voie.', 'VALIDE', 'WHATSAPP', 7, '2026-10-14T16:22:00Z'),
('44444444-0000-4000-8000-000000000024', 'EN-0324', '22222222-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000002',
 'Agoè-Nyivé, après la pluie', 6.2300, 1.1760, 12, 'CHEVILLE', 'Eau résiduelle sur la chaussée.', 'VALIDE', 'APP', 2, '2026-10-14T15:58:00Z'),
('44444444-0000-4000-8000-000000000019', 'EN-0319', NULL, '11111111-0000-4000-8000-000000000005',
 'Hédzranawoé, marché', 6.1690, 1.2535, 18, 'CHEVILLE', 'Eau à la cheville devant les étals.', 'VALIDE', 'WEB', 1, '2026-10-14T15:05:00Z'),
('44444444-0000-4000-8000-000000000331', 'EN-0331', NULL, '11111111-0000-4000-8000-000000000003',
 'Zogbédji', 6.2055, 1.1660, 30, 'CHEVILLE', 'Rue secondaire inondée.', 'A_VERIFIER', 'WHATSAPP', 0, '2026-10-14T17:20:00Z'),
('44444444-0000-4000-8000-000000000330', 'EN-0330', NULL, '11111111-0000-4000-8000-000000000001',
 'Bè Kpota', 6.1360, 1.2290, 10, 'GENOU', 'Eau au genou dans la rue principale.', 'A_VERIFIER', 'APP', 0, '2026-10-14T17:14:00Z'),
('44444444-0000-4000-8000-000000000329', 'EN-0329', NULL, '11111111-0000-4000-8000-000000000002',
 'Bassin Gbézè', 6.2100, 1.1900, 25, 'TAILLE', 'Le bassin est plein.', 'A_VERIFIER', 'WHATSAPP', 0, '2026-10-14T17:08:00Z'),
('44444444-0000-4000-8000-000000000328', 'EN-0328', NULL, '11111111-0000-4000-8000-000000000006',
 'Tokoin Wuiti', 6.1565, 1.2065, 14, 'CHEVILLE', 'Eau stagnante.', 'A_VERIFIER', 'APP', 0, '2026-10-14T17:02:00Z'),
('44444444-0000-4000-8000-000000000327', 'EN-0327', '22222222-0000-4000-8000-000000000001', '11111111-0000-4000-8000-000000000001',
 'Bè Ahligo', 6.1332, 1.2338, 8, 'GENOU', 'Le caniveau devant le marché est bouché, l’eau entre dans les cours.', 'A_VERIFIER', 'WHATSAPP', 0, '2026-10-14T16:57:00Z'),
('44444444-0000-4000-8000-000000000326', 'EN-0326', NULL, '11111111-0000-4000-8000-000000000002',
 'Agoè Kitidjan', 6.2248, 1.1835, 16, 'TAILLE', 'Véhicules bloqués.', 'A_VERIFIER', 'APP', 0, '2026-10-14T16:41:00Z'),
('44444444-0000-4000-8000-000000000323', 'EN-0323', NULL, '11111111-0000-4000-8000-000000000005',
 'Hédzranawoé', 6.1688, 1.2542, 20, 'CHEVILLE', 'Doublon probable du signalement précédent.', 'DOUBLON', 'WEB', 0, '2026-10-14T15:30:00Z'),
('44444444-0000-4000-8000-000000000322', 'EN-0322', NULL, '11111111-0000-4000-8000-000000000004',
 'Adakpamé', 6.1488, 1.2192, 22, 'GENOU', 'Photo trop sombre pour être vérifiée.', 'REJETE', 'APP', 0, '2026-10-14T14:12:00Z');

INSERT INTO report_tags (report_id, tag) VALUES
('44444444-0000-4000-8000-000000000018', 'Caniveau bouché'),
('44444444-0000-4000-8000-000000000018', 'Maisons touchées'),
('44444444-0000-4000-8000-000000000327', 'Caniveau bouché'),
('44444444-0000-4000-8000-000000000327', 'Maisons touchées'),
('44444444-0000-4000-8000-000000000020', 'Route coupée'),
('44444444-0000-4000-8000-000000000025', 'Maisons touchées');

INSERT INTO basins (id, name, commune, obstruction_pct, status, latitude, longitude) VALUES
('55555555-0000-4000-8000-000000000001', 'Bassin Léo 2000', 'Golfe 7', 92, 'CRITIQUE', 6.1600, 1.2700),
('55555555-0000-4000-8000-000000000002', 'Bassin Gbézè', 'Agoè-Nyivé', 88, 'CRITIQUE', 6.2100, 1.1900),
('55555555-0000-4000-8000-000000000003', 'Bassin marché Hédzranawoé', 'Golfe 2', 71, 'ELEVE', 6.1700, 1.2500),
('55555555-0000-4000-8000-000000000004', 'Bassin Caméléon', 'Golfe', 66, 'ELEVE', 6.1450, 1.2400),
('55555555-0000-4000-8000-000000000005', 'Bassin Avédji 2', 'Agoè-Nyivé', 41, 'SURVEILLE', 6.2400, 1.2000),
('55555555-0000-4000-8000-000000000006', 'Bassin Ségbé', 'Golfe', 35, 'SURVEILLE', 6.1850, 1.2800);

INSERT INTO timeline_events (id, occurred_at, title, detail, kind) VALUES
('66666666-0000-4000-8000-000000000001', '2026-10-14T16:57:00Z', 'Signalement EN-0327 reçu', 'Bè Ahligo · genou', 'REPORT'),
('66666666-0000-4000-8000-000000000002', '2026-10-14T16:30:00Z', 'Équipe terrain 3 envoyée', 'Bassin Léo 2000', 'TEAM'),
('66666666-0000-4000-8000-000000000003', '2026-10-14T16:42:00Z', 'Alerte forte pluie envoyée', 'Bè, Agoè-Nyivé · FR + éwé', 'ALERT'),
('66666666-0000-4000-8000-000000000004', '2026-10-14T14:05:00Z', 'Curage planifié', 'Bassin Gbézè · jeudi', 'WORKS'),
('66666666-0000-4000-8000-000000000005', '2026-10-14T09:12:00Z', 'Prévision mise à jour', 'Open-Meteo · 45–60 mm ce soir', 'WEATHER');

INSERT INTO field_teams (id, name, zone, status, assignment) VALUES
('77777777-0000-4000-8000-000000000003', 'Équipe terrain 3', 'Bassin Léo 2000', 'SUR_PLACE', 'Débordement en cours'),
('77777777-0000-4000-8000-000000000001', 'Équipe terrain 1', 'Bè', 'EN_ROUTE', 'Caniveaux du marché'),
('77777777-0000-4000-8000-000000000002', 'Équipe terrain 2', 'Agoè-Nyivé', 'DISPONIBLE', NULL);

INSERT INTO campaign_snapshot (
    id, alerts_sent_today, reports_24h, reports_trend, active_black_spots, critical_black_spots,
    drains_to_clear, planned_this_week, vigilance_label, vigilance_window, vigilance_neighborhood, updated_at, demo
) VALUES (
    1, 12480, 327, '3× la veille', 14, 5, 38, 9,
    'Vigilance forte pluie', '18 h – 23 h', 'Bè', '2026-10-14T16:45:00Z', TRUE
);

INSERT INTO whatsapp_contacts (id, wa_id, display_name, language, neighborhood_id, state, active, created_at) VALUES
('88888888-0000-4000-8000-000000000001', '22890004217', 'Afi K.', 'fr',
 '11111111-0000-4000-8000-000000000001', 'SUBSCRIBED', TRUE, '2026-10-01T10:03:00Z');
