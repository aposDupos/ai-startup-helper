-- Fix: add 'peer_review' to xp_transactions source check constraint
-- Sprint 13 introduced peer review with +15 XP, but the source value was missing from the check

ALTER TABLE xp_transactions DROP CONSTRAINT xp_transactions_source_check;
ALTER TABLE xp_transactions ADD CONSTRAINT xp_transactions_source_check
  CHECK (source = ANY (ARRAY['lesson','quiz','stage','chat','achievement','streak','challenge','pitch','peer_review']));
