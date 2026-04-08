-- Migration: 00011_seed_field_definitions.sql
-- Predefined custom field definitions for all asset classes

-- IOS (Industrial Outdoor Storage)
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('ios', 'total_acres', 'Total Acres', 'number', 1, 'Physical'),
  ('ios', 'paved_pct', 'Paved %', 'number', 2, 'Physical'),
  ('ios', 'num_tenants', 'Number of Tenants', 'number', 3, 'Operations'),
  ('ios', 'weighted_avg_lease_term', 'WALT (months)', 'number', 4, 'Operations'),
  ('ios', 'environmental_phase', 'Environmental Phase', 'select', 5, 'Due Diligence'),
  ('ios', 'zoning_compliant', 'Zoning Compliant', 'boolean', 6, 'Due Diligence');

-- Marina
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('marina', 'num_wet_slips', 'Wet Slips', 'number', 1, 'Physical'),
  ('marina', 'num_dry_slips', 'Dry Storage Slips', 'number', 2, 'Physical'),
  ('marina', 'total_linear_ft', 'Total Linear Feet', 'number', 3, 'Physical'),
  ('marina', 'fuel_station', 'Fuel Station', 'boolean', 4, 'Amenities'),
  ('marina', 'ship_store', 'Ship Store', 'boolean', 5, 'Amenities'),
  ('marina', 'restaurant', 'Restaurant/Bar', 'boolean', 6, 'Amenities'),
  ('marina', 'avg_slip_rate', 'Avg Monthly Slip Rate', 'number', 7, 'Operations'),
  ('marina', 'occupancy_seasonal', 'Seasonal Occupancy %', 'number', 8, 'Operations');

-- Hospitality
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('hospitality', 'num_keys', 'Number of Keys', 'number', 1, 'Physical'),
  ('hospitality', 'brand', 'Brand/Flag', 'text', 2, 'Operations'),
  ('hospitality', 'management_company', 'Management Company', 'text', 3, 'Operations'),
  ('hospitality', 'franchise_expiry', 'Franchise Expiry', 'date', 4, 'Operations'),
  ('hospitality', 'adr', 'ADR ($)', 'number', 5, 'Performance'),
  ('hospitality', 'revpar', 'RevPAR ($)', 'number', 6, 'Performance'),
  ('hospitality', 'occ_rate', 'Occupancy Rate %', 'number', 7, 'Performance'),
  ('hospitality', 'star_rating', 'Star Rating', 'select', 8, 'Physical');

-- Multifamily
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('multifamily', 'num_units', 'Total Units', 'number', 1, 'Physical'),
  ('multifamily', 'unit_mix', 'Unit Mix Summary', 'textarea', 2, 'Physical'),
  ('multifamily', 'avg_rent', 'Average Rent ($)', 'number', 3, 'Operations'),
  ('multifamily', 'market_rent', 'Market Rent ($)', 'number', 4, 'Operations'),
  ('multifamily', 'rent_growth_pct', 'Rent Growth %', 'number', 5, 'Operations'),
  ('multifamily', 'value_add', 'Value-Add Opportunity', 'boolean', 6, 'Strategy'),
  ('multifamily', 'renovation_cost_per_unit', 'Renovation $/Unit', 'number', 7, 'Strategy'),
  ('multifamily', 'laundry_income', 'Laundry Income (annual)', 'number', 8, 'Operations');

-- Transitional
insert into public.deal_field_definitions (asset_class, field_key, field_label, field_type, display_order, section) values
  ('transitional', 'current_use', 'Current Use', 'text', 1, 'Physical'),
  ('transitional', 'proposed_use', 'Proposed Use', 'text', 2, 'Strategy'),
  ('transitional', 'entitlement_status', 'Entitlement Status', 'select', 3, 'Due Diligence'),
  ('transitional', 'rezone_required', 'Rezone Required', 'boolean', 4, 'Due Diligence'),
  ('transitional', 'demolition_cost', 'Demolition Cost ($)', 'number', 5, 'Strategy'),
  ('transitional', 'development_timeline_months', 'Development Timeline (months)', 'number', 6, 'Strategy'),
  ('transitional', 'permits_in_hand', 'Permits in Hand', 'boolean', 7, 'Due Diligence');

-- Add select options
update public.deal_field_definitions
  set options = '["Phase I", "Phase I & II", "None Required", "Pending"]'
  where field_key = 'environmental_phase';

update public.deal_field_definitions
  set options = '["1", "2", "3", "4", "5"]'
  where field_key = 'star_rating';

update public.deal_field_definitions
  set options = '["Not Started", "In Progress", "Approved", "Denied"]'
  where field_key = 'entitlement_status';
