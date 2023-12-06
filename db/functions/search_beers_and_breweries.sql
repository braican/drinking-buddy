
create or replace function search_beers_and_breweries (query_text text) returns table (slug text, name text, table_name text) as $$
BEGIN
    RETURN QUERY (
        SELECT b.slug, b.name, 'beers' as table_name
        FROM beers b
        WHERE b.name ILIKE '%' || query_text || '%'
        LIMIT 10
    );

    RETURN QUERY (
        SELECT br.slug, br.name, 'breweries' as table_name
        FROM breweries br
        WHERE br.name ILIKE '%' || query_text || '%'
        LIMIT 10
    );
END;
$$ language plpgsql;