# Git Commit Instructions for Morning Updates

## Files Modified:
1. `src/components/Sidebar.jsx` - Added photo display in sidebar
2. `src/components/Dashboard.jsx` - Added photos to connection cards & swapped layout
3. `src/components/Connections.jsx` - Added photo display in connection cards

## Files Created:
1. `fix-photo-upload.sql` - SQL script to fix photo uploads
2. `migrate-specific-users.sql` - User migration script
3. `check-users-without-auth.sql` - Diagnostic script
4. `MORNING-UPDATES-SUMMARY.md` - Summary document
5. `git-commit-instructions.md` - This file

## To Commit and Push:

### Option 1: Commit Everything Together
```bash
cd "C:\Users\Jeff\OneDrive\Desktop\networking-bude-clean\bude-app"
git add src/components/Sidebar.jsx
git add src/components/Dashboard.jsx
git add src/components/Connections.jsx
git add fix-photo-upload.sql
git add migrate-specific-users.sql
git commit -m "Add photo display throughout app and swap dashboard layout

- Add photo column support to Sidebar, Dashboard, and Connections
- Display user photos in all connection cards with initials fallback
- Swap dashboard layout: Connections on left, Events on right
- Create SQL scripts for photo upload fixes and user migration
- Compress profile photos to 400x400 for performance

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

### Option 2: Commit in Logical Groups

**Commit 1: Photo Display Feature**
```bash
git add src/components/Sidebar.jsx
git add src/components/Dashboard.jsx
git add src/components/Connections.jsx
git add fix-photo-upload.sql
git commit -m "Add profile photo display throughout the app

- Fetch and display user photos in Sidebar profile section
- Show photos in Dashboard connection cards
- Display photos in Connections page (main card, sidebar, modal)
- Add photo field to Supabase queries
- Graceful fallback to initials if no photo exists
- Create SQL script to add photo column and storage policies

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Commit 2: Dashboard Layout Update**
```bash
git add src/components/Dashboard.jsx
git commit -m "Swap Events and Connections on dashboard

- Move Connections to left column (prioritize networking)
- Move Events to right column
- Maintains responsive grid layout

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Commit 3: Migration Scripts**
```bash
git add migrate-specific-users.sql
git add check-users-without-auth.sql
git commit -m "Add SQL scripts for user migration to auth

- Create migration script template with Rick's data
- Add diagnostic script to check auth status
- Safely backup old IDs before migration
- Update all foreign key references

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Push all commits:**
```bash
git push
```

## Quick Commands:

**Check what's changed:**
```bash
git status
```

**See the diff:**
```bash
git diff src/components/Sidebar.jsx
git diff src/components/Dashboard.jsx
```

**Check commit history:**
```bash
git log --oneline -5
```
