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
