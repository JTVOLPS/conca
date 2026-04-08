-- Migration: 00018_views_functions.sql
-- Rent roll view and lease expiration function

-- Rent roll view: tenants joined with their most recent lease
create or replace view public.v_rent_roll as
select
  t.id as tenant_id,
  t.property_id,
  t.org_id,
  t.name as tenant_name,
  t.unit_label,
  t.status as tenant_status,
  t.occupied_sf,
  t.contact_id,
  l.id as lease_id,
  l.lease_type,
  l.start_date,
  l.end_date,
  l.rent_amount,
  l.rent_frequency,
  l.cam_charges,
  coalesce(l.rent_amount, 0) + coalesce(l.cam_charges, 0) as total_monthly_rent,
  l.rent_escalation_pct,
  l.security_deposit,
  case
    when l.end_date is null then 'month_to_month'
    when l.end_date <= current_date then 'expired'
    when l.end_date <= current_date + interval '90 days' then 'expiring_soon'
    else 'active'
  end as lease_status
from public.tenants t
left join lateral (
  select *
  from public.leases l2
  where l2.tenant_id = t.id
  order by l2.start_date desc
  limit 1
) l on true;

-- Function: get leases expiring within N days (respects RLS via SECURITY DEFINER + org_id check)
create or replace function public.get_expiring_leases(days_ahead integer default 90)
returns setof public.leases
language sql
stable
security invoker
as $$
  select *
  from public.leases
  where org_id = auth.org_id()
    and end_date is not null
    and end_date between current_date and (current_date + (days_ahead || ' days')::interval)
  order by end_date asc;
$$;
