# Database Schema Files

This directory contains all SQL files for the Nanowork Agent Platform database.

## Files

### `schema.sql`
Complete PostgreSQL schema for the entire application. This includes:

- **15 tables**: agents, businesses, generated_apps, app_files, landing_pages, deployments, agent_conversations, agent_emails, agent_memories, agent_tasks, contacts, contact_interactions, payment_links, transactions, documents
- **Row Level Security (RLS)** policies on all tables
- **65+ optimized indexes** for fast queries
- **Vector search support** via pgvector extension
- **Automatic timestamp triggers** for updated_at columns
- **Helper functions** for similarity search

**How to use:**
1. Go to your Supabase dashboard → SQL Editor
2. Copy the entire contents of `schema.sql`
3. Paste and click "Run"
4. Takes ~5 seconds to execute

### `verify-schema.sql`
Verification script to confirm all tables, indexes, and functions were created correctly.

**How to use:**
1. After running `schema.sql`, open SQL Editor again
2. Copy the contents of `verify-schema.sql`
3. Paste and click "Run"
4. You should see a list of all 15 tables with their counts

## Prerequisites

Before running these scripts, ensure the following extensions are enabled in your Supabase project:

- `uuid-ossp` (usually enabled by default)
- `pgcrypto` (usually enabled by default)
- **`vector`** - **REQUIRED** - Enable this in Database → Extensions

## Database Architecture

The schema is designed for a multi-tenant agent platform where:

- Each user gets one agent (via `agents.user_id`)
- Agents manage multiple businesses
- Each business can have apps, landing pages, deployments
- Agents track conversations, emails, tasks, contacts
- Vector embeddings enable semantic search (RAG)

## Support

For detailed setup instructions, see:
- `/backend/SUPABASE_SETUP.md` - Step-by-step setup guide
- `/backend/DATABASE_SCHEMA.md` - Visual schema reference
- `/backend/QUICK_START.md` - 5-minute quick start
