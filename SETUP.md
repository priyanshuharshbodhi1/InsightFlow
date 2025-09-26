# Zapfeed Setup Guide

This document provides detailed instructions for setting up and running the Zapfeed application locally.

## Table of Contents
- [System Requirements](#system-requirements)
- [Initial Setup](#initial-setup)
- [Database Configuration](#database-configuration)
- [API Keys Setup](#api-keys-setup)
- [Running the Application](#running-the-application)
- [Verification Steps](#verification-steps)
- [Common Issues](#common-issues)

## System Requirements

### Required Software
- **Node.js**: Version 14.x or later (recommended: 18.x+)
- **npm**: Version 6.x or later (comes with Node.js)
- **Git**: For cloning the repository

### Check Your System
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/ahmadnurfadilah/zapfeed.git
cd zapfeed
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Next.js framework
- Prisma ORM
- TailwindCSS
- OpenAI SDK
- And other dependencies

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env
```

## Database Configuration

### TiDB Serverless Setup

1. **Create Account**: Go to [TiDB Cloud](https://www.pingcap.com/ai)
2. **Create Cluster**: Create a new serverless cluster
3. **Get Connection String**: Copy the MySQL connection URL

**Example DATABASE_URL format:**
```
mysql://username:password@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/database_name?ssl={"rejectUnauthorized":true}
```

### Local Database Alternative (Optional)

If you prefer a local MySQL database:

1. **Install MySQL**: 
   ```bash
   # Ubuntu/Debian
   sudo apt install mysql-server
   
   # macOS (with Homebrew)
   brew install mysql
   ```

2. **Create Database:**
   ```sql
   CREATE DATABASE zapfeed;
   ```

3. **Update DATABASE_URL:**
   ```
   DATABASE_URL="mysql://root:password@localhost:3306/zapfeed"
   ```

## API Keys Setup

### OpenAI API Key

1. **Create Account**: Go to [OpenAI Platform](https://platform.openai.com/)
2. **Generate API Key**: Navigate to API Keys section
3. **Copy Key**: Add to your `.env` file

### Complete .env Configuration

```env
# Application URL (for local development)
NEXT_PUBLIC_BASE_URL="http://localhost:4500"

# NextAuth Secret (generate a random string)
AUTH_SECRET="your-super-secret-random-string-here"

# Database Connection
DATABASE_URL="mysql://username:password@host:port/database_name"

# OpenAI API Key
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

**Generate AUTH_SECRET:**
```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Running the Application

### 1. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### 2. Start Development Server
```bash
npm run dev
```

The application will start on [http://localhost:4500](http://localhost:4500)

### 3. Database Studio (Optional)
View and manage your database:
```bash
npx prisma studio
```

Access at [http://localhost:5555](http://localhost:5555)

## Verification Steps

### 1. Check Application Health
- Navigate to [http://localhost:4500](http://localhost:4500)
- Verify the homepage loads correctly
- Check for any console errors

### 2. Test Database Connection
- Try creating a user account
- Verify data is saved to database

### 3. Test AI Features
- Create a feedback form
- Submit test feedback
- Check if AI analysis works

## Common Issues

### Database Connection Issues

**Problem**: `Error: P1001: Can't reach database server`
**Solutions**:
- Verify DATABASE_URL is correct
- Check internet connection for TiDB Serverless
- Ensure database server is running (for local setup)

### Prisma Client Issues

**Problem**: `PrismaClientInitializationError`
**Solutions**:
```bash
# Regenerate Prisma client
npx prisma generate --force

# Reset and migrate
npx prisma migrate reset
npx prisma migrate dev
```

### Node Version Issues

**Problem**: Compatibility errors with Node.js
**Solutions**:
- Update to Node.js 18.x or later
- Use nvm to manage Node versions:
```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 18
nvm install 18
nvm use 18
```

### Port Already in Use

**Problem**: Port 4500 is already occupied
**Solutions**:
```bash
# Run on different port
npm run dev -- -p 4501

# Or kill process using port 4500
lsof -ti:4500 | xargs kill
```

### Memory Issues

**Problem**: Out of memory during build
**Solutions**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or add to package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

## Next Steps

After successful setup:
1. Read the main README.md for feature overview
2. Check `/app` directory for application structure
3. Review `/components` for UI components
4. Explore Prisma schema in `/prisma/schema.prisma`

## Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check Next.js and Prisma documentation
- **Community**: Join relevant Discord or Slack channels

---

**Happy coding! 🚀**
