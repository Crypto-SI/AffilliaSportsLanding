# Database Setup Instructions

## Overview
This document provides instructions for setting up the Affillia Sports mailing list database to collect player registration information from the website.

## Prerequisites
- Self-hosted Supabase instance running at `https://api.supabase.cryptosi.org`
- Access to the Supabase dashboard or SQL editor
- Environment variables configured

## Step 1: Apply Database Migration

Run the SQL migration file to create the mailing list table:

1. Open your Supabase dashboard at `https://api.supabase.cryptosi.org`
2. Navigate to the SQL Editor
3. Copy and paste the contents of `migrations/001_create_affillia_mailing_list.sql`
4. Execute the SQL

## Step 2: Fix RLS Policies (IMPORTANT!)

If you get "row-level security policy" errors during registration:

1. In the same Supabase SQL Editor
2. Copy and paste the contents of `migrations/003_fix_anon_permissions.sql`
3. Execute the SQL

This properly configures anonymous user permissions following Supabase best practices.

### Alternative: Run Previous Fix
If you already ran `002_fix_rls_policies.sql` but still have issues, run the new migration above instead.

Alternatively, if using the Supabase CLI:
```bash
supabase db reset
supabase migration new create_affillia_mailing_list
# Copy the SQL content to the new migration file
supabase db push
```

## Step 2: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://api.supabase.cryptosi.org
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anonymous_key_here
```

**Note**: Replace `your_anonymous_key_here` with your actual Supabase anonymous key from your project settings.

## Step 3: Verify Setup

After applying the migration, verify that:

1. The `affillia_mailing_list` table was created successfully
2. Row Level Security policies are active
3. The anonymous role can insert data
4. Indexes are created for performance

## Table Structure

The `affillia_mailing_list` table includes:

- `id`: Auto-incrementing primary key
- `name`: Player's full name (required)
- `email`: Player's email address (required, unique)
- `phone`: Player's phone number (optional)
- `created_at`: Timestamp when record was created
- `updated_at`: Timestamp when record was last updated

## Security Features

- **Row Level Security (RLS)**: Enabled on the table
- **Anonymous Insert Policy**: Allows website visitors to register
- **Authenticated Read Policy**: Allows admin users to view registrations
- **Email Uniqueness**: Prevents duplicate registrations

## Testing the Integration

Once setup is complete, test the registration form:

1. Visit your website at `http://localhost:3000`
2. Navigate to the Player Performance section
3. Click "Register Interest" 
4. Fill out the form with test data
5. Check your Supabase dashboard to confirm the data was inserted

## Troubleshooting

### Common Issues:

1. **Form submission fails**: Check that environment variables are set correctly
2. **Database connection errors**: Verify Supabase instance is running and accessible
3. **RLS policy blocks**: Ensure anonymous policy allows inserts

### Debug Steps:

1. Check browser console for JavaScript errors
2. Verify network requests in browser dev tools
3. Check Supabase logs for database errors
4. Test database connection manually with Supabase client 