# 🚀 Depresso Assist Setup Guide

## Quick Fix for "Server Connection Error"

If you're getting "server connection error check your supabase", follow these steps:

## 🔧 Step 1: Deploy the Edge Function

The server code exists but needs to be deployed to Supabase. Here's how:

### **Option A: Deploy via Supabase CLI (Recommended)**

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Initialize Supabase locally** (from your project root):
   ```bash
   supabase init
   ```

4. **Link to your project**:
   ```bash
   supabase link --project-ref lrfnjxurfljfbboguriq
   ```

5. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy server
   ```

### **Option B: Deploy via Supabase Dashboard**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/lrfnjxurfljfbboguriq
2. **Navigate to Edge Functions**
3. **Create New Function** called `server`
4. **Copy the entire content** from `/supabase/functions/server/index.tsx`
5. **Deploy the function**

## 🗄️ Step 2: Run Database Migration

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy the entire content** from `/supabase/database-schema.sql`
3. **Paste and Run** the SQL
4. **Verify** that 5 tables were created:
   - ✅ profiles
   - ✅ posts  
   - ✅ comments
   - ✅ conversations
   - ✅ messages

## 🔍 Step 3: Test the Setup

1. **Test Server Health**:
   Visit: https://lrfnjxurfljfbboguriq.supabase.co/functions/v1/make-server-8532b137/health
   
   **Expected Response**:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-...",
     "server": "running",
     "database": "connected"
   }
   ```

2. **Test Database Check**:
   Visit: https://lrfnjxurfljfbboguriq.supabase.co/functions/v1/make-server-8532b137/check-database
   
   **Expected Response**:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-...",
     "database": {
       "profiles": true,
       "posts": true,
       "migrationComplete": true
     }
   }
   ```

## 🎯 Step 4: Try Signup Again

After completing the above steps:

1. **Refresh your app**
2. **Try creating an account**
3. **Should work without errors!**

## 🛠️ Troubleshooting Common Issues

### **Edge Function Not Found (404)**
- **Cause**: Function not deployed
- **Solution**: Follow Step 1 to deploy the Edge Function

### **Database Connection Error**
- **Cause**: Migration not run
- **Solution**: Follow Step 2 to run the database migration

### **CORS Errors**
- **Cause**: Function deployment issues
- **Solution**: Redeploy the Edge Function with CORS enabled

### **Environment Variables Missing**
- **Cause**: Supabase secrets not configured
- **Solution**: The required secrets should already be available in your Supabase project

## 🔧 Alternative: Manual Function Creation

If the CLI doesn't work, you can manually create the Edge Function:

1. **Create New Edge Function** in Supabase Dashboard
2. **Name it**: `server`
3. **Copy-paste** the code from `/supabase/functions/server/index.tsx`
4. **Deploy**

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Health endpoint returns `"database": "connected"`
- ✅ Signup form loads without errors
- ✅ You can create accounts successfully
- ✅ Chat and community features work

## 🆘 Still Having Issues?

1. **Check Browser Console**: Look for detailed error messages
2. **Test Endpoints Manually**: Use the URLs above to test server connectivity
3. **Verify Project ID**: Make sure `lrfnjxurfljfbboguriq` is your correct project ID
4. **Check Supabase Logs**: Go to Dashboard → Logs to see function execution logs

## 📋 Quick Checklist

- [ ] Edge Function deployed (`server`)
- [ ] Database migration run (5 tables created)
- [ ] Health endpoint returns 200 OK
- [ ] Database status shows "connected"
- [ ] Signup form works without errors

**Once you complete these steps, your Depresso Assist app will be fully functional!** 🎉