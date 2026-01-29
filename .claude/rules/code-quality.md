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

---

## 16. Prevent Race Conditions in Polling Hooks

Hooks that perform frequent updates or polling must implement proper guards to prevent race conditions:

```typescript
// Use refs to track in-flight requests and prevent overlapping fetches
const fetchInProgressRef = useRef(false);
const latestMessageIdRef = useRef<string | null>(null);
const currentSearchRef = useRef<string | null>(null);

const fetchData = async () => {
  // Skip if a fetch is already in progress
  if (fetchInProgressRef.current) return;

  fetchInProgressRef.current = true;
  try {
    const data = await fetch('/api/data');
    // Only update state if the request is still relevant
    if (currentSearchRef.current === searchTerm) {
      setData(data);
    }
  } finally {
    fetchInProgressRef.current = false;
  }
};
```

**Common race condition scenarios:**
- User types in search while previous search is still loading
- Polling interval fires while previous poll is still pending
- Component unmounts before async operation completes

---

## 17. TypeScript Naming Convention Consistency

Be aware of naming convention differences between API responses (snake_case from databases) and component props (camelCase in React):

```typescript
// API response from Supabase (snake_case)
interface DbUser {
  full_name: string;
  created_at: string;
  is_admin: boolean;
}

// Component props (camelCase)
interface UserCardProps {
  fullName: string;
  createdAt: string;
  isAdmin: boolean;
}

// Transform at the boundary
function transformUser(dbUser: DbUser): UserCardProps {
  return {
    fullName: dbUser.full_name,
    createdAt: dbUser.created_at,
    isAdmin: dbUser.is_admin,
  };
}
```

**Key principle:** Transform snake_case to camelCase at the API/component boundary, not scattered throughout the codebase.

---

## 18. Avoid Implicit 'any' Types

Always explicitly type function parameters and return values to avoid TypeScript errors:

```typescript
// Bad - implicit 'any' type
const handleClick = (event) => { ... }
const processItems = (items) => items.map(item => item.name)

// Good - explicit types
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { ... }
const processItems = (items: Item[]) => items.map(item => item.name)
```

---

## 19. SSR-Safe Browser API Access

When using browser-specific APIs like `window` in Next.js, ensure they're only accessed on the client side:

```typescript
// Bad - may fail during SSR
const width = window.innerWidth;

// Good - check for browser environment
const [width, setWidth] = useState(0);

useEffect(() => {
  setWidth(window.innerWidth);
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**Common browser-only APIs:** `window`, `document`, `localStorage`, `sessionStorage`, `navigator`

---

## 20. Validate JSON Request Bodies

All API routes accepting JSON bodies must validate the request before parsing:

```typescript
export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate required fields
  if (!body.email || typeof body.email !== 'string') {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Process valid request...
}
```

**Why:** Invalid JSON or missing fields should return 400 (client error), not 500 (server error).

---

## 21. Use Local Sign-Out Scope

When signing out users with Supabase Auth, use `scope: 'local'` instead of `scope: 'global'`:

```typescript
// Good - fast, reliable sign-out
await supabase.auth.signOut({ scope: 'local' });

// Bad - can cause UI freeze on network issues
await supabase.auth.signOut({ scope: 'global' });
```

**Why:** `scope: 'global'` makes a network call to invalidate all sessions across devices. If there are network issues, this can cause the sign-out to hang or fail, making the UI appear frozen. `scope: 'local'` only clears the local session, which is fast and reliable for most use cases.

---

## 22. Use Non-Null Assertions When Type is Guaranteed

When TypeScript can't infer that a value is non-null despite earlier checks (e.g., after filtering or conditional logic), use the non-null assertion operator (`!`):

```typescript
// Example: product is guaranteed to exist due to earlier check
const products = allProducts.filter(p => p.id === selectedId);
if (products.length === 0) {
  return <NotFound />;
}

// TypeScript may not know products[0] is defined, but we've guaranteed it
const currentProduct = products[0]!;
// Now use currentProduct without null checks
```

**When to use:**
- After early returns that eliminate null cases
- After filtering/finding operations where existence is guaranteed by prior logic
- When TypeScript's flow analysis can't follow the conditional guarantees

**When NOT to use:**
- When the value might actually be null/undefined
- As a shortcut to avoid proper null handling
- On external data that hasn't been validated

---

## 23. Admin User Creation with Supabase Auth Admin

For backend-managed user creation (e.g., creating accounts during checkout), use Supabase's admin API:

```typescript
import { createAdminClientInstance } from "@/lib/supabase/server";

const supabase = createAdminClientInstance();

