-- Seed data for Conca Real Estate CRM
-- NOTE: Run this after creating a user through the signup flow.
-- Replace 'ORG_ID' and 'USER_ID' with actual values from your setup.

-- This seed file provides example data structure.
-- In practice, use the app's signup flow to create the org and first user,
-- then run the INSERT statements below with the correct IDs.

-- Example: After signup, get your org_id and user_id from the database:
-- SELECT id FROM public.orgs LIMIT 1;
-- SELECT id FROM auth.users LIMIT 1;

-- Then run with substituted IDs:

-- ============================================================
-- CONTACTS
-- ============================================================

-- To seed contacts, run after replacing ORG_ID and USER_ID:

/*
INSERT INTO public.contacts (org_id, first_name, last_name, email, phone, title, type, city, state, tags, source, created_by) VALUES
  ('ORG_ID', 'John', 'Mitchell', 'john.mitchell@cbrebrokerage.com', '(555) 123-4001', 'Senior Vice President', 'broker', 'Dallas', 'TX', ARRAY['CRE','industrial'], 'Referral', 'USER_ID'),
  ('ORG_ID', 'Sarah', 'Chen', 'sarah.chen@marinacapital.com', '(555) 123-4002', 'Managing Partner', 'investor', 'Miami', 'FL', ARRAY['marina','equity'], 'Conference', 'USER_ID'),
  ('ORG_ID', 'Michael', 'Rodriguez', 'mike.r@firstnationalbank.com', '(555) 123-4003', 'VP Commercial Lending', 'lender', 'Houston', 'TX', ARRAY['debt','CRE'], 'Cold outreach', 'USER_ID'),
  ('ORG_ID', 'Emily', 'Watkins', 'ewatkins@watkinslegal.com', '(555) 123-4004', 'Partner', 'attorney', 'Austin', 'TX', ARRAY['closing','RE-law'], 'Referral', 'USER_ID'),
  ('ORG_ID', 'David', 'Park', 'dpark@suncoastPM.com', '(555) 123-4005', 'Regional Manager', 'property_manager', 'Tampa', 'FL', ARRAY['hospitality','management'], 'LinkedIn', 'USER_ID'),
  ('ORG_ID', 'Jessica', 'Thompson', 'jthompson@vanguardcap.com', '(555) 123-4006', 'Principal', 'investor', 'New York', 'NY', ARRAY['LP','institutional'], 'Conference', 'USER_ID'),
  ('ORG_ID', 'Robert', 'Kim', 'rkim@nexgenbrokers.com', '(555) 123-4007', 'Associate', 'broker', 'Charlotte', 'NC', ARRAY['multifamily','sourcing'], 'Email', 'USER_ID'),
  ('ORG_ID', 'Amanda', 'Foster', 'afoster@greenfieldinspections.com', '(555) 123-4008', 'Lead Inspector', 'contractor', 'Orlando', 'FL', ARRAY['DD','environmental'], 'Vendor list', 'USER_ID'),
  ('ORG_ID', 'Thomas', 'Wright', 'twright@wrightappraisal.com', '(555) 123-4009', 'MAI Appraiser', 'contractor', 'Nashville', 'TN', ARRAY['appraisal','valuation'], 'Referral', 'USER_ID'),
  ('ORG_ID', 'Lisa', 'Martinez', 'lisa.m@baysidemarina.com', '(555) 123-4010', 'General Manager', 'tenant', 'Destin', 'FL', ARRAY['marina','operations'], 'Property visit', 'USER_ID'),
  ('ORG_ID', 'James', 'Anderson', 'janderson@meridiandev.com', '(555) 123-4011', 'CEO', 'partner', 'Atlanta', 'GA', ARRAY['JV','development'], 'Network', 'USER_ID'),
  ('ORG_ID', 'Katherine', 'Lee', 'klee@coastaltitle.com', '(555) 123-4012', 'Closing Officer', 'attorney', 'Jacksonville', 'FL', ARRAY['title','closing'], 'Referral', 'USER_ID'),
  ('ORG_ID', 'Mark', 'Johnson', 'mjohnson@pinnaclelending.com', '(555) 123-4013', 'SVP CRE Lending', 'lender', 'Chicago', 'IL', ARRAY['bridge','construction'], 'Conference', 'USER_ID'),
  ('ORG_ID', 'Rachel', 'Davis', 'rdavis@horizonequity.com', '(555) 123-4014', 'Associate', 'investor', 'Boston', 'MA', ARRAY['LP','family-office'], 'Warm intro', 'USER_ID'),
  ('ORG_ID', 'Steven', 'Wilson', 'swilson@wilsoncontractors.com', '(555) 123-4015', 'Owner', 'contractor', 'Savannah', 'GA', ARRAY['GC','renovation'], 'Vendor list', 'USER_ID');

-- ============================================================
-- COMPANIES
-- ============================================================

INSERT INTO public.companies (org_id, name, type, website, phone, city, state, tags, created_by) VALUES
  ('ORG_ID', 'CBRE Southeast', 'brokerage', 'https://cbre.com', '(555) 200-1001', 'Dallas', 'TX', ARRAY['national','industrial'], 'USER_ID'),
  ('ORG_ID', 'Marina Capital Partners', 'investor', 'https://marinacap.com', '(555) 200-1002', 'Miami', 'FL', ARRAY['marina','equity'], 'USER_ID'),
  ('ORG_ID', 'First National Bank CRE', 'lender', 'https://fnbcre.com', '(555) 200-1003', 'Houston', 'TX', ARRAY['senior-debt','CRE'], 'USER_ID'),
  ('ORG_ID', 'Watkins & Associates Legal', 'law_firm', 'https://watkinslegal.com', '(555) 200-1004', 'Austin', 'TX', ARRAY['RE-law','closing'], 'USER_ID'),
  ('ORG_ID', 'Suncoast Property Management', 'property_manager', 'https://suncoastpm.com', '(555) 200-1005', 'Tampa', 'FL', ARRAY['hospitality','management'], 'USER_ID'),
  ('ORG_ID', 'Vanguard Capital Advisors', 'investor', 'https://vanguardcap.com', '(555) 200-1006', 'New York', 'NY', ARRAY['institutional','LP'], 'USER_ID'),
  ('ORG_ID', 'NexGen Brokers', 'brokerage', 'https://nexgenbrokers.com', '(555) 200-1007', 'Charlotte', 'NC', ARRAY['multifamily','sourcing'], 'USER_ID'),
  ('ORG_ID', 'Coastal Title Company', 'title_company', 'https://coastaltitle.com', '(555) 200-1008', 'Jacksonville', 'FL', ARRAY['title','closing'], 'USER_ID'),
  ('ORG_ID', 'Pinnacle Lending Group', 'lender', 'https://pinnaclelending.com', '(555) 200-1009', 'Chicago', 'IL', ARRAY['bridge','construction'], 'USER_ID'),
  ('ORG_ID', 'Meridian Development Partners', 'developer', 'https://meridiandev.com', '(555) 200-1010', 'Atlanta', 'GA', ARRAY['JV','development'], 'USER_ID');

-- ============================================================
-- PROPERTIES
-- ============================================================

INSERT INTO public.properties (org_id, name, asset_class, status, address_line1, city, state, zip, latitude, longitude, total_sf, lot_size_acres, year_built, num_units, custom_fields, tags, created_by) VALUES
  ('ORG_ID', 'Westside Industrial Yard', 'ios', 'active', '4500 Industrial Blvd', 'Dallas', 'TX', '75212', 32.7870, -96.8490, NULL, 12.5, 2005, NULL, '{"total_acres": 12.5, "paved_pct": 60}', ARRAY['IOS','Dallas'], 'USER_ID'),
  ('ORG_ID', 'Harbor Bay Marina', 'marina', 'under_contract', '100 Marina Way', 'Destin', 'FL', '32541', 30.3935, -86.4958, NULL, 5.2, 1998, NULL, '{"num_wet_slips": 120, "num_dry_slips": 80, "fuel_station": true}', ARRAY['marina','Gulf'], 'USER_ID'),
  ('ORG_ID', 'Sunset Boutique Hotel', 'hospitality', 'active', '789 Beachfront Dr', 'St. Augustine', 'FL', '32080', 29.9012, -81.3124, 45000, 1.8, 1985, 60, '{"num_keys": 60, "adr": 175, "occ_rate": 72}', ARRAY['hospitality','boutique'], 'USER_ID'),
  ('ORG_ID', 'Oakwood Apartments', 'multifamily', 'closed', '2200 Oak Park Lane', 'Charlotte', 'NC', '28205', 35.2271, -80.8431, 120000, 8.0, 2010, 150, '{"num_units": 150, "avg_rent": 1250, "value_add": true}', ARRAY['multifamily','value-add'], 'USER_ID'),
  ('ORG_ID', 'Former Textile Mill', 'transitional', 'active', '500 Mill Street', 'Savannah', 'GA', '31401', 32.0809, -81.0912, 80000, 3.5, 1940, NULL, '{"current_use": "Vacant warehouse", "proposed_use": "Mixed-use retail/residential"}', ARRAY['transitional','adaptive-reuse'], 'USER_ID'),
  ('ORG_ID', 'Gulf Coast Storage Depot', 'ios', 'active', '8800 Highway 98', 'Panama City', 'FL', '32401', 30.1588, -85.6602, NULL, 20.0, 2015, NULL, '{"total_acres": 20, "paved_pct": 40, "num_tenants": 8}', ARRAY['IOS','Panhandle'], 'USER_ID'),
  ('ORG_ID', 'Riverside Marina & Resort', 'marina', 'active', '250 River Road', 'Apalachicola', 'FL', '32320', 29.7261, -84.9852, 15000, 8.0, 2001, NULL, '{"num_wet_slips": 65, "restaurant": true, "ship_store": true}', ARRAY['marina','river'], 'USER_ID'),
  ('ORG_ID', 'Magnolia Gardens MF', 'multifamily', 'active', '1500 Magnolia Ave', 'Nashville', 'TN', '37212', 36.1627, -86.7816, 95000, 6.0, 2008, 120, '{"num_units": 120, "avg_rent": 1400, "rent_growth_pct": 4.5}', ARRAY['multifamily','Nashville'], 'USER_ID');

-- ============================================================
-- DEALS
-- ============================================================

INSERT INTO public.deals (org_id, name, asset_class, stage, stage_position, property_id, description, tags, custom_fields, sourced_at, created_by) VALUES
  ('ORG_ID', 'Westside IOS Acquisition', 'ios', 'due_diligence', 0, (SELECT id FROM properties WHERE name = 'Westside Industrial Yard' LIMIT 1), '12.5-acre industrial outdoor storage facility in Dallas. Strong tenant base with 95% occupancy.', ARRAY['IOS','Dallas','DD'], '{"total_acres": 12.5, "paved_pct": 60, "num_tenants": 6}', '2024-01-15', 'USER_ID'),
  ('ORG_ID', 'Harbor Bay Marina Purchase', 'marina', 'under_contract', 0, (SELECT id FROM properties WHERE name = 'Harbor Bay Marina' LIMIT 1), '120-slip marina in Destin with fuel station and ship store. Prime Gulf location.', ARRAY['marina','Destin','UC'], '{"num_wet_slips": 120, "fuel_station": true}', '2024-02-01', 'USER_ID'),
  ('ORG_ID', 'Sunset Hotel Renovation', 'hospitality', 'loi', 0, (SELECT id FROM properties WHERE name = 'Sunset Boutique Hotel' LIMIT 1), 'Boutique hotel in St. Augustine. Value-add play with rooms renovation.', ARRAY['hospitality','value-add','LOI'], '{"num_keys": 60, "adr": 175}', '2024-03-01', 'USER_ID'),
  ('ORG_ID', 'Gulf Coast IOS Portfolio', 'ios', 'sourcing', 0, (SELECT id FROM properties WHERE name = 'Gulf Coast Storage Depot' LIMIT 1), '20-acre IOS facility in Panama City. Fragmented ownership opportunity.', ARRAY['IOS','sourcing'], '{"total_acres": 20}', '2024-03-15', 'USER_ID'),
  ('ORG_ID', 'Riverside Marina Resort', 'marina', 'sourcing', 1, (SELECT id FROM properties WHERE name = 'Riverside Marina & Resort' LIMIT 1), 'Marina and resort on the Apalachicola River. 65 wet slips with restaurant.', ARRAY['marina','sourcing'], '{"num_wet_slips": 65}', '2024-03-20', 'USER_ID'),
  ('ORG_ID', 'Magnolia Gardens Value-Add', 'multifamily', 'loi', 1, (SELECT id FROM properties WHERE name = 'Magnolia Gardens MF' LIMIT 1), '120-unit multifamily in Nashville. Interior renovation opportunity with 15% rent bump.', ARRAY['multifamily','Nashville','LOI'], '{"num_units": 120}', '2024-02-20', 'USER_ID'),
  ('ORG_ID', 'Savannah Mill Redevelopment', 'transitional', 'sourcing', 2, (SELECT id FROM properties WHERE name = 'Former Textile Mill' LIMIT 1), 'Historic textile mill conversion to mixed-use. Strong historic tax credit potential.', ARRAY['transitional','adaptive-reuse'], '{"current_use": "Vacant warehouse"}', '2024-04-01', 'USER_ID'),
  ('ORG_ID', 'Oakwood Apartments', 'multifamily', 'closed', 0, (SELECT id FROM properties WHERE name = 'Oakwood Apartments' LIMIT 1), 'Successfully acquired 150-unit complex in Charlotte. Closed Q1 2024.', ARRAY['multifamily','closed'], '{"num_units": 150}', '2023-09-01', 'USER_ID'),
  ('ORG_ID', 'Atlanta Office Tower', 'other', 'dead', 0, NULL, 'Office tower in Midtown Atlanta. Walked away due to high vacancy and market conditions.', ARRAY['office','dead'], '{}', '2023-11-01', 'USER_ID'),
  ('ORG_ID', 'Emerald Coast IOS', 'ios', 'sourcing', 3, NULL, 'Potential 15-acre IOS site on the Emerald Coast. Preliminary conversations with landowner.', ARRAY['IOS','early-stage'], '{"total_acres": 15}', '2024-04-05', 'USER_ID');

-- ============================================================
-- DEAL ECONOMICS (for deals in advanced stages)
-- ============================================================

INSERT INTO public.deal_economics (deal_id, org_id, asking_price, offer_price, purchase_price, noi, cap_rate_in, loan_amount, ltv, interest_rate, loan_term_months, irr_target, equity_multiple, total_equity, sponsor_equity, lp_equity, capex_budget, hold_period_months) VALUES
  ((SELECT id FROM deals WHERE name = 'Westside IOS Acquisition' LIMIT 1), 'ORG_ID', 8500000, 7800000, 8000000, 680000, 0.0850, 5600000, 0.7000, 0.0675, 60, 0.1800, 2.10, 2400000, 480000, 1920000, 250000, 60),
  ((SELECT id FROM deals WHERE name = 'Harbor Bay Marina Purchase' LIMIT 1), 'ORG_ID', 12000000, 10500000, 11000000, 880000, 0.0800, 7700000, 0.7000, 0.0700, 120, 0.2000, 2.30, 3300000, 660000, 2640000, 500000, 84),
  ((SELECT id FROM deals WHERE name = 'Sunset Hotel Renovation' LIMIT 1), 'ORG_ID', 6500000, NULL, NULL, 420000, 0.0646, NULL, NULL, NULL, NULL, 0.2200, 2.50, NULL, NULL, NULL, 1200000, 60),
  ((SELECT id FROM deals WHERE name = 'Oakwood Apartments' LIMIT 1), 'ORG_ID', 22000000, 20000000, 20500000, 1640000, 0.0800, 14350000, 0.7000, 0.0550, 120, 0.1650, 2.00, 6150000, 1230000, 4920000, 3000000, 60);
*/

-- ============================================================
-- NOTE: To use this seed data:
-- 1. Sign up through the app to create your org and user
-- 2. Get your org_id: SELECT id FROM public.orgs LIMIT 1;
-- 3. Get your user_id: SELECT id FROM auth.users LIMIT 1;
-- 4. Find/replace 'ORG_ID' and 'USER_ID' above with real values
-- 5. Uncomment the INSERT blocks above and run them
-- ============================================================
