# 🔒 VETORRE Security Guide

## Overview

This document explains the security measures implemented in VETORRE to prevent unauthorized access to admin features.

## ⚠️ Critical Security Issue: Frontend Code Visibility

**IMPORTANT:** All frontend code (React, TypeScript) is visible in the browser's developer console. Anyone can:
- View the complete source code
- See admin verification logic
- Modify their user role in the browser
- Access admin UI components

### ✅ Solution: Server-Side Protection (Supabase RLS)

We use **Row Level Security (RLS) policies** in Supabase to protect the database. Even if someone modifies their role in the browser, **Supabase will reject all unauthorized requests**.

---

## 🛡️ Security Layers

### 1. Database Row Level Security (RLS)

The following RLS policies are configured in Supabase to prevent privilege escalation:

#### Profiles Table Security

```sql
-- ✅ CRITICAL: Prevents users from changing their own role to 'admin'
create policy "Users can update own profile (non-role fields)."
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    -- Ensures the role field hasn't changed
    (select role from public.profiles where id = auth.uid()) = role
  );

-- ✅ Only existing admins can modify roles
create policy "Only admins can update roles."
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
```

#### Tools & News Table Security

```sql
-- ✅ Only admins can insert/update/delete tools
create policy "Admins can insert tools."
  on public.tools for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can update tools."
  on public.tools for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can delete tools."
  on public.tools for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
```

### 2. Environment Variable Admin List

Admin emails are stored in environment variables (not in frontend code):

```typescript
// env.example.tsx
export const VITE_ADMIN_EMAILS = 'admin@example.com,owner@example.com';
```

**⚠️ IMPORTANT:**
- Create a `.env` file (which is in `.gitignore`)
- Never commit actual admin emails to Git
- The server checks this list on authentication

### 3. Silent Error Handling

All admin verification errors are handled silently (no console logs) to prevent exposing admin logic:

```typescript
// ❌ BAD - Exposes admin check
console.warn("Error fetching profile, checking overrides:", error);

// ✅ GOOD - Silent handling
// Silently handle profile fetch errors for security (no console logging)
```

---

## 🚀 How to Apply Security Policies

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com
2. Open your VETORRE project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run Security SQL Script

Copy and paste the complete SQL schema from **AdminDashboard.tsx** (lines 130-210) into the SQL Editor and execute it.

Alternatively, run these commands individually:

```sql
-- 1. Drop old insecure policy
drop policy if exists "Users can update own profile." on public.profiles;

-- 2. Create new secure policies
create policy "Users can update own profile (non-role fields)."
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    (select role from public.profiles where id = auth.uid()) = role
  );

create policy "Only admins can update roles."
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
```

### Step 3: Verify Policies

Run this query to verify your RLS policies are active:

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename in ('profiles', 'tools', 'news');
```

You should see all the security policies listed.

### Step 4: Test Security

1. Create a test user account (non-admin)
2. Try to update the test user's role to 'admin' using Supabase client:
   ```typescript
   await supabase
     .from('profiles')
     .update({ role: 'admin' })
     .eq('id', testUserId);
   ```
3. This should **fail** with a policy violation error

---

## 🔐 Additional Security Best Practices

### 1. Never Trust Frontend

- ✅ Always validate on server (Supabase RLS)
- ✅ Assume all frontend code can be modified
- ✅ Hide sensitive logic behind API endpoints

### 2. Secure Admin Email Configuration

```bash
# .env (NOT committed to Git)
VITE_ADMIN_EMAILS=your-real-admin@example.com,owner@example.com
```

### 3. Regular Security Audits

- Review Supabase logs for suspicious activity
- Check for unauthorized admin access attempts
- Monitor database policy violations

### 4. Production Deployment

Before deploying to production:

1. ✅ Verify all RLS policies are enabled
2. ✅ Test with non-admin accounts
3. ✅ Remove any debug console.log statements
4. ✅ Ensure `.env` is in `.gitignore`
5. ✅ Use environment variables in Vercel/hosting platform

---

## 📝 Summary

| Attack Vector | Protection | Status |
|--------------|------------|--------|
| User modifies role in browser | RLS policies prevent DB updates | ✅ Protected |
| User tries to insert/update tools | RLS checks admin role in DB | ✅ Protected |
| Admin email exposed in console | Silent error handling | ✅ Protected |
| Frontend code visible | Server-side validation | ✅ Protected |
| Privilege escalation | Role change blocked by RLS | ✅ Protected |

**Bottom Line:** Even if someone can see and modify the frontend code, they **cannot** bypass the server-side security in Supabase. The database will reject all unauthorized requests.

---

## 🆘 Emergency: If Security is Compromised

If you suspect someone gained admin access:

1. **Immediately** change all admin passwords
2. Review Supabase logs for unauthorized changes
3. Check `profiles` table for unexpected admin roles:
   ```sql
   select * from profiles where role = 'admin';
   ```
4. Reset any suspicious accounts to 'user' role (as admin)
5. Rotate environment variables
6. Review recent tool/news changes for malicious content

---

**Last Updated:** December 26, 2025
**Version:** 1.0
