DROP FUNCTION search_beers_and_breweries(text);

CREATE OR REPLACE FUNCTION search_beers_and_breweries(query_text TEXT)
RETURNS TABLE (
    slug TEXT,
    beer_name TEXT,
    brewery_name TEXT,
    table_name TEXT
)
AS $$
BEGIN
    RETURN QUERY (
        SELECT
            b.slug AS slug,
            b.name AS beer_name,
            br.name AS brewery_name,
            'beers' AS table_name
        FROM beers b
        LEFT JOIN breweries br ON b.brewery = br.id
        WHERE b.name ILIKE '%' || query_text || '%'
        LIMIT 10
    );

    RETURN QUERY (
        SELECT
            br.slug AS slug,
            null AS beer_name,
            br.name AS brewery_name,
            'breweries' AS table_name
        FROM breweries br
        WHERE br.name ILIKE '%' || query_text || '%'
        LIMIT 10
    );
END;
$$ LANGUAGE plpgsql;