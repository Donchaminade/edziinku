-- Schéma Edzii-Nku. PostGIS sert à rattacher un point (signalement, position WhatsApp)
-- au quartier qui le contient, et à chercher les signalements dans un rayon.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(180) UNIQUE,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    display_name VARCHAR(80) NOT NULL,
    role VARCHAR(32) NOT NULL,
    language VARCHAR(16) NOT NULL DEFAULT 'fr',
    theme VARCHAR(16) NOT NULL DEFAULT 'dark',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    google_sub VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT users_role_chk CHECK (role IN ('CITOYEN', 'MAIRIE', 'PROTECTION_CIVILE')),
    CONSTRAINT users_theme_chk CHECK (theme IN ('dark', 'light')),
    CONSTRAINT users_language_chk CHECK (language IN ('fr', 'ewe', 'both'))
);

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    night_alerts BOOLEAN NOT NULL DEFAULT FALSE,
    alert_language VARCHAR(16) NOT NULL DEFAULT 'fr',
    CONSTRAINT prefs_language_chk CHECK (alert_language IN ('fr', 'ewe', 'both'))
);

CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY,
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    commune VARCHAR(120) NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    approximate BOOLEAN NOT NULL DEFAULT FALSE,
    geom geometry(Polygon, 4326) NOT NULL,
    CONSTRAINT neighborhoods_risk_chk CHECK (risk_level IN ('MODERE', 'A_SURVEILLER', 'ELEVE'))
);

CREATE INDEX neighborhoods_geom_gix ON neighborhoods USING GIST (geom);

CREATE TABLE user_neighborhoods (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, neighborhood_id)
);

CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    body_ewe TEXT,
    ewe_needs_review BOOLEAN NOT NULL DEFAULT TRUE,
    level VARCHAR(20) NOT NULL,
    kind VARCHAR(20) NOT NULL,
    neighborhood_id UUID REFERENCES neighborhoods (id),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    rain_mm_min INT,
    rain_mm_max INT,
    rain_series TEXT,
    source VARCHAR(80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT alerts_level_chk CHECK (level IN ('INFO', 'VIGILANCE', 'ELEVE', 'CRITIQUE')),
    CONSTRAINT alerts_kind_chk CHECK (kind IN ('RAIN', 'REPORT', 'WORKS', 'CLEAR'))
);

CREATE INDEX alerts_created_idx ON alerts (created_at DESC);

CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reference VARCHAR(16) NOT NULL UNIQUE,
    author_id UUID REFERENCES users (id),
    neighborhood_id UUID REFERENCES neighborhoods (id),
    place_label VARCHAR(180) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy_m INT,
    water_level VARCHAR(16) NOT NULL,
    comment VARCHAR(2000),
    status VARCHAR(20) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    photo_filename VARCHAR(180),
    confirmations INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    geom geometry(Point, 4326) NOT NULL,
    CONSTRAINT reports_level_chk CHECK (water_level IN ('CHEVILLE', 'GENOU', 'TAILLE')),
    CONSTRAINT reports_status_chk CHECK (status IN ('A_VERIFIER', 'VALIDE', 'REJETE', 'DOUBLON')),
    CONSTRAINT reports_channel_chk CHECK (channel IN ('WEB', 'APP', 'WHATSAPP', 'SMS'))
);

CREATE INDEX reports_status_created_idx ON reports (status, created_at DESC);
CREATE INDEX reports_geom_gix ON reports USING GIST (geom);
CREATE INDEX reports_geog_gix ON reports USING GIST ((geom::geography));

CREATE TABLE report_tags (
    report_id UUID NOT NULL REFERENCES reports (id) ON DELETE CASCADE,
    tag VARCHAR(40) NOT NULL,
    PRIMARY KEY (report_id, tag)
);

CREATE TABLE basins (
    id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    commune VARCHAR(120) NOT NULL,
    obstruction_pct INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom geometry(Point, 4326) NOT NULL,
    CONSTRAINT basins_status_chk CHECK (status IN ('SURVEILLE', 'ELEVE', 'CRITIQUE')),
    CONSTRAINT basins_pct_chk CHECK (obstruction_pct BETWEEN 0 AND 100)
);

CREATE INDEX basins_geom_gix ON basins USING GIST (geom);

CREATE TABLE timeline_events (
    id UUID PRIMARY KEY,
    occurred_at TIMESTAMPTZ NOT NULL,
    title VARCHAR(200) NOT NULL,
    detail VARCHAR(300),
    kind VARCHAR(20) NOT NULL,
    CONSTRAINT timeline_kind_chk CHECK (kind IN ('ALERT', 'TEAM', 'REPORT', 'WORKS', 'WEATHER'))
);

CREATE TABLE field_teams (
    id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    zone VARCHAR(120),
    status VARCHAR(20) NOT NULL,
    assignment VARCHAR(200),
    CONSTRAINT teams_status_chk CHECK (status IN ('SUR_PLACE', 'EN_ROUTE', 'DISPONIBLE'))
);

CREATE TABLE whatsapp_contacts (
    id UUID PRIMARY KEY,
    wa_id VARCHAR(32) NOT NULL UNIQUE,
    display_name VARCHAR(120),
    language VARCHAR(16),
    neighborhood_id UUID REFERENCES neighborhoods (id),
    state VARCHAR(32) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    pending_place VARCHAR(180),
    pending_latitude DOUBLE PRECISION,
    pending_longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT wa_state_chk CHECK (state IN (
        'NEW', 'AWAITING_LANGUAGE', 'AWAITING_QUARTER', 'AWAITING_CONFIRM',
        'SUBSCRIBED', 'AWAITING_PHOTO', 'AWAITING_LOCATION', 'AWAITING_LEVEL', 'UNSUBSCRIBED'
    ))
);

CREATE TABLE outbound_messages (
    id UUID PRIMARY KEY,
    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(32) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT outbound_status_chk CHECK (status IN ('QUEUED', 'SENT', 'FAILED', 'SKIPPED'))
);

CREATE INDEX outbound_created_idx ON outbound_messages (created_at DESC);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE campaign_snapshot (
    id INT PRIMARY KEY,
    alerts_sent_today INT NOT NULL,
    reports_24h INT NOT NULL,
    reports_trend VARCHAR(80),
    active_black_spots INT NOT NULL,
    critical_black_spots INT NOT NULL,
    drains_to_clear INT NOT NULL,
    planned_this_week INT NOT NULL,
    vigilance_label VARCHAR(160),
    vigilance_window VARCHAR(80),
    vigilance_neighborhood VARCHAR(80),
    updated_at TIMESTAMPTZ NOT NULL,
    demo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE SEQUENCE report_ref_seq START WITH 340;

-- Le point PostGIS suit toujours latitude / longitude.
CREATE OR REPLACE FUNCTION edzii_set_point_geom() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$;

CREATE TRIGGER reports_geom_bi
    BEFORE INSERT OR UPDATE OF latitude, longitude ON reports
    FOR EACH ROW EXECUTE FUNCTION edzii_set_point_geom();

CREATE TRIGGER basins_geom_bi
    BEFORE INSERT OR UPDATE OF latitude, longitude ON basins
    FOR EACH ROW EXECUTE FUNCTION edzii_set_point_geom();
