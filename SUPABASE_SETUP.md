# Supabase Setup Guide

## The Issue
Your signup form shows "Check your email for a confirmation link!" but you're not receiving emails because the Supabase configuration is using placeholder values.

## Solution

### Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in to your account
2. Create a new project or select an existing one
3. Go to **Settings** → **API** in your Supabase dashboard
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 2: Create Environment File

Create a file called `.env.local` in your `trackmail-frontend` directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Configure Email Settings in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Email Templates**, make sure **Enable email confirmations** is turned ON
3. Configure your email settings:
   - **SMTP Host**: Use Supabase's default or configure your own SMTP
   - **From Email**: Set a valid sender email
   - **Reply To**: Set a valid reply-to email

### Step 4: Test the Configuration

1. Restart your development server:
   ```bash
   cd trackmail-frontend
   npm run dev
   ```

2. Try signing up with a real email address
3. Check your email (including spam folder) for the confirmation link

### Step 5: Alternative - Disable Email Confirmation (Development Only)

If you want to skip email confirmation for development:

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Turn OFF **Enable email confirmations**
3. Users will be automatically confirmed upon signup

## Troubleshooting

- **Still not receiving emails?** Check your spam folder
- **Getting errors?** Verify your Supabase URL and anon key are correct
- **Want to use custom SMTP?** Configure it in Supabase dashboard under Authentication → Settings

## Next Steps

Once you have the environment variables set up correctly, the signup flow should work and you'll receive confirmation emails.
