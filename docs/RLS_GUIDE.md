# Understanding Row Level Security (RLS) in Cliento

Row Level Security (RLS) is a powerful feature in PostgreSQL (the database behind Supabase) that allows you to control access to data at the **row level**. Unlike traditional permissions that might give a user access to an entire table, RLS lets you define rules like "this user can only see rows they created" or "only admins can delete this row."

## How it Works

When RLS is enabled on a table, every query (SELECT, INSERT, UPDATE, DELETE) must pass a "Policy" check before it can execute. If no policy allows the action, the database returns an empty set or an error.

### 1. Enabling RLS
First, we must explicitly tell the database to start checking policies for a table:
```sql
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
```

### 2. Defining Policies
A policy consists of:
- **Action**: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, or `ALL`.
- **Target**: Which users the policy applies to (e.g., `authenticated`).
- **Condition (`USING`)**: A logical expression that must return `true` for a row to be accessible.

#### Example: Admin Access
```sql
CREATE POLICY "Admins have full access" 
ON public.clients 
FOR ALL 
TO authenticated 
USING (get_user_role() = 'admin');
```
*Wait, what is `get_user_role()`?*

### 3. Custom Functions
In Cliento, we created a custom helper function called `get_user_role()`. This function:
1. Looks at the ID of the person currently logged in (`auth.uid()`).
2. Looks up their specific role in our `profiles` table.
3. Returns 'admin', 'beautician', or 'editor'.

This allows us to write policies based on **business roles** rather than just "logged in" or "guest".

## The Cliento Role Matrix

| User Role | Permissions Summary |
| :--- | :--- |
| **Admin** | Full access to everything. Can manage users, clinical data, and site content. |
| **Beautician** | Focuses on operations. Can manage **Clients** and **Appointments**. Read-only access to Treatments/Products. |
| **Editor** | Focuses on content. Can manage **Treatments**, **Products**, **Brands**, and **Suppliers**. No access to sensitive client data. |

## Why is this secure?
Even if someone discovers your Supabase URL and Key, they are still bound byThese rules. Supabase identifies the user via their JWT (token) and injects their ID into the database session. The database then enforces the RLS policies before returning any data.

> [!IMPORTANT]
> Always test your policies! If you forget to add a `SELECT` policy for a role, that user will see `[]` (empty results) when trying to fetch data, even if they are logged in.

## Where to find the code?
The current implementation is located in [20251230_initial_schema.sql](file:///Users/kellyc/projects/School/Cliento/supabase/migrations/20251230_initial_schema.sql).
