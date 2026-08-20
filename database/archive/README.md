# Archived Migrations — DO NOT RUN

These migrations were superseded by `migrations/011_consolidated_player_applications.sql` (Aug 2026).

## Why they were archived

They were written incrementally against a long-gone cloud Supabase project and
**conflict with each other on a fresh install**:

| File | Problem |
|---|---|
| `005_create_player_applications.sql` | Creates table with `BIGSERIAL` PK + `cv_*` columns `NOT NULL` (form no longer sends them) |
| `006_create_player_applications.sql` | Creates the *same table* with `UUID` PK — running after 005 always fails |
| `006_make_cv_optional.sql` | Relaxes 005's NOT NULLs — correct intent, wrong baseline |
| `010_add_date_of_birth_to_player_applications.sql` | References a trigger function (`update_player_applications_updated_at`) that no migration ever created |

## Source of truth

- **Fresh installs:** run `migrations/011_consolidated_player_applications.sql` only
- **Live environment:** self-hosted Supabase at `db.cryptosidao.org` (already applied, verified end-to-end)

Kept for history/audit only.
