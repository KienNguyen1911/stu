# Flow Studio

> Local-first Google Flow automation client, REST API server, and management dashboard.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)

Flow Studio provides a reliable, transaction-backed automation layer over Google Flow (Imagen 3). It features multi-account concurrency pooling, ACID job scheduling in SQLite, content-addressable SHA-256 asset storage, and a built-in REST API with a modern web dashboard.

---

## ✨ Features

- **🎨 Text-to-Image (T2I) & Image-to-Image (I2I)**: Generate high-resolution images from prompts and reference image assets.
- **🛡️ Local-First & Credential-Safe**: Browser authentication stays isolated inside native Chrome user profiles. No cookies or raw tokens are stored in the database.
- **⚡ ACID State Machine**: SQLite-backed job queue with idempotency keys, pre-submission intent tracking, and crash-resilient recovery invariants.
- **👥 Multi-Account Pooling**: Coordinate multiple accounts with automatic lease acquisition and load distribution.
- **🌐 REST API & Web Dashboard**: Full REST API for headless integrations plus a responsive, theme-switchable UI dashboard.
- **🧱 Deep Module Architecture**: Clean interface seams (`FlowAdapterPort`), production Playwright driver, and hermetic in-memory test fakes (`InMemoryFlowAdapter`).

---

## 📋 Prerequisites

- **Node.js**: v22.0.0 or later (uses native `node:sqlite` and `node:test`).
- **Google Chrome**: Installed locally on Windows, macOS, or Linux.
- **Google Account**: An active account with access to [Google Flow](https://flow.google.com).

---

## 🚀 Quick Start

### 1. Install Dependencies & Build

```bash
npm install
npm run build
```

### 2. Log in with Google Account

Launch an interactive Chrome session to sign in to Google Flow:

```bash
npm run login
# Or with a custom account ID and label:
# npm run login account-1 "My Account"
```

Once logged in, open or create a Flow project. Flow Studio will automatically link the project to your local database.

### 3. Generate an Image (CLI)

```bash
# Text-to-Image
npm run generate "A cute golden retriever puppy sitting on green grass, sunny day"

# Image-to-Image with reference image
npm run generate "Transform into watercolor anime style" --reference path/to/input.png
```

Generated outputs are downloaded, verified, and saved to `data/` and the SHA-256 blob store.

### 4. Start the REST API & Web Dashboard

```bash
npm run start
# Server listens on port 3100 by default (set PORT=... to override)
```

Open your browser to:
- **Web Dashboard**: `http://localhost:3100/`
- **Health Check**: `http://localhost:3100/api/health`

---

## 🛠️ Programmatic Usage (TypeScript / JavaScript)

Flow Studio exposes a deep module facade (`FlowStudio`) for seamless integration into other applications:

```typescript
import { FlowStudio } from "flow-studio";

const studio = new FlowStudio({
  dataRoot: "./data",
});

// Generate an image
const result = await studio.generate({
  prompt: "A futuristic neon cyber lotus floating on dark water",
  referenceImages: ["./reference.png"], // optional
});

console.log("Job ID:", result.jobId);
console.log("Image saved at:", result.outputs[0]?.blobPath);

// Start embedded API server and queue
studio.startQueue();
await studio.startServer({ port: 3100 });

// Graceful cleanup
await studio.close();
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, uptime, and queue metrics |
| `GET` | `/api/accounts` | List accounts, status, and current busy leases |
| `POST` | `/api/accounts` | Register or update an account |
| `GET` | `/api/jobs` | List recent jobs with status and attempts |
| `POST` | `/api/jobs` | Submit a generation job (`{ prompt, inputAssetIds, projectId }`) |
| `GET` | `/api/jobs/:id` | Get job details, execution attempts, and generated output URLs |
| `POST` | `/api/assets/upload` | Upload binary image (`image/png`, `image/jpeg`) to BlobStore |
| `GET` | `/api/assets/:id/blob` | Download content-addressed binary blob |
| `GET` | `/` | Web Dashboard UI |

---

## 📁 Repository Structure

```text
flow-studio/
├── data/                    # Local storage (SQLite, blobs, profiles) - gitignored
├── docs/
│   └── ADR-001-ARCHITECTURE.md  # Architectural Decision Record
├── scripts/
│   ├── generate-image.ts    # CLI image generator
│   ├── link-project.ts      # Project linking utility
│   ├── login-account.ts     # Interactive browser login
│   └── start-server.ts      # Server & Queue launcher
├── src/
│   ├── index.ts             # Primary library exports
│   ├── flowStudio.ts        # Deep Module Facade
│   ├── config.ts            # Platform detection & paths
│   ├── domain/              # Domain models & safety invariants
│   ├── application/         # JobRunner, JobQueue, AccountManager, Coordinator
│   ├── infrastructure/
│   │   ├── db/              # SQLite schema & database driver
│   │   ├── blobs/           # SHA-256 content-addressable storage
│   │   └── flow/            # FlowAdapterPort, Playwright driver, InMemory adapter
│   └── server/              # HTTP REST API & embedded dashboard
├── tests/                   # 100% in-process test suite
├── SPEC.md                  # Detailed technical specification
├── package.json
└── tsconfig.json
```

---

## 🧪 Testing

Run the test suite:

```bash
npm test
```

All unit and integration tests run entirely in-process using `InMemoryFlowAdapter` and `:memory:` SQLite without launching Chrome or external networks.

---

## 🚢 Publishing to a Standalone GitHub Repository

To push this project to its own independent repository on GitHub:

```bash
# 1. Initialize git in this directory
git init

# 2. Add files and commit
git add .
git commit -m "feat: initial commit of Flow Studio"

# 3. Create a repo on GitHub and push
git remote add origin https://github.com/<your-username>/flow-studio.git
git branch -M main
git push -u origin main
```

---

## 📄 License

[MIT](LICENSE)
