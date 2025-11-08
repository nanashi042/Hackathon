# Troubleshooting Guide

## 🚨 Signup Errors

If you're getting errors during signup (like "user already exists", "failed to create user", etc.), here are the most common causes and solutions:

### **Quick Diagnosis Tool**
Use the diagnostic tool at `/diagnose-database.html` or click "Run Quick Diagnosis" in the signup form to automatically check your setup.

## Common Error Messages:

### **Cause 1: Email Already Registered**
**Error Message**: "An account with this email already exists"

**Solution**: 
- Try logging in with that email instead of signing up
- Use a different email address for signup
- Check if you created an account before

### **Cause 2: Username Taken**
**Error Message**: "Username already taken"

**Solution**:
- Choose a different username
- Try adding numbers or variations to your preferred username

### **Cause 3: Database Migration Not Run** ⚠️ **Most Common Issue**
**Error Messages**: 
- "Failed to create user profile"
- "Database not initialized"
- "Failed to create account, please try again"
- Any database-related errors

**Solution**:
1. **🔍 Quick Check**: Visit `https://[your-project-id].supabase.co/functions/v1/make-server-8532b137/health`
   - Should show `"database": "connected"` if working
   - Will show `"database": "migration_required"` if tables are missing

2. **Run the Database Migration**:
   - Go to your Supabase Dashboard
   - Navigate to **SQL Editor**
   - Copy the entire content from `/supabase/database-schema.sql`
   - Click **Run** to execute the migration

3. **Verify Tables Created**:
   Check that these tables exist in your database:
   - ✅ `profiles`
   - ✅ `posts`
   - ✅ `comments`
   - ✅ `conversations`
   - ✅ `messages`

### **Cause 4: Server Issues**
**Error Message**: Generic server errors

**Solution**:
1. **Check Server Status**:
   - Visit: `https://[your-project-id].supabase.co/functions/v1/make-server-8532b137/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for detailed error messages in the Console tab

### **Quick Reset Process**

If you want to start fresh:

1. **Clear User Data** (in Supabase Dashboard):
   - Go to **Authentication** → **Users**
   - Delete any test users you created

2. **Clear Database** (if needed):
   ```sql
   -- Run in Supabase SQL Editor if you want to reset all data
   TRUNCATE profiles, posts, comments, conversations, messages CASCADE;
   ```

3. **Try Signup Again**:
   - Use a fresh email address
   - Choose a unique username

### **Database Migration Status Check**

Run this query in Supabase SQL Editor to verify your migration:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'posts', 'comments', 'conversations', 'messages');
```

Should return 5 rows if migration was successful.

### **Still Having Issues?**

1. **Check Migration Guide**: Review `/supabase/MIGRATION_GUIDE.md`
2. **Verify Environment**: Ensure your Supabase URL and keys are correct
3. **Check Logs**: Look at browser console and Supabase Edge Function logs

### **Common Solutions Summary**:
- ✅ **Email exists** → Try logging in or use different email
- ✅ **Username taken** → Choose different username  
- ✅ **Database error** → Run the migration in `/supabase/database-schema.sql`
- ✅ **Server error** → Check server health endpoint

The app is now using a proper PostgreSQL database instead of the old KV store, so make sure you've run the database migration!