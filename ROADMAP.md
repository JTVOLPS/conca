# Conca — Real Estate CRM Roadmap

## Phase 1: Foundation (Current) ✅

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

## Phase 2: Asset Management & Documents

- [ ] Rent roll / tenant tracking per property
- [ ] Operating financials: monthly actuals vs budget, NOI tracking, variance reporting
- [ ] Capex projects and budgets
- [ ] Lease / contract expirations with alerts
- [ ] Debt tracking (loan terms, maturity, DSCR, covenants)
- [ ] Documents module — file storage per deal/property/contact via Supabase Storage
- [ ] Document version history, tagging, and search

## Phase 3: Tasks, Reporting & Email

- [ ] Tasks & activities module — per deal, property, or contact
- [ ] Assignable tasks with due dates and reminders
- [ ] Portfolio-level KPIs dashboard (AUM, NOI, occupancy, weighted avg cap rate, debt maturity ladder)
- [ ] Pipeline value and weighted pipeline reporting
- [ ] Activity reporting per user
- [ ] Exportable reports (PDF / Excel)
- [ ] Email integration — BCC-to-deal address to log emails against deals
- [ ] Transactional email via Resend (invitations, reminders, alerts)

## Phase 4: Investor & Advanced Features

- [ ] Investor distributions and waterfall tracking
- [ ] Investor portal (read-only view for LPs)
- [ ] Google OAuth authentication
- [ ] Property map view with geolocation
- [ ] Advanced search with saved filters
- [ ] Bulk actions on contacts/deals
- [ ] Activity feed / notification system

## Phase 5: AI & Automation

- [ ] AI deal summarization from uploaded documents
- [ ] Document extraction — auto-populate underwriting from offering memorandums
- [ ] Smart deal recommendations based on criteria
- [ ] Automated follow-up reminders based on interaction history
- [ ] Email parsing for automatic interaction logging
