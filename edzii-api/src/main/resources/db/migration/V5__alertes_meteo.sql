-- Signes météo (orage, forte pluie, vigilance, calme) + cible ville.
-- Rayon de voisinage documenté côté API : 2 km (centroïdes).

ALTER TABLE alerts
    ALTER COLUMN kind TYPE VARCHAR(32);

ALTER TABLE alerts
    DROP CONSTRAINT alerts_kind_chk;

ALTER TABLE alerts
    ADD CONSTRAINT alerts_kind_chk CHECK (kind IN (
        'RAIN', 'REPORT', 'WORKS', 'CLEAR',
        'ORAGE', 'FORTE_PLUIE', 'VIGILANCE_INONDATION', 'CALME'
    ));

ALTER TABLE alerts
    ADD COLUMN city_id UUID REFERENCES cities (id);

CREATE INDEX alerts_city_idx ON alerts (city_id);
CREATE INDEX alerts_ends_idx ON alerts (ends_at);
