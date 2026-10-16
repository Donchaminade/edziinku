-- Villes, niveaux d’urgence et rattachement des quartiers.
-- geom devient nullable pour que JPA puisse insérer un quartier :
-- le trigger calcule alors un tampon autour du point.

CREATE TABLE urgency_levels (
    id UUID PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    label VARCHAR(80) NOT NULL,
    color VARCHAR(7) NOT NULL,
    rank_order INT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT urgency_color_chk CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT urgency_rank_chk CHECK (rank_order BETWEEN 1 AND 99)
);

CREATE TABLE cities (
    id UUID PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    region VARCHAR(120),
    commune VARCHAR(120),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE neighborhoods
    ADD COLUMN city_id UUID REFERENCES cities (id),
    ADD COLUMN urgency_level_id UUID REFERENCES urgency_levels (id),
    ADD COLUMN aliases VARCHAR(400),
    ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE neighborhoods ALTER COLUMN geom DROP NOT NULL;

CREATE OR REPLACE FUNCTION edzii_set_neighborhood_buffer() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.geom IS NULL THEN
        NEW.geom := ST_Buffer(
            ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography,
            1500
        )::geometry;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION edzii_refresh_neighborhood_buffer() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.geom := ST_Buffer(
        ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography,
        1500
    )::geometry;
    RETURN NEW;
END;
$$;

CREATE TRIGGER neighborhoods_geom_bi
    BEFORE INSERT ON neighborhoods
    FOR EACH ROW EXECUTE FUNCTION edzii_set_neighborhood_buffer();

CREATE TRIGGER neighborhoods_geom_bu
    BEFORE UPDATE OF latitude, longitude ON neighborhoods
    FOR EACH ROW
    WHEN (NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude)
    EXECUTE FUNCTION edzii_refresh_neighborhood_buffer();

-- Couleurs unies de la charte claire : --alert, --warn, --primary, --ok
INSERT INTO urgency_levels (id, slug, label, color, rank_order, active) VALUES
    ('10101010-0000-4000-8000-000000000001', 'critique', 'Critique', '#D21034', 1, TRUE),
    ('10101010-0000-4000-8000-000000000002', 'eleve', 'Élevé', '#C8891A', 2, TRUE),
    ('10101010-0000-4000-8000-000000000003', 'modere', 'Modéré', '#1D4ED8', 3, TRUE),
    ('10101010-0000-4000-8000-000000000004', 'calme', 'Calme', '#059669', 4, TRUE);

INSERT INTO cities (id, slug, name, region, commune, latitude, longitude, active) VALUES
    ('12121212-0000-4000-8000-000000000001', 'lome', 'Lomé', 'Maritime', 'Golfe', 6.1319, 1.2228, TRUE),
    ('12121212-0000-4000-8000-000000000002', 'tsevie', 'Tsévié', 'Maritime', 'Zio', 6.4261, 1.2133, TRUE),
    ('12121212-0000-4000-8000-000000000003', 'aneho', 'Aného', 'Maritime', 'Lacs', 6.2279, 1.5919, TRUE),
    ('12121212-0000-4000-8000-000000000004', 'kpalime', 'Kpalimé', 'Plateaux', 'Kloto', 6.9000, 0.6333, TRUE),
    ('12121212-0000-4000-8000-000000000005', 'atakpame', 'Atakpamé', 'Plateaux', 'Ogou', 7.5269, 1.1267, TRUE),
    ('12121212-0000-4000-8000-000000000006', 'sokode', 'Sokodé', 'Centrale', 'Tchaoudjo', 8.9833, 1.1333, TRUE),
    ('12121212-0000-4000-8000-000000000007', 'kara', 'Kara', 'Kara', 'Kozah', 9.5511, 1.1861, TRUE),
    ('12121212-0000-4000-8000-000000000008', 'dapaong', 'Dapaong', 'Savanes', 'Tone', 10.8622, 0.2076, TRUE),
    ('12121212-0000-4000-8000-000000000009', 'tabligbo', 'Tabligbo', 'Maritime', 'Yoto', 6.5833, 1.5000, TRUE),
    ('12121212-0000-4000-8000-000000000010', 'vogan', 'Vogan', 'Maritime', 'Vo', 6.3333, 1.5333, TRUE),
    ('12121212-0000-4000-8000-000000000011', 'amlame', 'Amlamé', 'Plateaux', 'Amou', 7.4667, 0.9000, TRUE),
    ('12121212-0000-4000-8000-000000000012', 'bassar', 'Bassar', 'Kara', 'Bassar', 9.2500, 0.7833, TRUE),
    ('12121212-0000-4000-8000-000000000013', 'mango', 'Mango', 'Savanes', 'Oti', 10.3592, 0.4708, TRUE),
    ('12121212-0000-4000-8000-000000000014', 'notse', 'Notsé', 'Plateaux', 'Haho', 6.9500, 1.1667, TRUE),
    ('12121212-0000-4000-8000-000000000015', 'sotouboua', 'Sotouboua', 'Centrale', 'Sotouboua', 8.5667, 0.9833, TRUE),
    ('12121212-0000-4000-8000-000000000016', 'bafilo', 'Bafilo', 'Kara', 'Assoli', 9.3500, 1.2667, TRUE),
    ('12121212-0000-4000-8000-000000000017', 'cinkasse', 'Cinkassé', 'Savanes', 'Cinkassé', 11.1000, 0.0167, TRUE),
    ('12121212-0000-4000-8000-000000000018', 'anie', 'Anié', 'Plateaux', 'Anié', 7.7500, 1.2000, TRUE),
    ('12121212-0000-4000-8000-000000000019', 'badou', 'Badou', 'Plateaux', 'Wawa', 7.5833, 0.6000, TRUE),
    ('12121212-0000-4000-8000-000000000020', 'tchamba', 'Tchamba', 'Centrale', 'Tchamba', 8.8833, 1.4167, TRUE),
    ('12121212-0000-4000-8000-000000000021', 'agbodrafo', 'Agbodrafo', 'Maritime', 'Lacs', 6.2000, 1.4833, TRUE),
    ('12121212-0000-4000-8000-000000000022', 'tovogan', 'Togoville', 'Maritime', 'Lacs', 6.2333, 1.4667, TRUE);

-- Quartiers déjà présents : rattacher à Lomé et à un niveau d’urgence.
UPDATE neighborhoods SET
    city_id = '12121212-0000-4000-8000-000000000001',
    urgency_level_id = '10101010-0000-4000-8000-000000000001',
    aliases = 'Be,Bé',
    active = TRUE
WHERE slug = 'be';

UPDATE neighborhoods SET
    city_id = '12121212-0000-4000-8000-000000000001',
    urgency_level_id = '10101010-0000-4000-8000-000000000002',
    aliases = 'Agoe-Nyive,Agoe,Agoè,Agoè Nyivé',
    active = TRUE
WHERE slug = 'agoe-nyive';

UPDATE neighborhoods SET
    city_id = '12121212-0000-4000-8000-000000000001',
    urgency_level_id = '10101010-0000-4000-8000-000000000003',
    aliases = 'Zogbedji',
    active = TRUE
WHERE slug = 'zogbedji';

UPDATE neighborhoods SET
    city_id = '12121212-0000-4000-8000-000000000001',
    urgency_level_id = '10101010-0000-4000-8000-000000000003',
    aliases = 'Adakpame',
    active = TRUE
WHERE slug = 'adakpame';

UPDATE neighborhoods SET
    city_id = '12121212-0000-4000-8000-000000000001',
    urgency_level_id = '10101010-0000-4000-8000-000000000003',
    aliases = 'Hedzranawoe,Hédzranawoe',
    active = TRUE
WHERE slug = 'hedzranawoe';

UPDATE neighborhoods SET
    city_id = '12121212-0000-4000-8000-000000000001',
    urgency_level_id = '10101010-0000-4000-8000-000000000004',
    aliases = 'Tokoin Wuiti,Tokoin-Wuiti',
    active = TRUE
WHERE slug = 'tokoin';
