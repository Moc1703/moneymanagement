-- 0005_search_fts.sql
-- Phase 1: Full-text search on transactions.description
-- Uses Postgres `simple` config — no stemming needed for Indo personal-scale data.
-- Indexed via GIN for fast websearch_to_tsquery() lookups.

-- ============================================================================
-- search_vector — generated stored column
-- ============================================================================
alter table public.transactions
  add column if not exists search_vector tsvector
  generated always as (to_tsvector('simple', coalesce(description, ''))) stored;

create index if not exists transactions_search_idx
  on public.transactions using gin (search_vector);
