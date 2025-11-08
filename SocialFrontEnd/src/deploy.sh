#!/bin/bash

# 🚀 Depresso Assist Deployment Script
# This script deploys the Edge Function and runs the database migration

echo "🚀 Deploying Depresso Assist to Supabase..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
    echo "✅ Supabase CLI installed"
fi

# Check if logged in
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi
echo "✅ Authenticated with Supabase"

# Project ID from info.tsx
PROJECT_ID="lrfnjxurfljfbboguriq"

# Link to project if not already linked
echo "🔗 Linking to Supabase project..."
supabase link --project-ref $PROJECT_ID

# Deploy Edge Function
echo "📡 Deploying Edge Function..."
supabase functions deploy server

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
else
    echo "❌ Edge Function deployment failed!"
    exit 1
fi

# Test the deployment
echo "🧪 Testing deployment..."
HEALTH_URL="https://$PROJECT_ID.supabase.co/functions/v1/make-server-8532b137/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $response -eq 200 ]; then
    echo "✅ Server is responding!"
    echo "🌐 Health check URL: $HEALTH_URL"
else
    echo "❌ Server not responding (HTTP $response)"
    echo "🔍 Check the function logs in your Supabase dashboard"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Go to Supabase Dashboard → SQL Editor"
echo "2. Copy and run the SQL from: /supabase/database-schema.sql"
echo "3. Test your app at: your-app-url"
echo ""
echo "🎉 Deployment complete!"