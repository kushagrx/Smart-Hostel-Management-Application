# 🏠 SmartStay - Smart Hostel Management Application

A comprehensive full-stack mobile application for managing hostel operations, built with React Native (Expo) and PostgreSQL. SmartStay streamlines hostel administration with features for student management, attendance tracking, facility management, and real-time communication.

## 📑 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [How It Works](#-how-it-works)
  - [Architecture Overview](#architecture-overview)
  - [Application Flow](#application-flow)
  - [Database Schema](#database-schema)
  - [API Structure](#api-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the Application](#running-the-application)
- [Google OAuth Configuration](#-google-oauth-configuration)
- [Database Management](#-database-management)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

###For Students
- 📱 **Dashboard** - Overview of hostel activities and personal information
- 📅 **Attendance** - View attendance records and history with calendar visualization
- 🎫 **Leave Requests** - Submit and track leave applications with approval workflow
- 🛠️ **Complaints** - Report and monitor facility issues with real-time status updates
- 💬 **Chat** - Direct one-on-one communication with hostel administrators
- 🔔 **Notifications** - Real-time updates for approvals, announcements, and alerts
- 📢 **Notice Board** - Access hostel notices and important announcements
- 👥 **Visitor Management** - Register and track visitor requests with QR codes
- 🧺 **Laundry Service** - Request and track laundry services
- 🍽️ **Mess Attendance** - Mark and view mess attendance

### For Administrators
- 👥 **Student Management** - Manage student profiles, records, and room assignments
- ✅ **Attendance Tracking** - Record and monitor daily attendance with calendar view
- 📋 **Leave Management** - Review and approve/reject leave requests with remarks
- 🔧 **Facility Management** - Track, prioritize, and resolve maintenance complaints
- 📊 **Analytics Dashboard** - View comprehensive hostel statistics and insights
- 💬 **Student Communication** - Chat with students individually with read receipts
- 📢 **Notice Board** - Create, edit, and manage hostel announcements
- 🚌 **Bus Timings** - Manage and update bus schedules
- 👁️ **Visitor Approval** - Review and approve/reject visitor requests with check-in logs
- 🧺 **Service Management** - Handle laundry and roomservice requests with status tracking
- 📈 **Real-time Insights** - Attendance trends, complaint resolution metrics, and service usage
- 🏪 **Student-Centric Management** - Redesigned admin hub for consolidated student operations
- 🍲 **Mess Analytics** - Daily 'Going vs Skipping' statistics for meal planning
- 🚌 **Bus Broadcaster** - Create/Update routes with instant push notifications to all students
- 💳 **Payment Verification** - Real-time processing via Razorpay with automated dues updating

## 🌟 Recent Major Enhancements (V2)

### 1. Advanced Adaptive Icon System
*   **Optimal Display**: Fully optimized for Android 8.0+ adaptive icons using foreground/background layers to prevent stretching or cropping.
*   **Brand Consistency**: Uses a high-resolution centered brand icon with appropriate safe-zone padding.

### 2. Intelligent Notification Architecture
*   **Auth-Driven Sync**: FCM tokens are automatically synchronized with the backend immediately upon login via a reactive `AuthContext` bridge.
*   **Role-Aware Deep Linking**: Tapping a notification intelligently navigates to the correct screen based on user role (e.g., a "complaint" notification opens the management view for admins and the history view for students).
*   **Contextual Messages**: Notifications now resolve student identities to show real names and room numbers directly in the push payload.

### 3. Redesigned Admin Hub
*   **Simplified Navigation**: Removed clutter from the side menu by grouping operational features (About Hostel, Room Service, Laundry) into a centralized "Student Management" dashboard.
*   **Improved UX**: Transitioned from fragmented menus to a coherent administrative hub for better productivity.

### 4. Authentication Resilience & Fallback
*   **Admin Access Fix**: Implemented a secondary authentication path that allows users with the `admin` role to log in via Google even if they don't have a record in the `students` profile table, preventing accidental `403 Forbidden` lockouts.
*   **Token Syncing**: Integrated a reactive token synchronization mechanism that ensures the backend always has the latest FCM token upon every successful login/session refresh.

### 5. Enhanced Communication
*   **Read Receipts**: Messaging system now tracks `is_read` status for both students and admins.
*   **Contextual Payloads**: Push notifications for complaints and leaves now resolve student names and room numbers in the message body for immediate context.

## 🚀 Technology Stack

### Frontend (Mobile App)
- **React Native** (0.81.5) - Cross-platform mobile development
- **Expo** (SDK 54) - Development platform, build tools, and native module access
- **TypeScript** (5.9.2) - Type-safe JavaScript for better code quality
- **Expo Router** (6.0) - File-based routing system
- **React Navigation** - Bottom tabs and stack navigation
- **React Native Reanimated** (4.1.1) - Smooth 60fps animations
- **Axios** (1.13.3) - HTTP client for API requests
- **FlashList** - High-performance list rendering
- **React Native Calendars** - Calendar components for attendance
- **Victory Native** - Data visualization and charts

### Backend (Server)
- **Node.js** (18+) - JavaScript runtime
- **Express.js** (4.18.2) - Web application framework
- **TypeScript** (4.9.5) - Type-safe server code
- **PostgreSQL** (14+) - Relational database with ACID compliance
- **JWT** (9.0.0) - Stateless authentication tokens
- **Bcrypt** (5.1.0) - Password hashing and encryption
- **Multer** (2.0.2) - File upload handling for photos
- **Node-cron** (3.0.3) - Scheduled tasks for backups and cleanup
- **Helmet** (6.0.1) - Security headers and middleware
- **CORS** (2.8.5) - Cross-origin resource sharing

### Authentication
- **Google OAuth 2.0** - Secure organization email sign-in
- **JWT Tokens** - Session management with refresh tokens
- **Role-Based Access** - Separate student and admin permissions

## 🔧 How It Works

### Architecture Overview

SmartStay follows a **client-server architecture** with a clear separation between frontend and backend:

```mermaid
graph TD
    subgraph Mobile_App ["Mobile Application (Expo/RN)"]
        UI[UI Layer: Screens & Components]
        CTX[Context Layer: Auth/Theme/Notifications]
        API_C[API Client: Axios Interceptors]
    end

    subgraph Backend_Server ["Backend Server (Node/Express)"]
        RT[Routes: Domain-specific endpoints]
        MD[Middleware: JWT/Role/Error Guards]
        CT[Controllers: Business Logic]
        SV[Services: Firebase Push & Auth Fallback]
    end

    DB[(PostgreSQL Database)]

    UI --> CTX
    CTX --> API_C
    API_C -- "HTTP/REST (JWT)" --> RT
    RT --> MD
    MD --> CT
    CT --> SV
    SV --> DB
```

### Application Flow

#### 1. **Authentication Flow**
```mermaid
sequenceDiagram
    participant U as User
    participant A as Mobile App
    participant B as Backend Server
    participant G as Google OAuth

    U->>A: Open App / Click Login
    A->>G: Request ID Token
    G-->>A: Return ID Token
    A->>B: POST /api/auth/google (Token)
    B->>G: Verify Token Integrity
    G-->>B: Identity Confirmed
    B->>B: Lookup/Create User & Sync FCM Token
    B-->>A: JWT Access Token + User Profile
    A->>A: Save to AsyncStorage
    A->>A: Navigate to Dashboard
```

#### 2. **Data Flow: Submitting a Facility Complaint**
```mermaid
graph LR
    S[Student] -->|1. Submit Complaint| A[App]
    A -->|2. POST /api/facilities| B[Backend]
    B -->|3. Verify JWT & Validate| C[Controller]
    C -->|4. Save| DB[(PostgreSQL)]
    C -->|5. Trigger| N[Notification Service]
    N -->|6. Push| AD[Admin Devices]
    B -->|7. Success Response| A
    A -->|8. Update UI| S
```

#### 3. **Messaging Flow (Real-time bridge)**
```mermaid
graph TD
    Start[Student Sends Message] --> API[POST /api/chats/message]
    API --> Auth[JWT & Integrity Check]
    Auth --> Save[Store in messages table]
    Save --> Logic[Update last_message_at]
    Logic --> Notify[Optional Push to Admin]
    Notify --> Poll[Admin List Refresh via Dynamic Polling]
    Poll --> End[Admin Sees New Message]
```

### Database Schema

The application uses **15+ interconnected PostgreSQL tables**:

#### Core Tables

**users**
- Stores authentication data for both students and admins
- Fields: `id`, `email`, `name`, `photo_url`, `role` (student/admin), `google_id`

**students**
- Extended student profile information
- Fields: `id`, `user_id` (FK), `roll_number`, `room_number`, `branch`, `year`, `contact`, `blood_group`, `parent_contact`, `dues`, `last_notifications_cleared_at`
- Relationships: One-to-one with `users`, one-to-many with `leave_requests`, `facilities`, `visitors`

**attendance**
- Daily attendance records
- Fields: `id`, `student_id` (FK), `date`, `status` (present/absent/leave), `marked_by`, `remarks`
- Indexes: `idx_attendance_student_date` for fast queries

**facilities**
- Maintenance complaints and issues
- Fields: `id`, `student_id` (FK), `type` (electrical/plumbing/furniture/other), `description`, `location`, `status`, `priority`, `photo`, `resolved_by`, `resolved_at`
- Workflow: pending → in-progress → resolved/rejected

**leave_requests**
- Student leave applications
- Fields: `id`, `student_id` (FK), `start_date`, `end_date`, `reason`, `status`, `admin_remarks`, `approved_by`, `approved_at`

**messages**
- One-on-one chat messages
- Fields: `id`, `sender_id`, `receiver_id`, `message`, `is_read`, `sent_at`
- Supports: Admin-to-student and student-to-admin communication with read receipts

**notifications**
- Real-time notifications for both students and admins
- Fields: `id`, `user_id`, `title`, `message`, `type`, `related_id`, `is_read`, `created_at`
- Types: leave_approved, complaint_resolved, new_notice, etc.

**notices**
- Hostel announcements and notices
- Fields: `id`, `title`, `content`, `created_by`, `created_at`, `updated_at`

**visitors**
- Visitor request and management system
- Fields: `id`, `student_id`, `visitor_name`, `visitor_phone`, `purpose`, `expected_date`, `status`, `qr_code`, `checked_in_at`, `checked_out_at`

**service_requests**
- Laundry and room service requests
- Fields: `id`, `student_id`, `service_type`, `description`, `status`, `scheduled_for`, `completed_at`

**mess_attendance**
- Mess attendance tracking
- Fields: `id`, `student_id`, `date`, `breakfast`, `lunch`, `dinner`

**rooms**
- Room information and capacity
- Fields: `id`, `room_number`, `capacity`, `occupied_count`, `floor`, `wing`

**bus_timings**
- Bus schedule management
- Fields: `id`, `route`, `departure_time`, `arrival_time`, `days`

**hostel_info**
- General hostel information and settings
- Fields: `id`, `key`, `value`

### API Structure

The backend exposes **RESTful APIs** organized by domain:

#### Authentication APIs (`/api/auth`)
- `POST /google` - Google OAuth sign-in
- `POST /verify-token` - Verify JWT token validity
- `POST /refresh` - Refresh access token

#### Student APIs (`/api/students`)
- `GET /` - Get all students (admin only)
- `GET /:id` - Get student profile
- `PUT /:id` - Update student profile
- `POST /:id/upload-photo` - Upload profile photo
- `GET /roll/:rollNumber` - Search by roll number

#### Attendance APIs (`/api/attendance`)
- `GET /student/:studentId` - Get student attendance history
- `POST /mark` - Mark attendance (admin only)
- `PUT /:id` - Update attendance record
- `GET /stats/:studentId` - Get attendance statistics

#### Service APIs (`/api/services`)
- `GET /leave-requests` - Get all leave requests
- `POST /leave-requests` - Submit leave request
- `PUT /leave-requests/:id` - Update leave request status
- `GET /laundry` - Get laundry requests
- `POST /laundry` - Submit laundry request
- `PUT /laundry/:id` - Update laundry status

#### Facility APIs (`/api/facilities`)
- `GET /complaints` - Get all complaints
- `POST /complaints` - Submit complaint
- `PUT /complaints/:id` - Update complaint status
- `GET /stats` - Get facility statistics

#### Chat APIs (`/api/chats`)
- `GET /:userId/messages` - Get conversation messages
- `POST /message` - Send new message
- `PUT /mark-read/:userId` - Mark messages as read
- `GET /conversations` - Get all conversations (admin only)

#### Notification APIs (`/api/notifications`)
- `GET /:userId` - Get user notifications
- `PUT /:id/read` - Mark notification as read
- `POST /` - Create notification (system/admin)

#### Notice APIs (`/api/notices`)
- `GET /` - Get all notices
- `POST /` - Create notice (admin only)
- `PUT /:id` - Update notice
- `DELETE /:id` - Delete notice

#### Visitor APIs (`/api/visitors`)
- `GET /student/:studentId` - Get student's visitor requests
- `POST /` - Submit visitor request
- `PUT /:id` - Update visitor status (admin)
- `GET /qr/:id` - Get visitor QR code

#### Analytics APIs (`/api/analytics`)
- `GET /dashboard` - Get admin dashboard statistics
- `GET /attendance-trend` - Get attendance trends
- `GET /complaint-stats` - Get complaint statistics
- `GET /service-usage` - Get service usage metrics

### Frontend Architecture

#### File-Based Routing (Expo Router)
```
app/
├── (student)/          # Student-only routes (protected)
│   └── dashboard.tsx
├── (tabs)/             # Main tab navigation
│   ├── index.tsx       # Dashboard
│   ├── attendance.tsx
│   ├── services.tsx
│   ├── chat.tsx
│   └── profile.tsx
├── admin/              # Admin-only routes (protected)
│   ├── dashboard.tsx
│   ├── students.tsx
│   ├── attendance.tsx
│   ├── complaints.tsx
│   ├── analytics.tsx
│   └── chat/[id].tsx   # Dynamic chat route
├── login.tsx
├── chat/[id].tsx       # Student chat route
└── _layout.tsx         # Root layout with auth check
```

#### State Management (React Context)
```typescript
// context/AuthContext.tsx
- Stores: user, token, role
- Methods: login(), logout(), refreshToken()
- Persists to AsyncStorage

// context/ThemeContext.tsx
- Stores: darkMode, colors
- Methods: toggleDarkMode()
- Persists to AsyncStorage
```

#### API Client Pattern
```typescript
// utils/api.ts
const API_URL = "http://10.0.2.2:5000"; // Android emulator

axios.interceptors.request.use((config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Utility functions for each domain
export const studentAPI = { ... }
export const attendanceAPI = { ... }
export const chatAPI = { ... }
```

### Security Features

1. **JWT Authentication**: Stateless token-based auth with expiry
2. **Role-Based Access Control (RBAC)**: Separate student/admin permissions
3. **Password Hashing**: Bcrypt with salt rounds
4. **SQL Injection Prevention**: Parameterized queries
5. **XSS Protection**: Helmet middleware and input sanitization
6. **CORS Configuration**: Restricted origins in production
7. **Rate Limiting**: Prevent brute force attacks
8. **File Upload Validation**: Type and size restrictions

---

## 📦 Getting Started

### Prerequisites

Before setting up the application, ensure you have:

**Required Software:**
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js
- **Android Studio** (for Android development) - [Download](https://developer.android.com/studio)
- **Git** - [Download](https://git-scm.com/)

**Optional Tools:**
- **pgAdmin** - GUI tool for PostgreSQL management
- **Postman** - API testing
- **VS Code** - Recommended code editor with TypeScript support

### Database Setup

#### Step 1: Install PostgreSQL

**Windows:**
1. Download PostgreSQL installer from [official website](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432` (recommended to keep this)
5. Add PostgreSQL to system PATH

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Step 2: Create Database

Open PostgreSQL command line (psql) or pgAdmin:

```sql
CREATE DATABASE smarthostel;
```

Verify:
```sql
\l  -- List all databases
```

#### Step 3: Verify Connection

Test your PostgreSQL installation:
```bash
psql -U postgres -d smarthostel
```

### Backend Setup

#### Step 1: Navigate to Backend Directory
```bash
cd backend
```

#### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- Express.js, TypeScript, PostgreSQL client
- JWT, Bcrypt for authentication
- Multer for file uploads
- CORS, Helmet for security

#### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smarthostel
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (generate with: openssl rand -base64 32)
JWT_SECRET=your_secret_key_minimum_32_characters_long

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads
```

**Important:**
- Replace `your_postgres_password_here` with your actual PostgreSQL password
- Generate a strong JWT secret: `openssl rand -base64 32`
- Google Client ID will be configured in the [Google OAuth section](#-google-oauth-configuration)

#### Step 4: Initialize Database Schema

The database schema is automatically created on first backend start:

```bash
npm run dev
```

You should see:
```
✅ Database schema verified
Server is running on http://0.0.0.0:5000
```

The backend automatically creates:
- All 15+ tables with proper relationships
- Indexes for performance optimization
- Default constraints and triggers

### Frontend Setup

#### Step 1: Navigate to Root Directory
```bash
cd ..  # Back to project root
```

#### Step 2: Install Dependencies
```bash
npm install
```

This installs:
- React Native, Expo SDK 54
- Navigation libraries
- UI component libraries
- Axios for API calls

#### Step 3: Configure Environment Variables

Create a `.env` file in the **root directory**:

```env
# Backend API Configuration
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**Important:**
- `10.0.2.2` is the special IP for Android emulator to access host machine's `localhost`
- For **physical Android device**: Replace with your computer's local IP (e.g., `http://192.168.1.100:5000`)
  - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- For **iOS simulator**: Use `http://localhost:5000`

### Running the Application

#### Option 1: Quick Start (Recommended)

Use the provided batch script that handles everything:

```bash
.\start-dev.bat
```

This automatically:
- ✅ Sets up ADB for Android
- ✅ Starts the backend server
- ✅ Starts the Expo development server
- ✅ Handles port conflicts

#### Option 2: Manual Start

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

Expected output:
```
✅ Database schema verified
Server is running on http://0.0.0.0:5000
```

**Terminal 2 - Frontend App:**
```bash
npm start
# or
npx expo start
```

Then:
- Press `a` to open Android emulator
- Press `i` to open iOS simulator (macOS only)
- Scan QR code with **Expo Go** app for physical device testing

#### Testing the Setup

1. **Test Backend Health:**
   ```bash
   curl http://localhost:5000/health
   ```
   Response:
   ```json
   {"status":"ok","database":"connected"}
   ```

2. **Open Mobile App**: Should show login screen with Google Sign-In button

3. **Sign In**: Use your organization Google account (@yourdomain.com)

## 🔐 Google OAuth Configuration

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: **SmartStay Hostel**
3. Enable **Google Sign-In API**

### Step 2: Create OAuth Credentials

#### Web Application Client ID

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Name: `SmartStay Web Client`
5. Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
6. **Copy the Client ID** → Use in both `.env` files

#### Android Client ID (Optional, for production)

1. Application type: **Android**
2. Package name: `com.shaswat.smartstay`
3. Get SHA-1 certificate fingerprint:
   ```bash
   cd android
   ./gradlew signingReport
   ```
4. Copy the SHA-1 hash
5. **Save the Client ID**

### Step 3: Update Environment Files

Add the **Web Client ID** to:

**backend/.env:**
```env
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
```

**.env (root):**
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
```

### Step 4: Test Google Sign-In

1. Restart backend and frontend
2. Open app and click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. Should redirect to dashboard

## 💾 Database Management

### Automated Backups

The backend includes database backup scripts:

**Create Backup:**
```bash
cd backend
npm run db:backup
```

Backups are stored in `backend/backups/` with timestamp:
```
backups/
└── backup_2026-02-09_143022.sql
```

**Schedule Automated Backups:**
```bash
npm run db:backup:schedule
```

Runs daily at 2 AM (configurable in `src/scripts/backup/scheduler.ts`)

### Restore Database

**List Available Backups:**
```bash
npm run db:restore:list
```

**Restore from Backup:**
```bash
npm run db:restore
```

Prompts you to select a backup file.

**Manual Restore:**
```bash
psql -U postgres -d smarthostel < backups/backup_2026-02-09_143022.sql
```

### Cleanup Old Backups

Remove backups older than 30 days:
```bash
npm run db:cleanup
```

### Manual Database Access

**Connect to Database:**
```bash
psql -U postgres -d smarthostel
```

**Common PostgreSQL Commands:**
```sql
\dt                          -- List all tables
\d table_name                -- Describe table structure
SELECT * FROM users LIMIT 10; -- Query users
\q                           -- Quit psql
```

**View Students:**
```sql
SELECT s.roll_number, u.name, s.room_number, s.branch
FROM students s
JOIN users u ON s.user_id = u.id
ORDER BY s.roll_number;
```

## 🛠️ Troubleshooting

### Backend Issues

#### ❌ Port 5000 Already in Use

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Or use a different port:**
```env
# backend/.env
PORT=5001
```

#### ❌ Database Connection Error

**Error:** `Connection refused` or `password authentication failed`

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   pg_isready
   
   # Check service status
   net start | findstr postgres
   ```

2. Check credentials in `backend/.env`
   - Ensure `DB_PASSWORD` matches your PostgreSQL password
   - Try connecting manually: `psql -U postgres -d smarthostel`

3. Verify database exists:
   ```sql
   CREATE DATABASE IF NOT EXISTS smarthostel;
   ```

#### ❌ TypeScript Compilation Errors

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### ❌ Tables Not Created

Check backend console on startup for SQL errors. Manually run table creation:

```bash
cd backend/src/scripts
ts-node createAllTables.ts
```

### Frontend Issues

#### ❌ Metro Bundler Cache Issues

```bash
npx expo start --clear
```

Or:
```bash
rm -rf .expo
npm start
```

#### ❌ Android Build Errors

```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules package-lock.json
npm install
npx expo run:android
```

#### ❌ Network Request Failed

**Error:** `Network Error` when making API calls

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Verify API URL in `.env`:**
   - **Android Emulator:** `http://10.0.2.2:5000`
   - **Physical Device:** `http://YOUR_COMPUTER_IP:5000`
     ```bash
     # Find your IP
     ipconfig  # Windows
     ifconfig  # Mac/Linux
     ```
   - **iOS Simulator:** `http://localhost:5000`

3. **Ensure both devices are on same network** (for physical devices)

4. **Check firewall settings** - Allow port 5000

#### ❌ Google Sign-In Not Working

**Error:** `Sign-in failed` or `Invalid client`

**Solutions:**

1. **Verify Client IDs match** in both `.env` files
2. **Check Google Cloud Console:**
   - Is the API enabled?
   - Are redirect URIs correct?
   - Is the OAuth consent screen configured?

3. **Package name matches:**
   - Should be `com.shaswat.smartstay` in `app.config.ts`

4. **Clear app data and retry:**
   ```bash
   adb shell pm clear com.shaswat.smartstay
   ```

#### ❌ "Something Went Wrong" on Android

**Cause:** Usually SHA-1 fingerprint mismatch

**Solution:**
```bash
cd android
./gradlew signingReport
```

Copy the SHA-1 and add it to Google Cloud Console OAuth credentials.

### Database Issues

#### ❌ Permission Denied Errors

Grant proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE smarthostel TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

#### ❌ Database Locked/In Use

Terminate active connections:
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'smarthostel' AND pid <> pg_backend_pid();
```

## 📐 Project Structure

```
smarthostel/
├── app/                          # Frontend pages (Expo Router)
│   ├── (student)/               # Student-protected routes
│   │   └── dashboard.tsx
│   ├── (tabs)/                  # Main tab navigation
│   │   ├── index.tsx            # Student dashboard
│   │   ├── attendance.tsx
│   │   ├── services.tsx
│   │   ├── chat.tsx
│   │   └── profile.tsx
│   ├── admin/                   # Admin-protected routes
│   │   ├── dashboard.tsx
│   │   ├── students.tsx
│   │   ├── attendance.tsx
│   │   ├── complaints.tsx
│   │   ├── leave-requests.tsx
│   │   ├── analytics.tsx
│   │   └── chat/[id].tsx        # Dynamic chat
│   ├── login.tsx                # Authentication
│   └── _layout.tsx              # Root layout
│
├── components/                   # Reusable UI components
│   ├── StudentCard.tsx
│   ├── AttendanceCalendar.tsx
│   ├── ComplaintCard.tsx
│   ├── ChatBubble.tsx
│   └── AdminSidebar.tsx
│
├── context/                      # React Context providers
│   ├── AuthContext.tsx          # Authentication state
│   └── ThemeContext.tsx         # Dark mode
│
├── utils/                        # Utility functions
│   ├── api.ts                   # Axios API client
│   ├── attendanceUtils.ts
│   ├── chatUtils.ts
│   ├── notificationUtils.ts
│   └── validation.ts
│
├── assets/                       # Static assets
│   ├── images/
│   └── fonts/
│
├── backend/                      # Backend server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts            # PostgreSQL connection pool
│   │   ├── controllers/         # Request handlers (16 files)
│   │   │   ├── authController.ts
│   │   │   ├── studentController.ts
│   │   │   ├── attendanceController.ts
│   │   │   ├── chatController.ts
│   │   │   ├── serviceController.ts
│   │   │   ├── facilityController.ts
│   │   │   ├── notificationController.ts
│   │   │   ├── analyticsController.ts
│   │   │   └── ...
│   │   ├── routes/              # API routes (15 files)
│   │   │   ├── authRoutes.ts
│   │   │   ├── studentRoutes.ts
│   │   │   ├── attendanceRoutes.ts
│   │   │   └── ...
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT verification
│   │   │   └── authorization.ts # Role checks
│   │   ├── scripts/
│   │   │   ├── backup/          # Database backup scripts
│   │   │   └── db/              # Schema creation scripts
│   │   └── index.ts             # Server entry point
│   ├── uploads/                 # User uploaded files
│   ├── backups/                 # Database backups
│   └── package.json
│
├── .env                          # Frontend environment variables
├── backend/.env                  # Backend environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Frontend dependencies
├── app.config.ts                 # Expo configuration
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit:
   ```bash
   git commit -m "Add: your feature description"
   ```
4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Test on both Android and iOS (if possible)
- Update documentation for new features
- Ensure no sensitive data (API keys, passwords) in commits

## 📄 License

This project is available for educational and personal use.

## 👨‍💻 Author

**Shaswat Rastogi**
- GitHub: [@ShaswatRastogi](https://github.com/ShaswatRastogi)
- Repository: [Smart-Hostel-Management-Application](https://github.com/ShaswatRastogi/Smart-Hostel-Management-Application)

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
- Database powered by [PostgreSQL](https://www.postgresql.org)
- Authentication via [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

---

**Built with ❤️ using React Native, Expo, and PostgreSQL**

*For issues or questions, please open an issue on [GitHub](https://github.com/ShaswatRastogi/Smart-Hostel-Management-Application/issues)*
