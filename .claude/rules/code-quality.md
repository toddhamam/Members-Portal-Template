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

**Important - Auth State Race Condition:**
The `loading` state from `useAuth` may become `false` before the `profile` data finishes loading asynchronously. Always check that `profile` exists AND has the expected properties before rendering protected content:

```tsx
// Good - checks both loading AND profile existence
if (loading || !profile?.is_admin) {
  return <LoadingSkeleton />;
}

// Bad - only checking loading can cause premature redirects
if (!loading && !profile?.is_admin) {
  router.push("/portal"); // May redirect before profile loads!
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

---

## 30. Use JSONB for Flexible Configuration Storage

When storing configuration data that may have varying structure per record type, use PostgreSQL's `JSONB` type:

```sql
-- Migration example
CREATE TABLE dm_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',  -- Flexible per-trigger configuration
  message_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
// TypeScript interface for type safety
interface TriggerConfig {
  delayMinutes?: number;
  memberTypes?: string[];  // e.g., ['free', 'paid']
  productSlugs?: string[];
}

// Query with JSONB operators
const { data } = await supabase
  .from('dm_automations')
  .select('*')
  .contains('trigger_config', { memberTypes: ['free'] });
```

**Why:** JSONB provides flexibility for configurations that vary by type (e.g., different triggers need different parameters) while maintaining the ability to query and index specific fields.

---

## 31. Toggle Switch UI State Patterns

Toggle switches must accurately represent their underlying boolean state with clear visual feedback:

```tsx
// Toggle component with correct state representation
interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

function Toggle({ enabled, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        enabled ? "bg-green-500" : "bg-gray-600",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          enabled ? "translate-x-6" : "translate-x-1"  // Right = on, Left = off
        )}
      />
    </button>
  );
}
```

**Visual conventions:**
- **Off state:** Knob on left, muted/gray background
- **On state:** Knob on right, active/green background
- **Disabled:** Reduced opacity, `cursor-not-allowed`
- Always use `role="switch"` and `aria-checked` for accessibility

---

## 32. Non-Blocking Async for Background Tasks

When triggering background operations (automations, analytics, notifications) that shouldn't block the main response, use `.catch()` to handle errors without awaiting:

```typescript
// Good - non-blocking, doesn't delay user response
triggerFirstCommunityPost(user.id).catch(err => {
  console.error('[Automation] Failed to trigger:', err);
});

// Return response immediately
return NextResponse.json({ success: true });

// Bad - blocks response on non-critical operation
await triggerFirstCommunityPost(user.id);  // User waits for this
return NextResponse.json({ success: true });
```

**When to use:**
- Analytics tracking
- Email/notification triggers
- Automation workflows
- Any operation that can fail without affecting the primary response

**Key principle:** User-facing actions should complete quickly. Background tasks can fail silently (with logging) without blocking.

---

## 33. Always Call Newly Created Functions

When creating new functions or trigger handlers, ensure they are actually invoked from the relevant code paths:

```typescript
// Bad - function exists but never called
export async function triggerWelcomeAutomation(userId: string) {
  // Implementation exists but nothing calls it
}

// Good - function is invoked from the appropriate event handler
// In signup handler or webhook:
await triggerWelcomeAutomation(user.id);
```

**Checklist when adding new functions:**
1. Create the function implementation
2. Add the import to the calling file
3. Actually invoke the function in the correct event/handler
4. Test the complete flow end-to-end

**Why:** A common oversight is implementing logic without wiring it up. The function exists but never executes.

---

## 34. Debounce Frequent Database Writes

For operations that could fire many times in quick succession (progress tracking, activity logging), use refs to limit write frequency:

```typescript
const lastUpdateRef = useRef<number>(0);
const MIN_UPDATE_INTERVAL = 5000; // 5 seconds

