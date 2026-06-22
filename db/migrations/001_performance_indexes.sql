-- Performance indexes for frequently-queried columns.
-- Run this in the Supabase SQL editor.

CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_brewery    ON checkins(brewery);
CREATE INDEX IF NOT EXISTS idx_checkins_beer       ON checkins(beer);
CREATE INDEX IF NOT EXISTS idx_checkins_venue      ON checkins(venue);

CREATE INDEX IF NOT EXISTS idx_beers_slug          ON beers(slug);
CREATE INDEX IF NOT EXISTS idx_beers_brewery       ON beers(brewery);

CREATE INDEX IF NOT EXISTS idx_breweries_slug      ON breweries(slug);

CREATE INDEX IF NOT EXISTS idx_venues_slug         ON venues(slug);

-- Trigram indexes for fast ILIKE search (requires pg_trgm extension).
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_beers_name_trgm      ON beers     USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_breweries_name_trgm  ON breweries USING GIN (name gin_trgm_ops);
