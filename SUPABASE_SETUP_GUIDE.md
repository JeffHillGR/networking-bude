# Supabase Setup Guide for BudE

## Part 1: Create Supabase Project (~10 minutes)

### Step 1: Sign Up & Create Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free tier is perfect for MVP)
3. Click "New Project"
4. Fill in:
   - **Name**: `bude-networking` (or whatever you prefer)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to Grand Rapids (probably `East US`)
   - **Pricing Plan**: Free tier
5. Click "Create new project" (takes ~2 minutes to provision)

### Step 2: Get Your API Keys
Once the project is ready:
1. Go to **Settings** (gear icon) → **API**
2. You'll need these two keys:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOi...` (long string)
3. **SAVE THESE** - you'll add them to your `.env.local` file

---

## Part 2: Design Database Schema (~30 minutes)

### Users Table
```sql
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  photo text,
  title text,
  company text,
  bio text,
  industry text,
  location text,

  -- Onboarding data
  networking_goals text,
  organizations_current text[], -- array of strings
  organizations_interested text[], -- array of strings
  professional_interests text[], -- array of tags

  -- Preferences
  gender text,
  gender_preference text,
  age_range text,
  age_preference text,

  -- Metadata
  connection_count int default 0,
  max_connections int default 10,
  last_suggestion_sent_at timestamptz,
  next_suggestion_due_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Connections Table
```sql
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  connected_user_id uuid references public.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'rejected')),

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Ensure no duplicate connections
  unique(user_id, connected_user_id)
);
```

### Connection History Table (tracks suggestions)
```sql
create table public.connection_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  suggested_user_id uuid references public.users(id) on delete cascade,
  shown_at timestamptz default now(),
  action text check (action in ('pending', 'accepted', 'rejected', 'ignored')),
  times_shown int default 1,

  -- Track each suggestion
  unique(user_id, suggested_user_id, shown_at)
);
```

### How to Create Tables in Supabase:
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy/paste each CREATE TABLE statement above
4. Click **Run** for each one
5. Go to **Table Editor** to verify they were created

---

## Part 3: Set Up Row Level Security (RLS) (~20 minutes)

This ensures users can only see their own data.

### Enable RLS on All Tables
```sql
alter table public.users enable row level security;
alter table public.connections enable row level security;
alter table public.connection_history enable row level security;
```

### Users Table Policies
```sql
-- Users can read their own profile
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Users can view profiles of people they're matched with (we'll handle this in code)
create policy "Users can view matched profiles"
  on public.users for select
  using (true); -- We'll filter in application logic
```

### Connections Table Policies
```sql
-- Users can view their own connections
create policy "Users can view own connections"
  on public.connections for select
  using (auth.uid() = user_id or auth.uid() = connected_user_id);

-- Users can create connection requests
create policy "Users can create connections"
  on public.connections for insert
  with check (auth.uid() = user_id);

-- Users can update connections (accept/reject)
create policy "Users can update connections"
  on public.connections for update
  using (auth.uid() = connected_user_id);
```

### Connection History Policies
```sql
-- Only system can write to history (we'll use service key in backend)
create policy "Users can view own history"
  on public.connection_history for select
  using (auth.uid() = user_id);
```

---

## Part 4: Install Supabase Client (~5 minutes)

In your bude-app directory, run:

```bash
npm install @supabase/supabase-js
```

---

## Part 5: Configure Environment Variables (~5 minutes)

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Replace with your actual values from Step 2.

**IMPORTANT**: Add `.env.local` to your `.gitignore` (it should already be there)

---

## Part 6: Create Supabase Client (~5 minutes)

Create a new file: `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Part 7: Test the Connection (~5 minutes)

Add this to your Dashboard.jsx temporarily to test:

```javascript
import { supabase } from '../lib/supabase';

// Inside Dashboard component
useEffect(() => {
  async function testConnection() {
    const { data, error } = await supabase
      .from('users')
      .select('count');

    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('✅ Supabase connected! User count:', data);
    }
  }

  testConnection();
}, []);
```

If you see "✅ Supabase connected!" in the console, you're good!

---

## What You've Accomplished

✅ Created Supabase project
✅ Designed database schema
✅ Set up security policies
✅ Installed Supabase client
✅ Connected your app to Supabase

## Next Steps (We'll Do Together)

1. **Migrate onboarding data** - Save to Supabase instead of localStorage
2. **Build matching algorithm** - Create the backend function
3. **Connect frontend** - Replace mock data with real API calls
4. **Email notifications** - Set up connection request emails

---

## Helpful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## Estimated Time: ~90 minutes total

Take your time with each step. Let me know when you're ready to continue!
