# ScribeAI – Handwritten PDF → AI Extract & Summary

Turn messy handwritten notes into structured AI summaries powered by **Google Document AI** and **Gemini**.

## Features

- 📄 **PDF Upload** – Drag & drop handwritten PDFs
- 🔍 **OCR Extraction** – Google Document AI for handwriting recognition
- 🧠 **AI Summarization** – Gemini generates executive summaries, key points, and topics
- 📊 **Results Dashboard** – View AI Summary, Clean Extract, and Raw OCR data
- ⬇️ **Export** – Download as TXT or PDF, copy to clipboard
- 🔒 **Privacy** – Files auto-deleted after processing

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS v4, TypeScript
- **Backend**: Next.js API Routes
- **AI**: Google Document AI (OCR), Gemini 2.0 Flash (Summarization)

## Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud project with Document AI API enabled
- Gemini API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/scribeai.git
cd scribeai
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:
```
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us
DOCUMENT_AI_PROCESSOR_ID=your-processor-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GEMINI_API_KEY=your-gemini-api-key
```

4. Place your Google Cloud service account JSON key as `service-account.json` in the project root.

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload PDF file (multipart/form-data) |
| POST | `/api/process` | Process uploaded file (OCR + AI summary) |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts    # File upload endpoint
│   │   └── process/route.ts   # OCR + AI processing pipeline
│   ├── dashboard/page.tsx     # Main app dashboard
│   ├── globals.css            # Design system & animations
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
└── lib/
    ├── documentai.ts          # Google Document AI integration
    ├── gemini.ts              # Gemini summarization
    └── textCleaner.ts         # OCR text cleaning utilities
```

## Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard.

## License

MIT
