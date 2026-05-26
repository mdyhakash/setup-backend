# Express TypeScript Backend Boilerplate

A minimal, production-ready backend starter built with **Express 5**, **TypeScript**, and **PostgreSQL**. Includes JWT-based auth with access + refresh token flow, a PostgreSQL connection pool, and a clean module structure — without the bloat.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Express](https://expressjs.com/) | HTTP framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [PostgreSQL + `pg`](https://node-postgres.com/) | Database |
| [JWT + `jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken) | Access & refresh token auth |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | Reading `httpOnly` cookies for refresh tokens |
| [cors](https://github.com/expressjs/cors) | Cross-origin requests |
| [dotenv](https://github.com/motdotla/dotenv) | Environment config |
| [tsup](https://tsup.egoist.dev/) | TypeScript bundler (build) |
| [tsx](https://github.com/privatenumber/tsx) | TypeScript runner (dev) |

---

## Project Structure

```
├── src/
│   ├── config/
│   │   └── index.ts                  # App configuration & env vars
│   ├── db/
│   │   └── index.ts                  # PostgreSQL connection pool + initDB()
│   ├── middleware/
│   │   ├── auth.ts                   # JWT authentication middleware
│   │   └── globalErrorHandler.ts     # Express error handler
│   ├── modules/
│   │   ├── auth.interface.ts         # IAuth type declarations
│   │   ├── auth.route.ts             # Express Router — /signup, /login, /refresh-token
│   │   ├── auth.controller.ts        # Request handlers
│   │   └── auth.service.ts           # Business logic & DB queries
│   ├── app.ts                        # Express app setup
│   └── server.ts                     # Server entry point
├── dist/                             # Compiled output (generated, do not edit)
├── .env                              # Environment variables (do not commit)
├── .gitignore
├── tsconfig.json
├── tsup.config.ts
└── package.json
```

### Module Structure

Each feature lives in its own folder under `src/modules/`. To add a new feature (e.g. `posts`), create four files and register the router in `app.ts`:

```
modules/
└── posts/
    ├── posts.interface.ts
    ├── posts.route.ts
    ├── posts.controller.ts
    └── posts.service.ts
```

---

## Database Schema

`initDB()` in `src/db/index.ts` auto-creates the `users` table on startup:

```sql
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  role       VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

No migration tool is wired up. For more complex schemas, connect manually and run your SQL, or integrate a tool like [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate).

---

## Configuration Files

### `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "esnext",
    "target": "esnext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

Key decisions:

- `"moduleResolution": "bundler"` — required for `"module": "esnext"` with tsup; resolves imports the way a bundler would rather than Node's raw resolver.
- `"verbatimModuleSyntax": true` — enforces `import type` for type-only imports, which tsup needs to correctly tree-shake.
- `"isolatedModules": true` — each file must be independently compilable; required for tsup and compatible transpilers.

### `tsup.config.ts`

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "esnext",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
  banner: {
    js: `
    import {createRequire} from 'module';
    const require = createRequire(import.meta.url);
    `,
  },
});
```

Key decisions:

- `format: ["esm"]` — matches `"type": "module"` in `package.json`; output is native ES modules.
- `banner.js` — injects a `require()` shim into the bundle. Needed because some CommonJS-only dependencies call `require()` at runtime, which doesn't exist in native ESM.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string to a remote instance)

### 1. Clone & Install

```bash
git clone https://github.com/mdyhakash/setup-backend.git
cd setup-backend
npm install
```

### 2. Configure Environment

Create a `.env` file at the project root:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your_super_secret_key
REFRESH_TOKEN=your_refresh_token_secret
```

> ⚠️ Never commit `.env` to version control. It is already listed in `.gitignore`.

### 3. Run in Development

```bash
npm run dev
```

Uses `tsx watch` for instant TypeScript reloading. `initDB()` runs on startup and creates the `users` table if it doesn't exist.

### 4. Build for Production

```bash
npm run build
npm start
```

`tsup` compiles `src/` into `dist/`. The `start` script runs the compiled output with Node.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port to listen on (default: `3000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `REFRESH_TOKEN` | Yes | Secret for signing refresh tokens |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |

---

## Authentication

JWT-based auth with a short-lived access token and a long-lived refresh token stored in an `httpOnly` cookie.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login — returns access token, sets refresh token cookie |
| `POST` | `/api/auth/refresh-token` | Get a new access token via cookie |

### Token Flow

1. **Login** (`POST /api/auth/login`) returns an `accessToken` in the response body and sets a `refreshToken` `httpOnly` cookie (30-day expiry).
2. **Protected routes** expect the access token as a `Bearer` token in the `Authorization` header (see `src/middleware/auth.ts`).
3. **Refresh** (`POST /api/auth/refresh-token`) reads the cookie, verifies the refresh token against `REFRESH_TOKEN` secret, and returns a new `accessToken`.

> The CORS config has `credentials: true` — your frontend must send requests with `credentials: "include"` (fetch) or `withCredentials: true` (axios) for cookies to be sent cross-origin.

### Using `authMiddleware`

```ts
import { authMiddleware } from "../middleware/auth";

router.get("/profile", authMiddleware, usersController.getProfile);
```

---

## Adding a New Module

1. Create a folder: `src/modules/your-feature/`
2. Add these four files:
   - `your-feature.interface.ts` — TypeScript types
   - `your-feature.service.ts` — DB queries and business logic
   - `your-feature.controller.ts` — Route handler functions
   - `your-feature.router.ts` — Express Router with routes
3. Register the router in `src/app.ts`:

```ts
import yourFeatureRouter from "./modules/your-feature/your-feature.router";

app.use("/api/your-feature", yourFeatureRouter);
```

---

## Error Handling

Errors are caught by the global handler in `src/middleware/globalErrorHandler.ts`, registered as the last middleware in `app.ts`. Any error passed to `next(err)` returns:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Pattern to use in controllers:

```ts
const myHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await myService.doSomething(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

> ⚠️ **Note:** The `try/catch` blocks in the current `registerUser` and `loginUser` controllers wrap only the `res.json()` call, leaving the `await authService.*()` calls above them unguarded. If the service throws, the error won't reach the global handler — it will crash the process. Move the service call inside the `try` block as shown in the pattern above.

---

## License

ISC