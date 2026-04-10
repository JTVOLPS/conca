-- Migration: 00021_portfolio_kpi_functions.sql
-- Postgres functions for portfolio dashboard KPIs

-- AUM: sum of purchase_price from deal_economics where deal is closed
create or replace function public.portfolio_aum()
returns numeric
language sql stable security invoker
as $$
  select coalesce(sum(de.purchase_price), 0)
  from public.deal_economics de
  join public.deals d on d.id = de.deal_id
  where d.org_id = auth.org_id()
    and d.stage = 'closed';
$$;

-- NOI for a given year: revenue - operating expenses
create or replace function public.portfolio_noi(p_year integer)
returns numeric
language sql stable security invoker
as $$
  select coalesce(
    sum(case when os.category = 'revenue' then coalesce(os.actual_amount, 0) else 0 end) -
    sum(case when os.category = 'operating_expense' then coalesce(os.actual_amount, 0) else 0 end),
    0
  )
  from public.operating_statements os
  where os.org_id = auth.org_id()
    and os.period_year = p_year;
$$;

-- Portfolio occupancy: occupied SF / total SF
create or replace function public.portfolio_occupancy()
returns numeric
language sql stable security invoker
as $$
  select case
    when coalesce(sum(p.total_sf), 0) = 0 then 0
    else round(
      coalesce(sum(t.occupied_sf), 0) / sum(p.total_sf) * 100,
      1
    )
  end
  from public.properties p
  left join public.tenants t on t.property_id = p.id and t.status = 'active'
  where p.org_id = auth.org_id();
$$;

-- Weighted avg cap rate for closed deals
create or replace function public.portfolio_weighted_cap_rate()
returns numeric
language sql stable security invoker
as $$
  select case
    when coalesce(sum(de.purchase_price), 0) = 0 then 0
    else round(
      sum(de.cap_rate_in * de.purchase_price) / sum(de.purchase_price),
      4
    )
  end
  from public.deal_economics de
  join public.deals d on d.id = de.deal_id
  where d.org_id = auth.org_id()
    and d.stage = 'closed'
    and de.cap_rate_in is not null
    and de.purchase_price is not null
    and de.purchase_price > 0;
$$;

-- Pipeline by stage: deal count and total value per stage
create or replace function public.pipeline_by_stage()
returns table(stage text, deal_count bigint, total_value numeric)
language sql stable security invoker
as $$
  select
    d.stage,
    count(d.id) as deal_count,
    coalesce(sum(de.purchase_price), 0) as total_value
  from public.deals d
  left join public.deal_economics de on de.deal_id = d.id
  where d.org_id = auth.org_id()
    and d.stage not in ('closed', 'dead')
  group by d.stage
  order by
    case d.stage
      when 'sourcing' then 1
      when 'loi' then 2
      when 'under_contract' then 3
      when 'due_diligence' then 4
    end;
$$;

-- Debt maturity ladder: count and total balance grouped by year
create or replace function public.debt_maturity_ladder()
returns table(maturity_year integer, loan_count bigint, total_balance numeric)
language sql stable security invoker
as $$
  select
    extract(year from di.maturity_date)::integer as maturity_year,
    count(di.id) as loan_count,
    coalesce(sum(di.current_balance), 0) as total_balance
  from public.debt_instruments di
  where di.org_id = auth.org_id()
    and di.maturity_date is not null
  group by maturity_year
  order by maturity_year;
$$;
