# Monkey Tool 🛠️

A comprehensive, industry-standard suite of online file manipulation tools built with **Next.js**, **TurboRepo**, and a microservices-inspired architecture. This monorepo hosts a high-performance web application and a dedicated background worker for heavy processing tasks like PDF conversion.

## 🚀 Features

Monkey Tools provides a wide array of client-side and server-side utilities:

### 📄 PDF Tools
- **Convert to Word/Excel**: High-fidelity PDF to DOCX/XLSX conversion (Server-side powered by LibreOffice & Ghostscript).
- **Compression**: Reduce PDF file size efficiently.
- **Organization**: Merge, Split, Rotate, and Add Page Numbers.
- **Security**: Protect PDFs with passwords or Remove restrictions.
- **Watermark**: Add custom watermarks to documents.

### 🖼️ Image Tools
- **Compression & resizing**: Optimize images for web usage.
- **Conversion**: HEIC to JPG, WebP to JPG, JPG to PNG, etc.
- **Editing**: Crop, Flip, and Remove Backgrounds (AI-powered).

### 🛠️ Developer & Text Tools
- **Generators**: QR Code, Strong Password, and Brazilian document numbers (CPF, CNPJ).
- **Converters**: JSON to Excel.
- **Utilities**: Word & Character counters.

---

## 🏗️ Architecture

This project is a **Monorepo** managed by [TurboRepo](https://turbo.build/) and [pnpm](https://pnpm.io/), ensuring fast builds and shared type safety.

```
monkey-tools/
├── apps/
│   ├── web/          # Next.js 15+ App Router (Frontend)
│   └── worker/       # Node.js Background Worker (Heavy Processing)
├── packages/
│   ├── ui/           # Shared React Components (shadcn/ui)
│   ├── database/     # MongoDB/Mongoose Schemas & Connection
│   ├── queue/        # BullMQ (Redis) Job Queue Configuration
│   ├── storage/      # S3/DigitalOcean Spaces upload logic
│   ├── types/        # Shared TypeScript interfaces & Zod schemas
│   └── *-config/     # Shared TS configs
└── docker-compose.yml # Infrastructure (Redis, Worker)
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui.
- **State/Query**: TanStack Query, TRPC (Type-safe API).
- **Backend Worker**: Node.js, BullMQ (Job Queue).
- **Infrastructure**: Docker, Redis (Queue), MongoDB (Metadata), S3 Compatible Storage (DO Spaces).
- **Processing Engine**: LibreOffice (headless), Ghostscript, Poppler Utils (`pdftotext`).

---

## ⚙️ Prerequisites

- **Node.js** (v20+)
- **pnpm** (v9+)
- **Docker & Docker Compose** (For running Redis and the Worker environment)
- **LibreOffice & Ghostscript** (Optional: Only if running worker *outside* Docker)

---

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/monkey-tools.git
cd monkey-tools
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Setup
Create a `.env` file in `apps/web` and `apps/worker` (or use a root `.env` if configured). You will need:

```env
# Database & Queue
DATABASE_URL="mongodb+srv://..."
REDIS_URL="redis://localhost:6379"

# Object Storage (Digital Ocean Spaces / S3)
DO_SPACES_ENDPOINT="https://nyc3.digitaloceanspaces.com"
DO_SPACES_REGION="nyc3"
DO_SPACES_BUCKET="your-bucket"
DO_SPACES_ACCESS_KEY="your-key"
DO_SPACES_SECRET_KEY="your-secret"
```

### 4. Start Infrastructure
Start Redis (and the Worker if you don't want to run it natively) using Docker:
```bash
docker-compose up -d
```

### 5. Run Development Server
Start the Next.js frontend and the worker packages in development mode:
```bash
pnpm dev
```
- Web App: `http://localhost:3000`

---

## 🐳 Docker Deployment

The project includes a production-ready `docker-compose.yml` and `Dockerfile` for the worker.

### Building the Worker
 The worker requires a specific environment (Linux + LibreOffice + Fonts). Using Docker is highly recommended for consistency.

```bash
# Build and start the worker container
docker-compose up -d --build worker

# View logs
docker-compose logs -f worker
```

**Note**: The worker handles heavy tasks like "PDF to Word". If these features aren't working locally, ensure the Docker worker is running.

---

## 🛡️ Best Practices Implemented

- **Type Safety**: End-to-end type safety used via shared `types` package and TRPC.
- **Fail-Safe Processing**: The worker implements robust fallback mechanisms (e.g., falling back to `pdftotext` if LibreOffice fails on complex PDFs).
- **Optimization**: PDFs are pre-optimized with Ghostscript before conversion to reduce memory usage.
- **Isolation**: File conversions run in isolated user profiles to prevent cross-request contamination or crashes.

## 🤝 Contributing

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
