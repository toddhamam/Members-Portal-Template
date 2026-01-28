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

---

## 12. External Integration Error Handling

**All calls to external services MUST be wrapped in try-catch blocks.** This includes Klaviyo, Meta CAPI, and any other third-party APIs.

```typescript
// Good - external call wrapped in try-catch
try {
  await klaviyo.upsertProfile({ email, firstName });
  await klaviyo.trackEvent({ email, event: "Purchase" });
} catch (error) {
  console.error('[Klaviyo] Failed (non-critical):', error);
  // Continue processing - don't let external failures crash the flow
}

// Bad - unhandled external call
await klaviyo.upsertProfile({ email, firstName }); // Can crash entire webhook!
```

**Why this matters:** Unhandled exceptions in external integrations can crash webhook handlers or API routes, causing critical operations (like tracking purchases) to fail even though the payment succeeded.

---

## 13. Email Normalization for External Services

Always normalize email addresses to lowercase before passing them to external services:

```typescript
// Good - normalized before external call
const emailLower = email.toLowerCase();
await klaviyo.upsertProfile({ email: emailLower, firstName });

// Bad - raw email might have inconsistent casing
await klaviyo.upsertProfile({ email, firstName }); // May cause duplicate profiles
```

**Why:** Different systems may return emails with different casing (e.g., Stripe vs. Supabase). Normalizing prevents duplicate profiles and lookup failures in services like Klaviyo that use email as the primary identifier.

---

## 14. Leverage Service Idempotency

When updating external systems, leverage their built-in idempotency where available:

- **Klaviyo:** Deduplicates profiles by email automatically
- **Supabase:** Use `upsert` for records that might already exist
- **Stripe:** Many operations are idempotent by design

This makes operations safe to retry without creating duplicates:

```typescript
// Safe to call multiple times - Klaviyo deduplicates by email
await klaviyo.upsertProfile({ email: emailLower, firstName, lastName });

// Safe to retry - Supabase upsert handles existing records
await supabase.from('user_purchases').upsert({
  user_id: userId,
  product_id: productId,
}, { onConflict: 'user_id,product_id' });
```

---

## 15. Remove Unused Integrations Completely

When an external integration is no longer in use (e.g., account deleted, service discontinued):

1. Remove all API calls to the service
2. Remove environment variables
3. Remove related imports and configuration
4. Remove any error handling specific to that service

**Why:** Leaving "dead" integration code can cause unexpected errors if the service returns 401/403 or unexpected responses. Clean removal prevents silent failures.
