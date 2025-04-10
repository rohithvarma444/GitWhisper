# gitRAG

A powerful tool for analyzing GitHub repositories and meetings using RAG (Retrieval-Augmented Generation).

## Features

- **GitHub Repository Analysis**: Connect and analyze any GitHub repository
- **Meeting Transcription**: Upload and process meeting audio files
- **AI-Powered Q&A**: Ask questions about your codebase and get intelligent answers
- **Commit Analysis**: Track and understand code changes over time
- **Real-time Processing**: Get instant insights from your meetings and code

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma
- **Database**: PostgreSQL
- **AI**: Google Gemini, AssemblyAI
- **Authentication**: Clerk
- **File Storage**: Cloudinary
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Cloudinary account
- Clerk account
- Google AI API key
- AssemblyAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rohithvarma444/gitrag.git
   cd gitrag
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/gitrag"
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=audio files
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # AI Services
   GOOGLE_AI_API_KEY=your_google_ai_key
   ASSEMBLYAI_API_KEY=your_assemblyai_key
   ```

4. Set up the database:
   ```bash
   bun run db:push
   # or
   npm run db:push
   ```

5. Start the development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create a Project**:
   - Connect your GitHub repository
   - The system will automatically index your codebase

2. **Upload Meetings**:
   - Upload audio files from your meetings
   - The system will transcribe and analyze the content

3. **Ask Questions**:
   - Use the Q&A interface to ask questions about your code
   - Get AI-powered answers with code references

4. **View Meeting Analysis**:
   - Access detailed insights from your meetings
   - Track processing status and view results

## Project Structure

```
gitrag/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js app router
│   │   ├── (protected)/ # Protected routes
│   │   └── api/         # API routes
│   ├── components/      # UI components
│   ├── lib/             # Utility functions
│   ├── server/          # tRPC server
│   └── hooks/           # Custom React hooks
└── package.json         # Dependencies
```

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [Prisma](https://www.prisma.io/)
- [Clerk](https://clerk.dev/)
- [Cloudinary](https://cloudinary.com/)
- [Google AI](https://ai.google.dev/)
- [AssemblyAI](https://www.assemblyai.com/)