// Create user with admin privileges (bypasses email confirmation)
const { data: authData, error } = await supabase.auth.admin.createUser({
  email: email.toLowerCase(),
  email_confirm: true,  // Auto-confirm email
  user_metadata: { full_name: fullName },
});
```

**Key points:**
- Requires `SUPABASE_SERVICE_ROLE_KEY` (admin client)
- `email_confirm: true` skips email verification for checkout flows
- Always normalize email to lowercase before creating

---

## 24. Debounce Search Input for API Calls

When implementing search functionality that triggers API calls, use debouncing to avoid excessive requests:

```typescript
const [search, setSearch] = useState("");
const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleSearchChange = (value: string) => {
  setSearch(value);

  // Clear pending search
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  // Debounce: only trigger API after 300ms of no typing
  searchTimeoutRef.current = setTimeout(() => {
    fetchResults(value);
  }, 300);
};

// Clean up on unmount
useEffect(() => {
  return () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };
}, []);
```

**Why:** Prevents triggering an API request on every keystroke, reducing server load and improving perceived performance.

---

## 25. Use AbortController to Cancel Fetch Requests

When implementing search or data fetching that can be interrupted (by new input or component unmount), use `AbortController` to cancel pending requests:

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const fetchData = async (query: string) => {
  // Cancel any pending request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  // Create new controller for this request
  abortControllerRef.current = new AbortController();

  try {
    const response = await fetch(`/api/search?q=${query}`, {
      signal: abortControllerRef.current.signal,
    });
    const data = await response.json();
    setResults(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Request was cancelled, ignore
      return;
    }
    console.error('Fetch error:', error);
  }
};

// Clean up on unmount
useEffect(() => {
  return () => {
    abortControllerRef.current?.abort();
  };
}, []);
```

**Why:** Without cancellation, stale responses from slow requests can overwrite newer data, causing incorrect UI states.

---

## 26. Use Relative Positioning for Dropdowns

When positioning dropdowns or popovers relative to an input element, calculate positions relative to the parent container, not the viewport:

```typescript
// Bad - viewport-based positioning breaks with scrolling/containers
const rect = element.getBoundingClientRect();
dropdown.style.top = `${rect.bottom}px`;  // Viewport coordinates

// Good - relative to parent container
const parentRect = container.getBoundingClientRect();
const elementRect = element.getBoundingClientRect();
dropdown.style.top = `${elementRect.bottom - parentRect.top}px`;  // Relative coordinates
```

**Why:** Viewport-based positioning breaks when the page scrolls or when the dropdown is inside a positioned container. Relative positioning ensures the dropdown stays attached to its trigger element.

---

## 27. Prevent Creating Empty Records

Don't create database records (conversations, posts, etc.) until there's meaningful content:

```typescript
// Bad - creates empty conversation on "New Chat" click
const handleNewChat = async (userId: string) => {
  const { data } = await supabase.from('conversations').insert({ ... });
  navigate(`/chat/${data.id}`);
};

// Good - defer creation until first message
const handleNewChat = (userId: string) => {
  // Store draft recipient, create conversation on first message
  setDraftRecipient(userId);
  setShowComposer(true);
};

const handleSendFirstMessage = async (content: string) => {
  const { data: conversation } = await supabase
    .from('conversations')
    .insert({ ... })
    .select()
    .single();

  await supabase.from('messages').insert({
    conversation_id: conversation.id,
    content,
  });
};
```

**Why:** Empty records clutter the database and confuse users who see "conversations" with no messages.

---

## 28. Provide Clear UI Feedback for Search States

Search interfaces must handle all states with appropriate feedback:

```tsx
// All search states with clear feedback
{loading && <div className="p-3 text-gray-400">Searching...</div>}

{!loading && query.length < minLength && (
  <div className="p-3 text-gray-400">
    Type at least {minLength} characters to search
  </div>
)}

{!loading && query.length >= minLength && results.length === 0 && (
  <div className="p-3 text-gray-400">No results found</div>
)}

{!loading && results.length > 0 && (
  <ul>
    {results.map(item => <SearchResult key={item.id} item={item} />)}
  </ul>
)}
```

**Why:** Users need immediate feedback about why results aren't showing. Silent empty states cause confusion.

---

## 29. Use Correct API Path Conventions

This project uses specific API path conventions. Be aware of the correct paths:

| Pattern | Correct Path |
|---------|--------------|
| Admin endpoints | `/api/admin/*` (server-side admin) |
| Portal admin endpoints | `/api/portal/admin/*` (portal-specific admin) |
| Portal endpoints | `/api/portal/*` |
| Auth endpoints | `/api/auth/*` |

**Common mistake:** Using `/api/admin/members` when the correct path is `/api/portal/admin/members` for portal-related admin features.

**Tip:** Check existing API routes in `src/app/api/` before creating new endpoints to follow established patterns.
