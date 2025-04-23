# GitWhisper 🚀

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Built With](https://img.shields.io/badge/Built%20with-Next.js%2C%20tRPC%2C%20Prisma%2C%20Gemini%2C%20AssemblyAI-007ACC.svg?logo=nextdotjs)

> Unlock insights from your GitHub repositories and meeting transcripts with the power of Retrieval-Augmented Generation (RAG). GitWhisper provides an intuitive platform to analyze code, track changes, and extract valuable information from discussions.

## ✨ Features

-   🔍 **GitHub Repository Analysis**: Seamlessly connect and index any public or private GitHub repository (requires appropriate permissions). Understand your codebase like never before.
-   🎙️ **Meeting Transcription & Analysis**: Upload audio files of your team meetings. Get accurate transcriptions and leverage AI to analyze discussions, decisions, and action items.
-   🤖 **AI-Powered Q&A**: Ask complex questions about your code base or meeting transcripts using natural language and get intelligent, context-aware answers powered by the Gemini AI model.
-   📊 **Commit Analysis**: Gain insights into code changes, contributor activity, and project evolution over time.
-   ⚡ **Real-time Processing**: Experience fast transcription and analysis of your data, providing near real-time insights.
-   🔒 **Secure Authentication**: Built with Clerk for robust and easy-to-use user authentication.

## 🛠️ Tech Stack

GitWhisper is built using a modern, scalable, and type-safe technology stack:

| Category         | Technologies                                |
| :--------------- | :------------------------------------------ |
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | tRPC (End-to-end typesafety), Prisma (ORM)  |
| **Database** | PostgreSQL (e.g., Neon)                     |
| **AI Services** | Google Gemini, AssemblyAI                   |
| **Authentication** | Clerk                                       |
| **File Storage** | Cloudinary                                  |


## 🚀 Getting Started

Follow these steps to get GitWhisper up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed and accounts set up:

-   **Node.js** 18+ or **Bun**: For running the application.
-   **PostgreSQL Database**: A running instance. You can use a cloud provider like Neon (as in the example `.env`) or a local setup.
-   **GitHub Personal Access Token**: With `repo` scope to analyze private repositories.
-   **Cloudinary Account**: For storing meeting audio files.
-   **Clerk Account**: For authentication services.
-   **Google AI API Key**: Access to the Gemini model.
-   **AssemblyAI API Key**: For meeting transcription.

### Installation

1.  **Clone the repository**:

    ```bash
    git clone [https://github.com/rohithvarma444/GitWhisper.git](https://github.com/rohithvarma444/GitWhisper.git)
    cd GitWhisper
    ```

2.  **Install dependencies**:
    Using Bun (recommended):

    ```bash
    bun install
    ```
    or using npm:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root directory of the project. Copy the content from `.env.example` (if provided, otherwise create a new `.env` file) and populate it with your keys and credentials.

    Here's a template based on the core variables needed:

    ```env
    # Database
    # Example using Neon DB
    DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

    # Authentication (Clerk)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/sync-user
    NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
    NEXT_PUBLIC_CLERK_REDIRECT_URL=/dashboard

    # GitHub
    GITHUB_TOKEN=your_github_personal_access_token # Requires 'repo' scope

    # File Storage (Cloudinary)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset # e.g., "audio_files"

    # AI Services
    GOOGLE_AI_API_KEY=your_gemini_api_key
    ASSEMBLY_AI_API_KEY=your_assemblyai_api_key

    # NextAuth (If used, often included in Next.js projects)
    # NEXTAUTH_URL=http://localhost:3000 # Example
    # NEXTAUTH_SECRET=your_nextauth_secret # Example (generate a strong secret)
    ```
    **Note:** Ensure you set the `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` value correctly (e.g., "audio_files").

4.  **Set up the database**:
    Apply the Prisma schema and generate the Prisma client.

    Using Bun:
    ```bash
    bun run db:push
    ```
    or using npm:
    ```bash
    npm run db:push
    ```
    This command pushes the schema to your database and generates the necessary client code.

5.  **Start the development server**:
    Using Bun:

    ```bash
    bun run dev
    ```
    or using npm:
    ```bash
    npm run dev
    ```

6.  Open your browser and visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

GitWhisper provides a straightforward workflow to analyze your projects:

1.  **Create a Project**: Navigate to the project creation section. Connect your desired GitHub repository by providing its URL or name. GitWhisper will then begin indexing the codebase.
2.  **Upload Meetings**: Go to the meetings section. Upload audio files (.mp3, .wav, etc.) from your team meetings. The system will process these files using AssemblyAI for transcription.
3.  **Ask Questions**: Once your repository is indexed and meetings are transcribed, use the Q&A interface. Select the project or meeting you're interested in and ask questions about the code, project history, meeting discussions, decisions made, etc. Leverage the AI to get insightful answers.
4.  **View Analysis**: Explore dedicated views for repository analysis (e.g., commit history, file structure insights) and meeting analysis (transcripts, key topics, identified action items).

## 📁 Project Structure


```
GitWhisper/
├── prisma/               # Database schema definition (schema.prisma) and migrations.
├── public/               # Static assets like images and fonts.
├── src/
│   ├── app/              # Next.js App Router directory. Contains pages, layouts, and API routes.
│   │   ├── (protected)/  # Group of routes requiring authentication.
│   │   └── api/          # Backend API routes (often used with tRPC).
│   ├── components/       # Reusable React UI components.
│   ├── lib/              # Utility functions, helper classes, and configuration files.
│   ├── server/           # Backend server-side code, including tRPC routers and context setup.
│   └── hooks/            # Custom React hooks for encapsulating component logic.
├── .env                  # Environment variables (local configuration).
├── .env.example          # Example environment variables file.
├── package.json          # Project dependencies and scripts.
└── tsconfig.json         # TypeScript configuration.
```

## 🙏 Acknowledgments

-   [Next.js](https://nextjs.org/) - The React framework for production
-   [tRPC](https://trpc.io/) - End-to-end typesafe APIs
-   [Prisma](https://www.prisma.io/) - Next-generation ORM
-   [Clerk](https://clerk.dev/) - Authentication made easy
-   [Cloudinary](https://cloudinary.com/) - Cloud-based media management
-   [Google AI](https://ai.google.dev/) - Powering AI features with Gemini
-   [AssemblyAI](https://www.assemblyai.com/) - Advanced Speech-to-Text API
-   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
-   [PostgreSQL](https://www.postgresql.org/) - The world's most advanced open source database
