# Database Migrations

This directory contains all database migrations for the Networking BudE application, organized chronologically.

## Migration Strategy

- **Numbered migrations**: `001_`, `002_`, etc. for sequential execution
- **Descriptive names**: Clear description of what each migration does
- **Idempotent**: Migrations can be run multiple times safely
- **Rollback support**: Include rollback scripts where applicable

## Current Migrations

### Core Schema

- `001_optimal_rls_policies.sql` - **LATEST** Comprehensive RLS policies with security hardening

### Historical Migrations (Root Directory)

The following migrations are available in the root directory for reference:

#### Table Creation
- `supabase-setup.sql` - Initial users table setup
- `create-matches-table.sql` - Matches table for connection recommendations
- `create-notifications-table.sql` - Notifications system
- `create-notification-preferences-table.sql` - User notification preferences
- `create-email-change-requests-table.sql` - Secure email change workflow
- `create-event-likes-table.sql` - Event engagement tracking
- `create-event-registration-clicks-table.sql` - Event click tracking
- `create-events-rls-policies.sql` - Events table RLS

#### RLS Policy Updates
- `fix-rls-policies.sql` - RLS policy fixes for users table
- `fix-rls-policies-users-and-storage.sql` - Combined users + storage RLS
- `fix-rls-select.sql` - SELECT policy fixes
- `fix-rls-simple.sql` - Simplified RLS implementation
- `fix-rls-with-email.sql` - Email-based RLS
- `clean-users-rls.sql` - Clean up users RLS
- `fix-users-rls-policy.sql` - Users RLS policy improvements
- `fix-users-rls-policy-secure.sql` - Secure users RLS
- `fix-user-own-profile-access.sql` - Own profile access fix
- `restore-working-rls-policies.sql` - Restore known working policies

#### Matches Table Fixes
- `fix-matches-table.sql` - Matches table schema fixes
- `fix-matches-rls.sql` - Matches RLS policies
- `fix-matches-rls-simple.sql` - Simplified matches RLS
- `fix-matches-rls-secure.sql` - Secure matches RLS
- `update-matches-policy.sql` - Matches policy updates
- `update-matches-status-for-mutual.sql` - Mutual connection status

#### Storage Policies
- `fix-storage-policies.sql` - Supabase Storage RLS policies
- `fix-photo-upload.sql` - Photo upload fixes

#### Data Migrations
- `migrate-users-to-auth-template.sql` - Migrate users to auth schema
- `migrate-specific-users.sql` - Specific user data migration
- `migrate-events.sql` - Events data migration

#### Utility Scripts
- `add-users-select-policy.sql` - Add users SELECT policy
- `add-featured-content-slots.sql` - Featured content system
- `setup-automated-matching.sql` - Automated matching setup
- `reset-saved-connections-monday.sql` - Weekly connection reset

#### Cleanup Scripts
- `cleanup-duplicate-policies.sql` - Remove duplicate RLS policies
- `temp-disable-insert-rls.sql` - Temporary RLS disable (dev only)
- `temp-allow-all-read.sql` - Temporary read access (dev only)

#### Diagnostic Scripts
- `check-rls-policies.sql` - Verify current RLS policies
- `check-users-table-schema.sql` - Verify users table schema
- `check-triggers.sql` - Check database triggers
- `check-triggers-and-constraints.sql` - Comprehensive trigger check
- `debug-tables.sql` - Debug table structure

#### Analytics & Reports
- `analytics-dashboard-query.sql` - Analytics queries
- `analytics-simple.sql` - Simple analytics
- `analytics-report-v2.sql` - Analytics report v2

#### User-Specific Debugging
- `diagnose-joe-blume.sql`
- `get-joe-auth-data.sql`
- `verify-joe-profile.sql`
- `verify-joe-data-exists.sql`
- `check-joe-compatibility.sql`
- `check-joe-jeff-match.sql`
- `check-joe-blume-matches.sql`
- `check-jeff-profile.sql`
- `check-test-users.sql`
- `check-users-without-auth.sql`

## Migration Execution Order

### For New Database Setup

Run these migrations in order:

1. `supabase-setup.sql` - Create users table
2. `create-matches-table.sql` - Create matches table
3. `create-notifications-table.sql` - Create notifications table
4. `create-notification-preferences-table.sql` - Create notification preferences
5. `create-email-change-requests-table.sql` - Create email change requests table
6. `create-event-likes-table.sql` - Create event likes table
7. `create-event-registration-clicks-table.sql` - Create event clicks table
8. `create-events-rls-policies.sql` - Set up events RLS
9. `001_optimal_rls_policies.sql` - **Apply optimized RLS policies**

### For Existing Database

If you have an existing database, run:

1. `001_optimal_rls_policies.sql` - This will drop and recreate all RLS policies with security improvements

## Running Migrations

### Via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
2. Copy the contents of the migration file
3. Paste and execute
4. Verify execution with `check-rls-policies.sql`

### Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migration
supabase db push

# Or run specific migration
psql $DATABASE_URL < supabase/migrations/001_optimal_rls_policies.sql
```

## Verifying Migrations

After running migrations, verify with:

```sql
-- Check all RLS policies
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check table structure
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## Rollback Strategy

If a migration causes issues:

1. **For RLS policies**: Run previous version (e.g., `restore-working-rls-policies.sql`)
2. **For schema changes**: Manually drop added columns/tables
3. **For data migrations**: Restore from backup

Always test migrations in a staging environment first!

## Best Practices

1. **Test First**: Always test migrations in development/staging
2. **Backup**: Take database snapshot before running migrations
3. **Idempotent**: Use `IF EXISTS` / `IF NOT EXISTS` clauses
4. **Atomic**: Keep migrations focused on single concern
5. **Documented**: Add comments explaining why changes are needed
6. **Reversible**: Include rollback scripts for critical migrations

## Migration Checklist

Before running a migration:

- [ ] Reviewed migration SQL for syntax errors
- [ ] Tested migration in development environment
- [ ] Backed up production database
- [ ] Verified no conflicts with existing schema
- [ ] Prepared rollback plan
- [ ] Scheduled during low-traffic period
- [ ] Notified team of maintenance window

After running a migration:

- [ ] Verified migration executed successfully
- [ ] Checked application still functions correctly
- [ ] Verified RLS policies are correct
- [ ] Tested affected features
- [ ] Monitored for errors in logs
- [ ] Documented any issues encountered

## Support

For migration issues, consult:

- [Security Audit Report](../wiki/security/SECURITY_AUDIT_REPORT.md)
- [Architecture Documentation](../wiki/architecture/)
- Supabase Dashboard Logs
- Application error logs

---

**Last Updated**: 2025-11-12
**Maintained By**: Development Team
