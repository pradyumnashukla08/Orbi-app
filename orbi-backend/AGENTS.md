# AGENTS.md

Instructions for AI coding agents working in this backend folder.

## Scope

- This folder (`orbi-backend/`) contains the backend only.
- Follow the existing patterns in `src/` before inventing new ones.
- Do not change architecture, folder layout, or dependencies without a clear reason.
- Keep changes small and focused. Do not refactor unrelated code.

## Backend stack

- Node.js 20+
- Express 5
- TypeScript (ESM, `module`/`moduleResolution`: `NodeNext`)
- MongoDB + Mongoose
- Zod for validation
- bcryptjs for password hashing
- jsonwebtoken for access/refresh tokens
- nodemailer (Gmail SMTP) for OTP emails
- express-rate-limit for rate limiting
- tsx for dev, tsc for build
- ESLint (flat config) + Prettier

All relative imports in ESM must include the `.js` extension, for example:

```ts
import { env } from '../../config/env.js';
```

## Folder structure

```
src/
├── app.ts                  # express app wiring only
├── server.ts               # DB connect, listen, graceful shutdown
├── config/                 # env.ts, database.ts
├── middlewares/            # auth, error, notFound, requestId, validate, rateLimit
├── modules/<feature>/
│   ├── <feature>.interface.ts
│   ├── <feature>.validation.ts
│   ├── <feature>.service.ts
│   ├── <feature>.controller.ts
│   └── <feature>.routes.ts
├── routes/                 # mounts feature routes under /api/v1
├── types/                  # express type augmentation
└── utils/                  # ApiError, ApiResponse, asyncHandler, hash, jwt
```

Models and mappers belong to the owning module, for example `modules/user/user.model.ts` and `modules/user/user.mapper.ts`. Do not put models inside auth or unrelated modules.

## Layer rules

- **routes**: wiring only. Apply middleware, validation and controller.
- **controller**: thin. Parse request, call service, return `ApiResponse`. No business logic, no DB queries, no `try/catch`.
- **service**: business logic and DB access. Throw `ApiError` for expected failures.
- **interface**: request/response types and document interfaces.
- **validation**: Zod schemas only.
- **model**: Mongoose schema only. Use `timestamps: true` and `versionKey: false`.
- **mapper**: convert documents to public DTOs. Never return raw documents.

## Controllers

Use `asyncHandler`; never write `try/catch` in controllers.

```ts
export const getSomething = asyncHandler(async (req: Request, res: Response) => {
  const result = await getSomethingService(req.body as SomethingInput);
  return ApiResponse.ok(res, result, 'Fetched successfully.');
});
```

Use `ApiResponse` helpers:

- `ApiResponse.ok(res, data, message?, statusCode?)`
- `ApiResponse.created(res, data, message?)`
- `ApiResponse.noContent(res)`

Response shape must stay consistent:

```json
{ "success": true, "message": "...", "data": {} }
```

## Errors

- Throw `ApiError.badRequest/unauthorized/forbidden/notFound/conflict/unprocessable/internal`.
- Never send error responses manually from controllers or services.
- The central `errorHandler` owns status codes, request IDs, dev stack/location and production hiding.
- Do not leak whether an email exists on login; use a generic message.

## Validation

- Validate request bodies with Zod via `validateBody(schema)`.
- Normalize email with `trim` + `toLowerCase` before `z.email()` (use `.pipe()`).
- Validation failures return `422` with field-wise `details`.

## Auth and tokens

- Protected routes use the `authenticate` middleware.
- User identity must come from the verified token (`req.user`, `req.auth.userId`), never from body, query or params.
- `authenticate` loads the user, rejects deleted users (`401`) and unverified users (`403`).
- Signup returns no tokens. Tokens are issued only by login.
- Access token: short lived, `type: 'access'`, signed with `JWT_ACCESS_SECRET`.
- Refresh token: long lived, `type: 'refresh'`, signed with `JWT_REFRESH_SECRET`.
- Never accept a refresh token as an access token; always check `type`.
- Store only the refresh token hash and its expiry, never the raw token.

## Hashing

- Passwords: bcryptjs with `BCRYPT_SALT_ROUNDS`.
- OTP and refresh tokens: deterministic `hashValue` (HMAC-SHA256) and `verifyHash` (timing-safe).
- Never hash passwords deterministically. Salts are required for passwords.
- OTP verification must check expiry and clear OTP fields on success.

## Database

- Use Mongoose models inside their owning module.
- Sensitive fields use `select: false` (`passwordHash`, `otpHash`, `refreshTokenHash`, expiry fields).
- Select them explicitly only when needed: `.select('+passwordHash')`.
- Use `findById`/`exists`/`findOne` with ownership checks. Never trust client-provided user IDs.
- Use `toPublicUser`-style mappers; never expose hashes or internal fields.

## Environment

- All environment access goes through `src/config/env.ts` with Zod validation.
- Do not read `process.env` outside `config/env.ts`.
- Every new variable must be added to `.env` and `.env.example`.
- Never commit real secrets. `.env` stays ignored.

## Email

- OTP emails go through `src/utils/mailer.ts` using `nodemailer` and SMTP.
- Gmail requires a Google App Password, not the account password.
- `SMTP_USER` and `SMTP_PASS` must be set together; when both are empty in development, the OTP is logged to the console instead.
- Never log OTPs in production.

## Rate limiting

- Global limiter applies to `/api`.
- Auth endpoints (`signup`, `verify-otp`, `login`) use the stricter `authRateLimiter`.
- New public auth endpoints must use `authRateLimiter`.

## Code style

- Do not add comments unless explicitly requested.
- Prefer simple, linear code over clever abstractions.
- Keep functions small and names explicit.
- Use `type` imports for types.
- Avoid non-null assertions (`!`). Guard explicitly.
- No `any`. Use precise types or `unknown` with narrowing.
- Keep imports ordered: node built-ins, external packages, internal modules.

## API conventions

- Base path: `/api/v1`.
- Auth endpoints: `POST /api/v1/auth/signup`, `POST /api/v1/auth/verify-otp`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`, `GET /api/v1/auth/me`.
- Health: `GET /api/v1/health`.
- Android clients receive tokens as JSON and send `Authorization: Bearer <accessToken>`.
- New endpoints must keep the `{ success, message, data }` envelope.

## Commands

Run before declaring work complete:

```bash
npm run typecheck
npm run lint
npm run build
```

Useful:

```bash
npm run dev
npm run start
npm run format
```

## Git

- Branch naming: `backend/<feature>` or `ui/<feature>`.
- Commit style: conventional commits, for example `feat(backend): add refresh token rotation`.
- Never commit `.env`, `node_modules/` or `dist/`.
- Stage only intended files. Do not commit unless explicitly asked.

## Verification

- Test changed behavior with real requests when possible.
- Report what was verified (typecheck, lint, build, live endpoint checks).
- Do not claim something works without evidence.
