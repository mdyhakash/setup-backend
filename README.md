# Express TypeScript Backend Boilerplate

A minimal, production-ready backend starter built with **Express 5**, **TypeScript**, and **PostgreSQL**. Designed to get you from zero to a working API with auth, DB connection, and a clean module structure — without the bloat.

---

## Tech Stack

| Tool                                                               | Purpose                    |
| ------------------------------------------------------------------ | -------------------------- |
| [Express ](https://expressjs.com/)                                 | HTTP framework             |
| [TypeScript](https://www.typescriptlang.org/)                      | Type safety                |
| [PostgreSQL + `pg`](https://node-postgres.com/)                    | Database                   |
| [JWT + `jsonwebtoken`](https://github.com/auth0/node-jsonwebtoken) | Authentication             |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js)                   | Password hashing           |
| [dotenv](https://github.com/motdotla/dotenv)                       | Environment config         |
| [tsup](https://tsup.egoist.dev/)                                   | TypeScript bundler (build) |
| [tsx](https://github.com/privatenumber/tsx)                        | TypeScript runner (dev)    |

---

## Project Structure

```
├── src/
│   ├── config/
│   │   └── index.ts          # App configuration & env vars
│   ├── db/
│   │   └── index.ts          # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.ts           # JWT authentication middleware
│   ├── utils/                # Shared utility functions
│   ├── modules/              # Feature modules (routes, controllers, services, interfaces)
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── dist/                     # Compiled output (generated, do not edit)
├── .env                      # Environment variables (do not commit)
├── .gitignore
├── tsconfig.json
├── tsup.config.js
└── package.json
```

### Module Structure

Each feature lives in its own folder under `src/modules/`:

```
modules/
└── users/
    ├── users.router.ts       # Express Router — defines routes
    ├── users.controller.ts   # Request handlers — parses req, sends res
    ├── users.service.ts      # Business logic & DB queries
    └── users.interface.ts    # TypeScript type declarations
```

To add a new feature (e.g. `posts`), duplicate the `users/` folder pattern and register the router in `app.ts`.

---

## Configuration Files

### `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    // File Layout
    "rootDir": "./src",
    "outDir": "./dist",

    // Environment Settings
    "module": "esnext",
    "target": "esnext",
    "moduleResolution": "bundler",
    "types": ["node"],

    // Other Outputs
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Recommended Options
    "strict": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
  },
  "include": ["src/**/*"],
  "exclude": [],
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
- `banner.js` — injects a `require()` shim into the bundle. Needed because some CommonJS-only dependencies call `require()` at runtime, which doesn't exist in native ESM. This polyfills it.

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

Copy the example env file and fill in your values:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your_super_secret_key
REFRESH_TOKEN=your_refresh_token_secret
```

> ⚠️ Never commit `.env` to version control. It is already listed in `.gitignore`.

### 3. Set Up the Database

Open `src/db/index.ts` and uncomment the `CREATE TABLE` block inside `initDB()` to run your initial schema on startup, or connect to your DB manually and run your migrations.

### 4. Run in Development

```bash
npm run dev
```

Uses `tsx watch` for instant TypeScript reloading. No compile step needed.

### 5. Build for Production

```bash
npm run build
npm start
```

`tsup` compiles `src/` into `dist/`. The `start` script runs the compiled output with Node.

---

## Environment Variables

| Variable        | Required | Description                         |
| --------------- | -------- | ----------------------------------- |
| `PORT`          | No       | Port to listen on (default: `3000`) |
| `DATABASE_URL`  | Yes      | PostgreSQL connection string        |
| `JWT_SECRET`    | Yes      | Secret for signing access tokens    |
| `REFRESH_TOKEN` | Yes      | Secret for signing refresh tokens   |

---

## Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/`    |
| `npm start`     | Run compiled production server   |

---

## Authentication

JWT-based auth is wired up and ready to use. The `src/middleware/auth.ts` file exports a middleware you can attach to any route:

```ts
import { authMiddleware } from "../middleware/auth";

router.get("/profile", authMiddleware, usersController.getProfile);
```

Tokens are expected as a `Bearer` token in the `Authorization` header, or optionally via an `httpOnly` cookie (cookie-parser is already installed).

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

A global error handler is registered in `app.ts` as the last middleware. Any error passed to `next(err)` from a route or middleware will be caught and returned as:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

To trigger it from a controller or service:

```ts
try {
  // ...
} catch (error) {
  next(error);
}
```

---

## License

ISC
