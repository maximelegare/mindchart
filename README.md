![Alt text](./.github/images/HEADER.png)

# MindChart

A local-first, AI-powered note-taking and knowledge management application built with React Native and Express. MindChart helps you capture thoughts, generate notes using AI, visualize knowledge graphs, and search semantically through your notes.

## What's Inside?

This Turborepo monorepo includes the following packages and apps:

### Apps

- **`mobile`**: A React Native/Expo mobile application (iOS, Android, Web)
  - Local-first architecture with SQLite
  - AI-powered note generation (OpenAI & Llama)
  - Speech-to-text transcription (Whisper)
  - Knowledge graph visualization
  - Semantic search with embeddings
  - Dark/light theme support

- **`server`**: Express.js backend API server
  - RESTful API endpoints
  - File upload handling
  - OpenAI integration
  - Swagger API documentation
  - Request validation with Zod

### Packages

- **`@repo/sqlite`**: SQLite database layer with Drizzle ORM
  - Database migrations
  - Query utilities for notes, thoughts, embeddings, and graph data
  - Local-first data persistence

- **`@repo/openai`**: OpenAI API integration
  - Chat completions
  - Embedding generation
  - Speech-to-text
  - Note generation

- **`@repo/zod-schemas`**: Shared Zod validation schemas
  - Client and server-side validation
  - Type-safe API contracts

- **`@repo/constants`**: Shared constants and utilities
  - AI query templates
  - Application constants

- **`@repo/theme`**: Theming system
  - Category themes
  - Global theme configuration

- **`@repo/eslint-config`**: ESLint configurations
  - Base, mobile, server, and Next.js configs
  - Consistent code quality across packages

- **`@repo/typescript-config`**: TypeScript configurations
  - Base, Next.js, and React library configs
  - Shared TypeScript settings

## Tech Stack

### Mobile App

- **Framework**: Expo v54, React Native 0.81.4
- **Styling**: NativeWind v4 (Tailwind CSS for React Native)
- **Database**: SQLite with Drizzle ORM
- **State Management**: Zustand, React Query (TanStack Query)
- **AI/ML**: Llama.rn (local LLM), Whisper.rn (speech-to-text), OpenAI API
- **UI Components**: Radix UI primitives, React Native Reusables
- **Visualization**: D3.js, React Native Skia
- **Navigation**: Expo Router

### Server

- **Framework**: Express.js 5.x with TypeScript
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino
- **Security**: Helmet, CORS, Rate limiting

### Development Tools

- **Monorepo**: Turborepo
- **Package Manager**: Yarn 4 (workspaces)
- **Linting**: ESLint, Biome
- **Type Checking**: TypeScript 5.9
- **Code Formatting**: Prettier, Biome

## Prerequisites

- **Node.js**: >=18
- **Package Manager**: Yarn 4.12.0
- **iOS Development**: Xcode (for iOS Simulator)
- **Android Development**: Android Studio (for Android Emulator)
- **For Windows**: Microsoft Visual C++ Redistributable

## Getting Started

### Installation

```bash
# Install dependencies
yarn install
```

### Development

To run all apps and packages in development mode:

```bash
# Start mobile app and server in parallel
yarn dev

# Or run specific apps
yarn workspace mobile dev
yarn workspace server dev
```

### Mobile App Development

```bash
# Start Expo development server
cd apps/mobile
yarn dev

# Run on specific platforms
yarn ios          # iOS Simulator
yarn android      # Android Emulator
yarn build:web    # Web build
```

### Server Development

```bash
# Start Express server
cd apps/server
yarn dev          # Development mode with hot reload
yarn build        # Build for production
yarn prod         # Run production build
```

### Building

To build all apps and packages:

```bash
# Build everything
yarn build

# Build specific package/app
yarn turbo build --filter=mobile
yarn turbo build --filter=server
```

### Type Checking

```bash
# Check types across all packages
yarn check-types

# Check specific package
yarn turbo check-types --filter=mobile
```

### Linting

```bash
# Lint all packages
yarn lint

# Lint specific package
yarn turbo lint --filter=mobile
```

## Project Structure

```
MindChart/
├── apps/
│   ├── mobile/          # React Native/Expo mobile app
│   │   ├── app/         # Expo Router pages
│   │   ├── features/    # Feature modules (notes, graph, settings, etc.)
│   │   ├── components/  # UI components
│   │   ├── api/         # API controllers and endpoints
│   │   └── services/    # Business logic services
│   └── server/          # Express.js backend
│       ├── src/
│       │   ├── api/     # API routes
│       │   └── common/  # Shared utilities
│       └── uploads/     # File upload directory
├── packages/
│   ├── sqlite/          # Database layer
│   ├── openai/          # OpenAI integration
│   ├── zod-schemas/     # Validation schemas
│   ├── constants/       # Shared constants
│   ├── theme/           # Theming system
│   ├── eslint-config/   # ESLint configs
│   └── typescript-config/ # TypeScript configs
└── turbo.json           # Turborepo configuration
```

## 🔑 Key Features

- **Note Taking**: Create and manage notes with rich text support
- **AI-Powered Generation**: Generate notes using OpenAI or local Llama models
- **Speech-to-Text**: Transcribe audio using Whisper
- **Semantic Search**: Find notes using AI embeddings and vector similarity
- **Knowledge Graph**: Visualize relationships between notes and thoughts
- **Local-First**: All data stored locally in SQLite
- **Dark Mode**: Full dark/light theme support
- **Cross-Platform**: iOS, Android, and Web support

## Configuration

### Environment Variables

Create `.env` files in the respective app directories:

**`apps/server/.env`**:

```env
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=your_openai_api_key
```

**`apps/mobile/.env`** (if needed):

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## License

MindChart is dual-licensed.

- For open-source use, it is available under the **AGPLv3**.
- For commercial or proprietary use, please contact [mleg1234@protonmail.com](mailto:mleg1234@protonmail.com).

See [LICENSE.md](./LICENSE.md) for full details.

## Useful Links

- [Turborepo Documentation](https://turborepo.com/docs)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [NativeWind Documentation](https://www.nativewind.dev)

### Turborepo Resources

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

See individual package licenses for details.
