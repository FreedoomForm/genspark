# First-time database setup (Neon)

After connecting Neon to Vercel and adding the env vars (`DATABASE_URL`,
`DIRECT_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`), run **once**:

```bash
npx prisma db push
```

This will create all tables (`User`, `Attempt`, `Answer`) on Neon. No seed
data is required — questions are bundled in the codebase (`lib/questions.ts`).

Subsequent schema changes should be applied via `prisma migrate`.

## Admin login

Use the **"Вход для администратора / Administrator uchun kirish"** toggle on
`/login`. Default credentials come from the env vars `ADMIN_EMAIL` /
`ADMIN_PASSWORD`. Make sure to change them in production.

## How the single-attempt rule is enforced

`Attempt.userId` has a `@unique` constraint at the database level, so a user
literally cannot have more than one attempt row. The `/api/test/start`
endpoint refuses to recreate an attempt; it only resumes an unfinished one.
