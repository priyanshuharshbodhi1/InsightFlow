# Zapfeed

[Zapfeed](https://zapfeed.xyz) is a SaaS application designed for business owners to effortlessly collect, analyze, and act on customer feedback using the power of AI. With Zapfeed, you can gain valuable insights into customer sentiments, streamline your feedback processes, and enhance customer satisfaction.

## Features

- **Intuitive Dashboard**: Visualize your feedback data with metrics like total feedback, sentiment analysis, and trends.
- **AI-Powered Summaries**: Get instant summaries of feedback and actionable insights.
- **Dual AI Provider Support**: Automatically falls back from OpenAI to Gemini for cost-effective AI processing.
- **Customizable Widgets**: Easily integrate feedback collection into your website with customizable widgets.
- **Effortless Integration**: Embed Zapfeed with a single line of code, direct links, or QR codes.
- **AI Chat**: Interact with an AI chatbot to analyze feedback data and get insights.

## Technologies Used

- **Frontend**: Next.js
- **Backend**: [TiDB Serverless with Vector Search](https://www.pingcap.com/ai), OpenAI, Google Gemini
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** (version 14.x or later) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- A **TiDB Serverless** account with Vector Search - [Sign up here](https://www.pingcap.com/ai)
- **AI API Key** (choose one):
  - **OpenAI API key** - [Get one here](https://platform.openai.com/api-keys) (Primary)
  - **Gemini API key** - [Get one here](https://ai.google.dev/) (Fallback, generous free tier)

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahmadnurfadilah/zapfeed.git
   cd zapfeed
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   
   Edit the `.env` file with your credentials:
   ```env
   NEXT_PUBLIC_BASE_URL="http://localhost:4500"
   AUTH_SECRET=your_random_secret_key_here
   DATABASE_URL=mysql://username:password@host:port/database_name
   OPENAI_API_KEY=sk-your_openai_api_key_here
   ```

4. **Database setup:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser** and navigate to [http://localhost:4500](http://localhost:4500)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint for code quality checks

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (⚠️ This will delete all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

### Environment Variables Explained

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_BASE_URL` | Base URL of your application | ✅ |
| `AUTH_SECRET` | Secret key for NextAuth.js (generate a random string) | ✅ |
| `DATABASE_URL` | TiDB Serverless connection string | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ✅ |

### Troubleshooting

**Common Issues:**

1. **Database connection errors:**
   - Ensure your TiDB Serverless database is running
   - Check if the DATABASE_URL is correct
   - Verify network connectivity

2. **Prisma generate errors:**
   ```bash
   # Clear Prisma cache and regenerate
   npx prisma generate --force
   ```

3. **Module not found errors:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Port already in use:**
   ```bash
   # Run on a different port
   npm run dev -- -p 3001
   ```

### Development Workflow

1. **Make changes** to your code
2. **Test locally** with `npm run dev`
3. **Run linting** with `npm run lint`
4. **Build for production** with `npm run build`
5. **Test production build** with `npm start`

### Production Deployment

This project is optimized for deployment on **Vercel**:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on each push

For other platforms, build the project with `npm run build` and deploy the `.next` folder.
