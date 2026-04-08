# Conca — Real Estate CRM Roadmap

## Phase 1: Foundation ✅

- [x] Auth (email/password), org setup, user invites
- [x] Contacts module — full CRUD, companies, relationships, notes, tags
- [x] Deals module — pipeline kanban + table views, deal detail, custom fields by asset class, deal economics
- [x] Properties module — basic CRUD, link to deals
- [x] Global search (Cmd+K)
- [x] Dashboard shell with stat widgets
- [x] CSV import for contacts and properties
- [x] Supabase schema with RLS on every table
- [x] Audit log infrastructure
- [x] Seed data

## Phase 2: Asset Management & Documents ✅

- [x] Rent roll / tenant tracking per property
- [x] Operating financials: monthly actuals vs budget, NOI tracking, variance reporting
- [x] Capex projects and budgets
- [x] Lease / contract expirations with alerts
- [x] Debt tracking (loan terms, maturity, DSCR, covenants)
- [x] Documents module — file storage per deal/property/contact via Supabase Storage
- [x] Document version history, tagging, and search

## Phase 3: Tasks, Reporting & Email ✅

- [x] Tasks & activities module — per deal, property, contact, or company
- [x] Assignable tasks with due dates and reminders
- [x] Portfolio-level KPIs dashboard (AUM, NOI, occupancy, weighted avg cap rate, debt maturity ladder)
- [x] Pipeline value and weighted pipeline reporting
- [x] Exportable reports (Excel)
- [x] Transactional email via Resend (invitations, reminders, alerts)
- [ ] Activity reporting per user (deferred — basic counts on dashboard)
- [ ] Email integration — BCC-to-deal (deferred to Phase 5)

## Phase 4: Investor & Advanced Features

- [ ] Investor module — investors, commitments, distributions, waterfall tracking
- [ ] Deal capital stack tab — investor breakdown per deal
- [ ] Activity feed / in-app notification system
- [ ] Google OAuth authentication
- [ ] Property map view with geolocation
- [ ] Advanced search with saved filters
- [ ] Bulk actions on contacts/deals/properties
- [ ] Investor portal (read-only view for LPs)

## Phase 5: AI & Automation

- [ ] AI deal summarization from uploaded documents
- [ ] Document extraction — auto-populate underwriting from offering memorandums
- [ ] Smart deal recommendations based on criteria
- [ ] Automated follow-up reminders based on interaction history
- [ ] Email parsing for automatic interaction logging (BCC-to-deal)
