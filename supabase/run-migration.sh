#!/bin/bash

# Run this script with your Supabase connection details
# Usage: ./run-migration.sh "postgresql://user:pass@host:port/database"

if [ -z "$1" ]; then
  echo "❌ Error: Missing database connection string"
  echo ""
  echo "Usage:"
  echo "  ./run-migration.sh \"postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres\""
  echo ""
  echo "Or set SUPABASE_DB_URL environment variable:"
  echo "  export SUPABASE_DB_URL=\"postgresql://...\""
  echo "  ./run-migration.sh"
  exit 1
fi

CONNECTION_STRING="${1:-$SUPABASE_DB_URL}"

echo "🚀 Applying migration: 20260509000001_rent_marketplace.sql"
echo ""

if command -v psql &> /dev/null; then
  psql "$CONNECTION_STRING" -f /Users/jordan/Dev/nanowork-mvp/supabase/migrations/20260509000001_rent_marketplace.sql
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Navigate to http://localhost:5173/rent"
    echo "  2. You should see 4 sample items"
    echo "  3. Test the 'Notify Me' button"
  else
    echo ""
    echo "❌ Migration failed. Check the error above."
  fi
else
  echo "❌ psql not found. Please install PostgreSQL client:"
  echo "  brew install postgresql"
  echo ""
  echo "Or apply the migration manually via Supabase Dashboard:"
  echo "  1. Go to https://supabase.com/dashboard/project/[your-project]/sql/new"
  echo "  2. Copy the contents of supabase/migrations/20260509000001_rent_marketplace.sql"
  echo "  3. Paste and run"
fi
