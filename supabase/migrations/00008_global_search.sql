-- Migration: 00008_global_search.sql
-- Global search function combining all searchable entities

create or replace function public.global_search(search_query text, result_limit int default 20)
returns table(
  id uuid,
  entity_type text,
  title text,
  subtitle text,
  rank real
) as $$
declare
  tsquery_val tsquery;
  trgm_query text;
begin
  tsquery_val := websearch_to_tsquery('english', search_query);
  trgm_query := search_query;

  return query
  (
    select c.id, 'contact'::text,
           c.first_name || ' ' || c.last_name,
           coalesce(c.email, c.title, ''),
           ts_rank(c.search_vector, tsquery_val) + similarity(c.first_name || ' ' || c.last_name, trgm_query)
    from public.contacts c
    where c.org_id = auth.org_id()
      and (c.search_vector @@ tsquery_val
           or similarity(c.first_name || ' ' || c.last_name, trgm_query) > 0.15)
  )
  union all
  (
    select co.id, 'company'::text,
           co.name,
           coalesce(co.type, ''),
           ts_rank(co.search_vector, tsquery_val) + similarity(co.name, trgm_query)
    from public.companies co
    where co.org_id = auth.org_id()
      and (co.search_vector @@ tsquery_val
           or similarity(co.name, trgm_query) > 0.15)
  )
  union all
  (
    select d.id, 'deal'::text,
           d.name,
           d.stage || ' - ' || d.asset_class,
           ts_rank(d.search_vector, tsquery_val) + similarity(d.name, trgm_query)
    from public.deals d
    where d.org_id = auth.org_id()
      and (d.search_vector @@ tsquery_val
           or similarity(d.name, trgm_query) > 0.15)
  )
  union all
  (
    select p.id, 'property'::text,
           p.name,
           coalesce(p.city || ', ' || p.state, p.address_line1, ''),
           ts_rank(p.search_vector, tsquery_val) + similarity(p.name, trgm_query)
    from public.properties p
    where p.org_id = auth.org_id()
      and (p.search_vector @@ tsquery_val
           or similarity(p.name, trgm_query) > 0.15)
  )
  order by rank desc
  limit result_limit;
end;
$$ language plpgsql stable security definer;
