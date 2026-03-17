# MindChart Server

Express.js backend API server for MindChart. Built with TypeScript, Express 5.x, and OpenAI integration.

## Getting Started

This server is part of the MindChart monorepo. Install dependencies at the root:

```bash
yarn install
```

### Development

```bash
# From monorepo root
yarn workspace server dev

# Or from this directory
cd apps/server
yarn dev
```

### Build & Production

```bash
yarn build    # Build for production
yarn prod     # Run production build
yarn test     # Run tests
yarn lint     # Lint and type check
```

## Configuration

Create `.env` in `apps/server/`:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:8081
OPENAI_API_KEY=your_openai_api_key
```

## API Routes

- `/health-check` - Health check
- `/users` - User management
- `/openai` - OpenAI integration (note generation, embeddings)
- `/upload` - File uploads (single, multiple, fields)
- `/transcription` - Speech-to-text
- `/api-docs` - Swagger UI documentation

## Project Structure

```
src/
├── api/              # API routes
│   ├── healthCheck/
│   ├── openai/
│   ├── transcription/
│   ├── upload/
│   └── user/
├── api-docs/         # OpenAPI documentation
├── common/           # Shared utilities
│   ├── middleware/   # Express middleware
│   ├── models/       # Data models
│   └── utils/        # Utilities
├── index.ts          # Entry point
└── server.ts         # Express app config
```

## Dependencies

**Workspace packages**: `@repo/openai`, `@repo/zod-schemas`, `@repo/constants`

**Key packages**: Express, Zod, Multer, Pino, Helmet, Swagger UI

## API Documentation

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs/json`

## License

MindChart is dual-licensed.

- For open-source use, it is available under the **AGPLv3**.
- For commercial or proprietary use, please contact [mleg1234@protonmail.com](mailto:mleg1234@protonmail.com).
