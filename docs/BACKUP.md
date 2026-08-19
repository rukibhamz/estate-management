# Backup & restore

EstateFlow stores system of record data in PostgreSQL. Object files live in the `storage/` directory in development (or an S3-compatible bucket in production).

## Automated backups (production)

1. Enable point-in-time recovery on the managed Postgres provider (Neon / RDS).
2. Confirm a daily snapshot retention of at least 7 days.
3. Store `NEXTAUTH_SECRET` and `STORAGE_SECRET` in a secrets manager, not in the database dump.

## Restore test (required once per environment)

```bash
# Dump
pg_dump "$DATABASE_URL" > backup.sql

# Restore into a fresh database
createdb estateflow_restore
psql estateflow_restore < backup.sql
```

Then run `npx prisma migrate status` against the restored database and log in as a seed user to confirm projects, sales, and audit rows are present.

**Last restore test:** not yet run in this environment — execute the steps above against a disposable database before launch.
