-- Migration 18: Drop tables removed from the backoffice
-- Removed sections: Ventes, Ventes cash, Paiements, Devis, Factures,
--                   Bons de livraison, Clients, Entreprises, Fournisseurs, Trésorerie

-- Drop in dependency order (children before parents)
drop table if exists public.payments          cascade;
drop table if exists public.sales_documents   cascade;
drop table if exists public.sales_record_items cascade;
drop table if exists public.sales_records     cascade;
drop table if exists public.cash_sales        cascade;
drop table if exists public.balance_entries   cascade;
drop table if exists public.purchases         cascade;
drop table if exists public.suppliers         cascade;
drop table if exists public.companies         cascade;
drop table if exists public.clients           cascade;

-- Drop functions that were only used by the removed tables
drop function if exists public.handle_created_by() cascade;
drop function if exists public.handle_updated_by() cascade;