const handleProgress = async (currentTime: number) => {
  const now = Date.now();

  // Skip if updated too recently
  if (now - lastUpdateRef.current < MIN_UPDATE_INTERVAL) {
    return;
  }

  lastUpdateRef.current = now;

  await supabase
    .from('lesson_progress')
    .upsert({ lesson_id, user_id, progress_seconds: currentTime });
};
```

**Common scenarios:**
- Video/audio progress tracking
- Scroll position saving
- User activity timestamps
- Auto-save drafts

**Why:** Without debouncing, rapid events (video progress updates every second) would flood the database with writes.

---

## 35. RLS Policies Affect Joined Data

Row Level Security policies on related tables affect what data is visible when joining:

```typescript
// Problem: Author data is null because RLS on profiles only allows
// users to see their own profile
const { data: posts } = await supabase
  .from('discussion_posts')
  .select('*, author:profiles(full_name, avatar_url)')
  .order('created_at', { ascending: false });
// Result: posts[0].author is null for other users' posts!

// Solution: Add RLS policy to allow viewing basic profile info
// In Supabase SQL editor:
CREATE POLICY "Allow viewing basic profile info"
ON profiles FOR SELECT
USING (
  -- Allow users to see: their own profile OR basic info of others
  auth.uid() = id
  OR true  -- Or specific columns via column-level security
);
```

**Key insight:** When fetching data with joins, check RLS policies on ALL joined tables, not just the primary table.

---

## 36. Graceful Fallbacks for User Display

UI components displaying user information should handle missing or incomplete data:

```typescript
// UserAvatar with graceful fallbacks
function UserAvatar({ user }: { user: User | null }) {
  // Handle missing user entirely
  if (!user) {
    return <DefaultAvatar />;
  }

  // Fallback for missing avatar: show initials
  if (!user.avatar_url) {
    const initials = getInitials(user.full_name || user.email || '?');
    return <InitialsAvatar initials={initials} />;
  }

  // Full avatar available
  return <Image src={user.avatar_url} alt={user.full_name || 'User'} />;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
```

**Why:** User data can be incomplete (no avatar uploaded, missing name). Graceful fallbacks prevent broken UI states.

---

## 37. Middleware Must Not Block Auth Callbacks

When configuring middleware for subdomain routing or authentication, ensure it doesn't interfere with critical auth callback routes:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ALWAYS allow auth callbacks through without modification
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // ... rest of middleware logic (subdomain routing, etc.)
}
```

**Why:** Auth callbacks from Supabase (password reset, email confirmation, OAuth) include tokens in the URL. If middleware rewrites or redirects these routes, the token exchange fails and users see cryptic errors.

**Common symptoms:**
- "Invalid or expired link" errors after clicking password reset emails
- OAuth sign-in failures
- Email confirmation links not working

---

## 38. Vercel Deployment Troubleshooting

When deployments don't reflect expected changes, systematically check these areas:

**1. Verify the Deployed Commit:**
```bash
# Check Vercel dashboard -> Deployments -> click deployment -> see commit SHA
# Compare with your local branch
git log --oneline -1
```

**2. Force a Fresh Deployment:**
- Vercel dashboard → Deployments → Click "..." on latest → "Redeploy"
- Or push an empty commit: `git commit --allow-empty -m "Force redeploy" && git push`

**3. Check Git Integration:**
- Vercel dashboard → Project Settings → Git
- Ensure the correct repository and branch are connected
- Check that the production branch matches your deployment target

**4. Clear Edge Cache (for 404s on new routes):**
- New routes may return cached 404s briefly
- Wait 1-2 minutes or trigger a fresh deployment

**5. Environment Variables:**
- `NEXT_PUBLIC_*` variables are baked in at build time
- Changes require a new deployment to take effect
- Non-public variables are read at runtime

**Common issues:**
- **Outdated deployment:** Vercel deployed an older commit (check commit SHA)
- **Wrong branch:** Production is deploying from a different branch than expected
- **Cron limits:** Hobby plans limit cron frequency (max daily on Hobby)
- **Build cache:** Stale cache causing old code to run (try "Redeploy" without cache)

---

## 39. Optimistic UI Updates for Auth State

For better perceived performance, update local UI state immediately before async auth operations complete:

```typescript
const signOut = useCallback(async () => {
  // 1. Update UI state IMMEDIATELY
  setUser(null);
  setProfile(null);

  // 2. Then make the async call
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (error) {
    // Handle error if needed, but UI is already updated
    console.error('Sign out error:', error);
  }

  // 3. Navigate
  router.push('/login');
}, [router]);
```

**Why:** Users see immediate feedback instead of waiting for network round-trips. This is especially important for sign-out, where the user expects instant response.

**When to use:**
- Sign-out operations
- Toggling UI states that don't depend on server confirmation
- Any operation where optimistic UI makes sense

**When NOT to use:**
- Sign-in (user needs confirmation of success)
- Operations where rollback would confuse the user

---

## 40. Verify Email Provider Configuration

When using custom SMTP (SendGrid, Mailgun, etc.) for transactional emails:

**1. Verify Sender Identity:**
- **SendGrid:** Verify sender email OR authenticate entire domain
- **Mailgun:** Add and verify domain
- Unverified senders result in emails going to spam or being blocked

**2. Configure in Supabase:**
- Dashboard → Project Settings → Authentication → SMTP Settings
- Enter SMTP host, port, username (API key), password

**3. Test the Flow:**
```bash
# Trigger a password reset and verify:
# 1. Email is received (check spam folder)
# 2. From address shows your brand, not "Supabase"
# 3. Links work correctly
```

**Common issues:**
- Emails in spam → sender not verified
- "From" shows wrong address → SMTP not configured in Supabase
- Emails not sending → SMTP credentials incorrect

---

## 41. Prefer Shared Components Over Local Duplicates

Always use shared, well-tested components from `src/components/shared/` instead of creating local versions with limited functionality:

```tsx
// Bad - local component with limited functionality
function PortalHeader() {
  // Local UserAvatar that only handles one case
  const UserAvatar = ({ url }: { url: string }) => (
    <img src={url} className="w-8 h-8 rounded-full" />
  );

  return <UserAvatar url={profile.avatar_url} />;
}

// Good - use the shared component with full functionality
import { UserAvatar } from "@/components/shared/UserAvatar";

function PortalHeader() {
  return <UserAvatar user={profile} size="sm" />;
}
```

**Why this matters:**
- Shared components handle edge cases (missing avatar → initials fallback, missing user → default)
- Changes to the shared component propagate everywhere (e.g., avatar updates reflect immediately across the app)
- Reduces code duplication and maintenance burden

**Common symptoms of local duplicates:**
- Avatar changes not reflecting in header but working elsewhere
- Inconsistent fallback behavior across the app
- Same bug fixed in one place but not another

---

## 42. Auth Pages Should Use Dedicated Layouts

Authentication-related pages (login, signup, password reset) should NOT be nested within layouts that assume the user is logged in:

```
# Bad - auth pages inside portal layout
src/app/portal/
├── layout.tsx          # Shows sidebar, assumes auth
├── reset-password/     # User is NOT logged in here!
│   └── page.tsx
└── dashboard/
    └── page.tsx

# Good - auth pages in dedicated location
src/app/
├── login/
│   └── page.tsx        # Standalone, no nav
├── portal/
│   ├── layout.tsx      # Shows sidebar, requires auth
│   └── dashboard/
│       └── page.tsx
└── auth/
    └── callback/       # Handles auth redirects
        └── route.ts
```

**Why this matters:**
- Parent layouts render for all child routes, including auth pages
- Navigation elements (sidebars, mobile nav) will incorrectly appear on auth pages
- Users see confusing UI during login/reset flows

**Exception:** Password reset *confirm* page may need to be in the portal layout if it requires an authenticated session to update the password. In that case, conditionally hide navigation elements based on the route.

---

## 43. Brand Logo Links on Auth Pages

On authentication pages (login, signup, password reset), the brand logo should link to the login page, not the root domain:

```tsx
// Bad - links to marketing site, takes user out of auth flow
<Link href="/">
  <Image src="/logo.png" alt="Brand" />
</Link>

// Good - keeps user in auth context
<Link href="/login">
  <Image src="/logo.png" alt="Brand" />
</Link>
```

**Why:** Users on auth pages are trying to authenticate. Clicking the logo should keep them in the authentication flow, not redirect them to an external marketing site where they need to find their way back.

---

## 44. Use Custom CSS Tooltips Instead of Native Title Attribute

For better UX and cross-device compatibility, use custom CSS tooltips instead of the native `title` attribute:

```tsx
// Bad - native title attribute
<div title="This is an explanation">
  Some metric
</div>

// Good - custom CSS tooltip with consistent styling
<div className="group relative">
  <span>Some metric</span>
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
    opacity-0 group-hover:opacity-100 transition-opacity
    bg-gray-900 text-white text-sm px-3 py-2 rounded-lg
    pointer-events-none whitespace-nowrap z-50">
    This is an explanation
  </div>
</div>
```

**Why:**
- Native `title` tooltips have inconsistent timing/appearance across browsers
- Mobile devices don't support hover for `title` attributes
- Custom tooltips allow brand-consistent styling and immediate visibility

---

## 45. Handle Edge Cases in API Responses

API responses must gracefully handle empty states and provide appropriate defaults:

```typescript
// Good - explicit handling of empty states
return NextResponse.json({
  members: members ?? [],
  total: total ?? 0,
  activeCount: activeMembers?.length ?? 0,
  revenueTotal: revenue ?? 0,
});

// Bad - can return undefined or cause errors
return NextResponse.json({
  members,  // Could be undefined
  total,    // Could be undefined
});
```

**UI handling:**

```tsx
// Good - handle zero/empty states explicitly
{metrics.totalMembers === 0 ? (
  <div className="text-gray-400">No members yet</div>
) : (
  <div>{metrics.totalMembers} members</div>
)}

// Good - handle empty arrays
{members.length === 0 ? (
  <EmptyState message="No members found" />
) : (
  <MembersList members={members} />
)}
```

**Why:** Empty arrays and zero counts are valid states, not errors. UIs should display helpful messages rather than broken states.

---

## 46. Logical Ordering of Dashboard Metrics

When displaying multiple metrics in a dashboard, order them logically by importance and relationship:

```tsx
// Good - ordered by importance/relationship
<div className="grid grid-cols-4 gap-4">
  <MetricCard title="Total Members" value={totalMembers} />
  <MetricCard title="Active Members" value={activeMembers} />
  <MetricCard title="At Risk" value={atRiskMembers} />
  <MetricCard title="Dormant" value={dormantMembers} />
</div>

// Bad - random ordering
<div className="grid grid-cols-4 gap-4">
  <MetricCard title="Dormant" value={dormantMembers} />
  <MetricCard title="Total Members" value={totalMembers} />
  <MetricCard title="At Risk" value={atRiskMembers} />
  <MetricCard title="Active Members" value={activeMembers} />
</div>
```

**Common orderings:**
- **Engagement funnel:** Total → Active → At Risk → Dormant
- **Revenue:** Total revenue → Average order → Conversion rate
- **Time-based:** Today → This week → This month → All time

---

## 47. Plan Mode for Complex Features

Before implementing complex features, use planning to explore the codebase and design the approach:

**When to use planning:**
- Multi-file changes
- New architectural patterns
- Features with unclear scope
- Database schema changes

**Planning process:**
1. Explore existing patterns in the codebase
2. Identify files that need changes
3. Consider edge cases and error handling
4. Get user feedback on the approach
5. Break implementation into discrete tasks

**Why:** Planning prevents wasted effort from implementing an approach that doesn't align with user expectations or existing patterns.

---

## 48. Lazy Initialization for SDK/API Clients

External service SDKs (Stripe, external APIs) should be initialized lazily using a getter function, not at module level:

```typescript
// Bad - module-level instantiation fails during build
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);  // Fails if env var not set at build time

export async function createPayment() {
  return stripe.paymentIntents.create({ ... });
}

// Good - lazy initialization via getter
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeInstance;
}

export async function createPayment() {
  return getStripe().paymentIntents.create({ ... });
}
```

**Why:** During Next.js build, environment variables may not be available. Module-level instantiation runs at import time, causing build failures. Lazy initialization defers SDK creation to runtime when env vars are guaranteed to be present.

**Common symptoms:**
- Build errors about missing environment variables
- "Cannot read property of undefined" during build
- API routes that work locally but fail in production builds

---

## 49. Dynamic Rendering for Auth-Dependent Pages

Pages or layouts that rely on Supabase authentication and user data fetched at runtime should be marked with `force-dynamic` to prevent prerendering:

```typescript
// In pages/layouts that use auth state
export const dynamic = 'force-dynamic';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  // This layout uses AuthProvider which needs runtime Supabase client
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

**When to use:**
- Layouts wrapping authenticated routes (`/portal/*`, `/admin/*`)
- Pages that fetch user-specific data at load time
- Any page that initializes Supabase client during render

**Why:** Next.js attempts to prerender pages during build. If a page tries to create a Supabase client without environment variables (which aren't available at build time), the build fails.

---

## 50. Centralized Brand Configuration

Use a dedicated `brand.ts` file for all brand-specific settings instead of scattering them throughout the codebase:

```typescript
// src/lib/brand.ts
export const brand = {
  name: "Inner Wealth Initiate",
  tagline: "Transform Your Inner World",
  domains: {
    marketing: "innerwealthinitiate.com",
    funnel: "offer.innerwealthinitiate.com",
    portal: "portal.innerwealthinitiate.com",
  },
  contact: {
    email: "support@innerwealthinitiate.com",
    phone: "+1 (555) 123-4567",
  },
  social: {
    instagram: "https://instagram.com/innerwealthinitiate",
    youtube: "https://youtube.com/@innerwealthinitiate",
  },
  legal: {
    companyName: "Inner Wealth LLC",
    address: "123 Main St, City, State 12345",
  },
} as const;
```

**Usage:**
```typescript
import { brand } from "@/lib/brand";

// In components
<title>{brand.name} | Member Portal</title>
<a href={`mailto:${brand.contact.email}`}>Contact Support</a>
```

**Why:**
- Single source of truth for brand identity
- Easy to customize when creating new brand instances from template
- Prevents typos from hardcoded strings
- Clear customization points marked with `[CUSTOMIZE]` comments

---

## 51. Immutable State Updates

When updating React state (especially arrays or objects), always create new instances rather than mutating existing ones:

```typescript
// Bad - mutating existing array
const handleAddItem = (newItem: Item) => {
  items.push(newItem);  // Mutates existing array
  setItems(items);       // React may not detect the change
};

// Good - creating new array
const handleAddItem = (newItem: Item) => {
  setItems([...items, newItem]);  // New array reference
};

// Bad - mutating object property
const handleUpdateUser = (newName: string) => {
  user.name = newName;   // Mutates existing object
  setUser(user);          // React may not detect the change
};

// Good - creating new object with spread
const handleUpdateUser = (newName: string) => {
  setUser({ ...user, name: newName });  // New object reference
};

// Good - updating nested objects
const handleUpdateAddress = (newCity: string) => {
  setUser({
    ...user,
    address: { ...user.address, city: newCity }
  });
};
```

**Why:** React uses reference equality to detect state changes. Mutating an object/array keeps the same reference, so React doesn't know to re-render. Creating new references ensures React detects the change and updates the UI correctly.

**Common symptoms of mutation bugs:**
- UI not updating after state change
- Stale data appearing in lists
- useEffect not triggering when dependencies change
