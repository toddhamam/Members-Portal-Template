# Code Quality Rules

These rules should be followed for all code changes in this project.

---

## 1. Apply Database Migrations

When creating Supabase migration files, ensure they are also **applied** to the database:

- Creating a `.sql` migration file is not enough
- Use `supabase db push` or apply via the Supabase dashboard
- Verify tables exist before writing code that depends on them

**Symptom:** "Table does not exist" errors when the SQL file exists in your codebase.

---

## 2. Avoid Premature Abstractions

Wait until patterns emerge before extracting to abstractions:

- **3 or fewer uses:** Keep the code inline
- **4+ uses OR complex logic:** Consider extracting to a utility function
- **Ask first:** "Would a new developer understand this code faster with or without the abstraction?"

Bad patterns:
- Creating a utility for 1-2 usages
- Building configuration systems before there's anything to configure
- Adding interfaces/types before the shape stabilizes

---

## 3. Simplify First, Refactor Later

When implementing new features:

1. Build the simplest working solution
2. Get user confirmation that it works correctly
3. Only then consider refactoring for elegance

Never sacrifice working functionality for "clean" code during initial implementation.

---

## 4. API Error Response Consistency

All API routes should return consistent error structures:

```typescript
// Good - consistent structure
return NextResponse.json({ error: "User not found" }, { status: 404 });
return NextResponse.json({ error: "Invalid input", details: validationErrors }, { status: 400 });

// Bad - inconsistent structures
return NextResponse.json({ message: "Error" }, { status: 500 });
return NextResponse.json({ errors: ["thing"] }, { status: 400 });
```

---

## 5. Admin Client for Privileged Operations

Use `createAdminClientInstance()` instead of `createClient()` when:

- Inserting records where RLS might block the operation
- Server-side operations that need to see all data
- Bypassing visibility restrictions for admin features

Regular `createClient()` respects RLS policies and should be used for user-facing operations.

---

## 6. Type All API Responses

Define TypeScript interfaces for API response shapes:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface PostsResponse {
  posts: Post[];
  total: number;
  hasMore: boolean;
}
```

This enables type checking on the client side and documents the API contract.

---

## 7. Admin Route Protection

**Client-side (layouts):**
For routes requiring admin access, implement a layout component that checks `profile.is_admin` and redirects non-admins:

```tsx
// src/app/portal/admin/layout.tsx
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      router.push("/portal");
    }
  }, [user, profile, loading, router]);

  if (loading || !profile?.is_admin) {
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
```

**Server-side (API routes):**
For admin API endpoints, explicitly check `profile.is_admin` and return 403 Forbidden:

```typescript
// Check admin status
const { data: profile } = await supabase
  .from("profiles")
  .select("is_admin")
  .eq("id", user.id)
  .single();

if (!profile?.is_admin) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## 8. Avoid RLS Recursion

**Never** create RLS policies that reference the same table they're applied to (e.g., checking `profiles.is_admin` within a `profiles` RLS policy). This causes infinite recursion.

**Solution:** For admin access patterns, use the service role key (`createAdminClientInstance()`) which bypasses RLS entirely. This is simpler and avoids recursion issues.

---

## 9. Avoid Reserved Keywords as Variable Names

Do not use JavaScript/TypeScript reserved words as variable names, especially in API route handlers:

```typescript
// Bad - "module" is a reserved keyword
const module = await supabase.from("modules").select("*").single();

// Good - use descriptive names
const productModule = await supabase.from("modules").select("*").single();
const moduleData = await supabase.from("modules").select("*").single();
```

---

## 10. Avoid Creating Components During Render

Components should be declared at the top level of a file or as separate files, never inside render functions:

```tsx
// Bad - component recreated on every render
function ParentComponent() {
  const ChildComponent = () => <div>Child</div>;  // Don't do this!
  return <ChildComponent />;
}

// Good - component defined at module level
const ChildComponent = () => <div>Child</div>;

function ParentComponent() {
  return <ChildComponent />;
}
```

---

## 11. Handle Special Characters in Filenames

Be aware that special characters (like Unicode narrow no-break spaces) in filenames can cause issues when reading or processing files. When encountering file path errors, check for hidden special characters in the filename.
