---
description: How to set up and connect to the PostgreSQL database for Smart Hostel
---

# Smart Hostel Project Setup

Follow these steps to set up the Smart Hostel application on a new machine.

## Prerequisites
- **Node.js**: v18+ installed
- **Expo CLI**: Installed globally (`npm install -g expo-cli`)
- **PostgreSQL**: Installed and running on your system

## 1. Database Setup (PostgreSQL)

### A. Create Database
Open your PostgreSQL terminal (psql) or use a GUI like pgAdmin and create a new database:
```sql
CREATE DATABASE smarthostel;
```

### B. Initialize Schema
Run the provided schema file to create all necessary tables:
```bash
# From the root directory
psql -U your_postgres_user -d smarthostel -f backend/src/db/schema.sql
```
*(Alternatively, copy-paste the contents of `backend/src/db/schema.sql` into your SQL editor.)*

## 2. Backend Configuration

### A. Environment Variables
Create a `.env` file in the `backend` directory:
```bash
PORT=5000
DB_USER=your_username
DB_HOST=localhost
DB_NAME=smarthostel
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
# For Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_client_id
ANDROID_CLIENT_ID=your_android_client_id
```

### B. Install Dependencies & Run
```bash
cd backend
npm install
npm run dev
```

## 3. Mobile App (Frontend) Configuration

### A. API Endpoints
Ensure `utils/api.ts` is configured with your machine's local IP address if testing on a physical device:
```typescript
const BASE_URL = 'http://192.168.x.x:5000/api'; // Replace with your IP
```

### B. Install Dependencies & Run
```bash
cd ..
npm install
npx expo start
```

## Troubleshooting
- **Database Connection**: Ensure the credentials in `backend/.env` match your local PostgreSQL setup.
- **Network**: If using a physical Android/iOS device, both the PC and the phone must be on the **same Wi-Fi network**.
- **Admin Access**: To access admin features, manually set the `role` to `'admin'` for your user in the `users` table after signing up.
