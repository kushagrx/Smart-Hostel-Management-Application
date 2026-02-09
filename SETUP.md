# SmartStay - Smart Hostel Management Application Setup Guide

This guide will help you set up and run the SmartStay application on your local machine. The application has been migrated from Firebase to PostgreSQL for improved performance, scalability, and data control.

## 📋 Table of Contents
- [Migration Overview](#-migration-overview)
- [Prerequisites](#-prerequisites)
- [Database Setup](#-database-setup)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [Running the Application](#-running-the-application)
- [Google OAuth Configuration](#-google-oauth-configuration)
- [Database Management](#-database-management)
- [Troubleshooting](#-troubleshooting)

## 🔄 Migration Overview

### What Changed
SmartStay has been fully migrated from Firebase to PostgreSQL. This migration includes:

- **Database**: Firestore → PostgreSQL
- **Authentication**: Firebase Auth → PostgreSQL with Google OAuth
- **File Storage**: Retained with PostgreSQL metadata tracking
- **Real-time Updates**: REST API endpoints for data operations

### Benefits
- **Better Performance**: Optimized queries and indexing
- **Full Data Control**: Complete ownership of your data
- **Advanced Querying**: Complex SQL queries for analytics
- **Cost Effective**: No Firebase pricing tiers
- **Relational Data**: Proper foreign keys and data integrity

## 📦 Prerequisites

Before setting up the application, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js
- **Android Studio** (for Android development) - [Download](https://developer.android.com/studio)
- **Git** - [Download](https://git-scm.com/)

### Optional Tools
- **pgAdmin** - GUI tool for PostgreSQL management
- **Postman** - API testing tool
- **VS Code** - Recommended code editor

## 🗄️ Database Setup

### Step 1: Install PostgreSQL

#### Windows
1. Download PostgreSQL installer from [official website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432` (recommended to keep this)

#### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

1. Open PostgreSQL command line (psql) or pgAdmin
2. Create a new database named `smarthostel`:

```sql
CREATE DATABASE smarthostel;
```

3. Verify the database was created:
```sql
\l
```

### Step 3: Configure Database Connection

The database schema will be created automatically when you run the backend for the first time.

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smarthostel
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_secret_key_here_min_32_chars_recommended

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

**Important Notes:**
- Replace `your_postgres_password` with your actual PostgreSQL password
- Replace `your_secret_key_here` with a strong random string (use `openssl rand -base64 32`)
- Google OAuth will be configured in the [Google OAuth Configuration](#-google-oauth-configuration) section

### Step 4: Initialize Database Schema

The database tables will be created automatically on first run, or you can manually run:

```bash
npm run dev
```

The server will automatically create all necessary tables on startup.

## 📱 Frontend Setup

### Step 1: Navigate to Root Directory
```bash
cd ..
# You should now be in the root directory (d:\smarthostel)
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API Configuration
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000

# Google OAuth Configuration  
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

**Important Notes:**
- `10.0.2.2` is the Android emulator's way to access `localhost`
- If testing on a physical device, replace with your computer's local IP (e.g., `http://192.168.1.100:5000`)
- Use `http://localhost:5000` for iOS simulator

## 🚀 Running the Application

### Quick Start (Using Workflows)

The project includes automated workflows that simplify the startup process:

#### Method 1: Using Batch Script (Windows)
```bash
.\start-dev.bat
```

This script automatically:
- Sets up ADB for Android
- Starts the backend server
- Starts the Expo frontend
- Handles port conflicts

#### Method 2: Manual Setup

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ Connected to PostgreSQL database
```

**Terminal 2 - Start Frontend:**
```bash
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

### Development Workflow Commands

**Backend Commands:**
```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Run production build
```

**Frontend Commands:**
```bash
npx expo start              # Start Expo development server
npx expo run:android        # Build and run on Android
npx expo run:ios            # Build and run on iOS (macOS only)
npm run android             # Alias for expo run:android
```

## 🔐 Google OAuth Configuration

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google Sign-In API

### Step 2: Create OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure for **Android** and **Web**

#### Web Application Client ID
- Application type: **Web application**
- Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
- Copy the **Client ID**

#### Android Client ID
- Application type: **Android**
- Package name: `com.anonymous.smartstay`
- Get SHA-1 certificate fingerprint:
  ```bash
  cd android
  ./gradlew signingReport
  ```
- Copy the **Client ID**

### Step 3: Update Environment Files

Add the **Web Client ID** to both `.env` files:
- `backend/.env` → `GOOGLE_CLIENT_ID`
- `.env` → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## 💾 Database Management

### Backup Database

The backend includes automated backup scripts:

```bash
cd backend
npm run db:backup
```

Backups are stored in `backend/backups/` with timestamps.

### Restore Database

```bash
npm run db:restore
```

### List Available Backups

```bash
npm run db:restore:list
```

### Cleanup Old Backups

```bash
npm run db:cleanup
```

### Manual Database Access

```bash
psql -U postgres -d smarthostel
```

Common SQL commands:
```sql
\dt                    -- List all tables
\d table_name          -- Describe table structure
SELECT * FROM users;   -- Query users
```

## 🛠️ Troubleshooting

### Backend Issues

#### Port 5000 Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

#### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `backend/.env`
- Ensure database `smarthostel` exists

#### TypeScript Errors
```bash
cd backend
npm install
npm run build
```

### Frontend Issues

#### Metro Bundler Port Conflict
```bash
npx expo start --clear
```

#### Android Build Errors
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

#### Network Request Failed
- Check backend is running (`http://localhost:5000`)
- Verify `EXPO_PUBLIC_API_URL` in `.env`
- For physical devices, use your computer's local IP instead of `10.0.2.2`

#### Google Sign-In Not Working
- Verify Google Client IDs in both `.env` files
- Check package name matches: `com.anonymous.smartstay`
- Ensure SHA-1 fingerprint is registered in Google Cloud Console

### Database Issues

#### Tables Not Created
- The backend automatically creates tables on first run
- Check backend console for SQL errors
- Manually inspect with: `psql -U postgres -d smarthostel`

#### Migration Errors
- All Firebase data has been migrated
- Firebase migration scripts have been removed
- If you need to re-migrate, restore from a backup

## 📝 Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **React Native**: https://reactnative.dev/
- **Express.js**: https://expressjs.com/

## 🤝 Support

For issues or questions:
1. Check this SETUP.md guide
2. Review error logs in backend console
3. Check PostgreSQL logs
4. Inspect network requests in React Native Debugger

---

**Happy Coding! 🎉**
