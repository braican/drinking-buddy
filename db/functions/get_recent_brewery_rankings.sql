-- Computes brewery rankings from the most recent 1,000 checkins server-side,
-- returning aggregated rows instead of shipping 1,000 full checkin records.
-- Run this in the Supabase SQL editor, then deploy the updated SupabaseClient.ts.

CREATE OR REPLACE FUNCTION get_recent_brewery_rankings()
RETURNS TABLE (
  id           bigint,
  name         text,
  slug         text,
  type         text,
  label        text,
  city         text,
  state        text,
  country      text,
  lat          numeric,
  lng          numeric,
  hads         bigint,
  rated_hads   bigint,
  total_rating numeric,
  average      numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH recent AS (
    SELECT brewery, rating
    FROM   checkins
    ORDER  BY created_at DESC
    LIMIT  1000
  )
  SELECT
    b.id,
    b.name,
    b.slug,
    b.type,
    b.label,
    b.city,
    b.state,
    b.country,
    b.lat,
    b.lng,
    COUNT(*)::bigint            AS hads,
    COUNT(r.rating)::bigint     AS rated_hads,
    COALESCE(SUM(r.rating), 0)  AS total_rating,
    AVG(r.rating)               AS average
  FROM   recent r
  JOIN   breweries b ON b.id = r.brewery
  GROUP  BY b.id;
END;
$$;
