# ke-cvonthemove

Monorepo workspace for cvonthemove, consisting of:
- `packages/web` - Angular frontend
- `packages/api` - Node.js backend using Express
- `packages/db` - Database access layer via Prisma and PostgreSQL

## Requirements
- Node.js (v20+)
- npm (v10+)
- Podman (for local PostgreSQL instance)

## Setup and Installation

1. Install dependencies from the root:
   ```bash
   npm install
   ```

2. Start the local database using Podman:
   ```bash
   npm run db:podman:up
   ```

3. Generate the Prisma Client and push the schema to the local database:
   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cvonthemove?schema=public"
   npm run db:push
   npm run db:generate
   ```

## Running the Applications

### API Development Server
```bash
# Starts the API server with tsx watch
npm run api:dev
```

### Web Development Server
```bash
# Starts the Angular web frontend
npm run web:start
```

## Neon Production Database

When deploying or testing against Neon, ensure the `DATABASE_URL` environment variable points to your Neon PostgreSQL connection string. The schema structure remains exactly the same.
