# MindChart Mobile

The mobile application for MindChart - a local-first, AI-powered note-taking and knowledge management app. Built with Expo and React Native, MindChart Mobile runs on iOS, Android, and Web.

## What's Inside

- **Expo v54** - Cross-platform development framework
- **React Native v0.81.4** - Native mobile app development
- **Local-First Architecture** - SQLite database with OP-SQLite for native and Sqlite.js for Web
- **Drizzle ORM** - Type-safe database queries and migrations
- **NativeWind v4** - Tailwind CSS for React Native styling
- **AI Integration** - OpenAI API and Llama.rn for local AI models
- **Speech-to-Text** - Whisper.rn for audio transcription
- **Knowledge Graph** - D3.js and React Native Skia for graph visualization
- **State Management** - Zustand and React Query (TanStack Query)
- **UI Components** - Radix UI primitives and React Native Reusables
- **Dark/Light Mode** - Full theme support with Android Navigation Bar integration
- **Code Quality** - ESLint, TypeScript, and Biome for linting and formatting

## Features

- **Note Taking**: Create and manage notes with rich text support
- **AI-Powered Generation**: Generate notes using OpenAI or local Llama models
- **Speech-to-Text**: Transcribe audio recordings using Whisper
- **Semantic Search**: Find notes using AI embeddings and vector similarity
- **Knowledge Graph**: Visualize relationships between notes and thoughts
- **Categories**: Organize notes with customizable categories
- **Database Management**: Import/export SQLite databases
- **Local-First**: All data stored locally, no cloud dependency required

## Requirements

- **Node.js**: >=18
- **Package Manager**: Yarn 4.12.0 (managed at monorepo root)
- **Android Development**: Android Studio with Android Emulator
- **For Windows**: Microsoft Visual C++ Redistributable

## Getting Started

This app is part of the MindChart monorepo. Make sure you've installed dependencies at the root:

```bash
# From the monorepo root
yarn install
```

### Development

Start the Expo development server:

```bash
# From the monorepo root
yarn workspace mobile dev

# Or from this directory
cd apps/mobile
yarn dev
```

### Running on Platforms

```bash
# iOS Simulator
yarn ios

# Android Emulator
yarn android

# Or use the dev commands
yarn dev:android
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages and routes
│   ├── (tabs)/            # Tab navigation screens
│   ├── graph.tsx          # Knowledge graph view
│   └── newDatabase.tsx    # Database creation
├── pages/                  # Page-level components with consistent layout
│   ├── homePage.tsx       # Home screen page
│   ├── newDatabase.tsx    # Database creation page
│   ├── notes/             # Notes pages
│   │   ├── notesList.tsx  # Notes list page
│   │   └── noteDetails.tsx # Note details page
│   ├── graph/             # Graph pages
│   │   ├── graphPage.tsx  # Main graph view
│   │   └── graphThoughIdPage.tsx # Graph by thought ID
│   └── settings/          # Settings pages
│       ├── settingsPage.tsx # Main settings
│       ├── aiSettings.tsx   # AI configuration
│       └── database/       # Database settings
│           ├── index.tsx   # Database settings page
│           └── dbInspector.tsx # Database inspector
├── api/                    # API layer
│   ├── controllers/       # React Query hooks and controllers
│   └── endpoints/        # API endpoint definitions
├── components/            # Reusable UI components
│   ├── ui/               # UI primitives (Radix-based)
│   ├── primitives/       # Base components
│   └── layout/           # Layout components
│       └── page/         # PageContainer component
├── features/              # Feature modules
│   ├── noteCreation/     # Note creation flow
│   ├── notes/            # Notes list and details
│   ├── graph/            # Knowledge graph visualization
│   ├── settings/         # App settings
│   ├── llama/            # Llama AI integration
│   └── whisper/          # Whisper speech-to-text
├── services/              # Business logic services
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and helpers
└── assets/                # Images, fonts, and static assets
```

### Pages Folder

The `pages/` folder contains page-level components that provide the basic layout structure for each screen. Each page component:

- Uses `PageContainer` for consistent layout (headers, safe areas, scrolling)
- Wraps feature components with standardized styling
- Supports different header variants (`stack`, `tab`, `none`)
- Handles navigation and safe area insets automatically

## Configuration

### Environment Variables

Create a `.env` file in `apps/mobile/` if needed:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### App Configuration

Main app configuration is in `app.config.ts`:

- App name: MindChart
- Bundle ID: `com.MindChart.app`
- Supported platforms: iOS, Android, Web

## Dependencies

### Key Packages

- **@repo/sqlite** - Shared database layer
- **@repo/zod-schemas** - Validation schemas
- **@repo/constants** - Shared constants
- **@repo/theme** - Theming system

### Native Modules

- **@op-engineering/op-sqlite** - High-performance SQLite
- **llama.rn** - Local LLM inference
- **whisper.rn** - Speech-to-text
- **@shopify/react-native-skia** - 2D graphics for graph visualization

## Development Tips

1. **Hot Reload**: The dev server supports fast refresh for React components
2. **Type Safety**: Full TypeScript support with strict type checking
3. **Database**: SQLite database is stored locally and can be exported/imported
4. **AI Models**: Llama models run locally on device, no internet required
5. **Graph Visualization**: Uses D3.js for layout and Skia for rendering

## Troubleshooting

### Clear Cache

```bash
yarn dev  # Automatically clears cache with -c flag
```

### Reset Metro Bundler

```bash
yarn expo start -c
```

### Rebuild Native Projects

```bash
yarn prebuild --clean
```

### Check Expo Dependencies

```bash
yarn expo-check
```

## License

MindChart is dual-licensed.

- For open-source use, it is available under the **AGPLv3**.
- For commercial or proprietary use, please contact [mleg1234@protonmail.com](mailto:mleg1234@protonmail.com).
