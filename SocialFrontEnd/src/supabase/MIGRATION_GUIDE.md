# Database Migration Guide

## 🚀 Migrating from KV Store to PostgreSQL

### Step 1: Run Database Schema
1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the entire content from `/supabase/database-schema.sql`
4. Click **Run** to create all tables, indexes, and policies

### Step 2: Verify Tables Created
Check that these tables were created:
- ✅ `profiles` - User profiles
- ✅ `posts` - Community posts  
- ✅ `comments` - Post comments
- ✅ `conversations` - Chat conversations
- ✅ `messages` - Chat messages

### Step 3: Test the Migration
1. The server code has been updated to use PostgreSQL
2. All existing API endpoints remain the same
3. Your frontend will continue to work without changes

### Key Improvements:
- **Proper Relationships**: Foreign keys between tables
- **Data Integrity**: Constraints and validation
- **Better Performance**: Indexes on frequently queried columns
- **Advanced Queries**: JOIN operations and complex filtering
- **Row Level Security**: Built-in security policies
- **Real-time Features**: Supabase real-time subscriptions ready

### Database Schema Overview:

```sql
profiles (user data)
├── id (UUID, references auth.users)
├── username (TEXT)
├── user_type (helper/needer)
├── gender (male/female/other)
└── mode (ai/human)

posts (community posts)
├── id (UUID)
├── author_id (FK → profiles.id)
├── content (TEXT)
└── created_at (TIMESTAMP)

comments (post comments)
├── id (UUID)
├── post_id (FK → posts.id)
├── author_id (FK → profiles.id)
└── content (TEXT)

conversations (chat conversations)
├── id (UUID)
├── participant_1 (FK → profiles.id)
├── participant_2 (FK → profiles.id)
└── type (ai/human)

messages (chat messages)
├── id (UUID)
├── conversation_id (FK → conversations.id)
├── sender_id (FK → profiles.id)
└── content (TEXT)
```

### Row Level Security:
- Users can only see their own conversations and messages
- Posts and comments are publicly viewable
- Users can only edit their own content
- Automatic profile creation on user signup

### Next Steps:
After running the migration, your app will automatically use the new PostgreSQL database with improved performance and data integrity!