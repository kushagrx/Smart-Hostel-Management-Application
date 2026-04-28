# SmartHostel Changelog

This document summarizes the changes, additions, and security improvements made to the SmartHostel codebase since the last major commit.

## 🚀 New Features

### 1. AI Assistant Integration (`ai-service/`)
- Introduced a dedicated Python-based AI service using LangChain for handling chatbot queries.
- Created `backend/src/routes/aiRoutes.ts` to proxy requests between the mobile app and the Python AI service.
- Developed a new AI chat interface (`app/ai-chat.tsx`) and an integrated API utility (`utils/aiChat.ts`).
- The AI service now handles student queries, complaint status checks, and contextual requests.

### 2. Advanced Settings & Accessibility
- **Accessibility Engine:** Implemented global accessibility state management (`store/useAccessibilityStore.ts`), supporting high contrast, reduced motion, dynamic font sizing, and haptic feedback (`utils/haptics.ts`).
- **New Settings Architecture:** Completely redesigned the settings UI (`app/(tabs)/settings.tsx`) to look professional, adding modular sub-pages for Account, Privacy, Data & Storage, and About.
- **Linked Accounts:** Added UI for managing linked Google/Social accounts (`app/account/linked-accounts.tsx`).
- **Data Export:** Added a "Download Data" feature interface (`app/account/download-data.tsx`).

### 3. Security Enhancements (Two-Factor Auth)
- Added backend support for Two-Factor Authentication (`backend/src/controllers/twoFactorController.ts`, `backend/src/routes/twoFactorRoutes.ts`).
- Built dedicated frontend interfaces for setting up and verifying 2FA.

## 🛡️ Security & Privacy Fixes

- **GitIgnore Fortification:** Massively updated `.gitignore` to rigorously exclude all sensitive files.
- **Database Safety:** Removed `backend/src/database.db` from Git tracking to ensure the production/local SQLite database is never accidentally pushed.
- **Removed PII:** Stopped tracking user upload folders (`backend/uploads/`) and deleted the tracked user profiles.
- **Credential Cleanup:** Stopped tracking legacy service accounts (`firebase-service-account.json`) and removed push token logs.
- **Hardcoded Secret Removal:** Found and fixed a hardcoded Supabase database connection string in `backend/scripts/migrate_settings.js` to securely use `process.env.DATABASE_URL`.

## 🧹 Codebase Cleanup

- **Removed Temporary Scripts:** Cleaned out one-off testing scripts and dummy data files, including:
  - `backend/test_db.js`
  - `backend/migrate-notifs.ts`
  - `backend/src/scripts/testApiReorder.ts`
  - `backend/src/scripts/testReorder.ts`
  - `backend/src/scripts/run_temp_migration.ts`
  - `backend/users_push_tokens.json`
- **Refactoring:** Streamlined `app/edit-profile.tsx` and `app/login.tsx` for better performance and error handling.

## 📦 Dependency Updates
- Updated `package-lock.json` and `backend/package-lock.json` with newer, more secure dependencies.
- Added necessary Python dependencies in `ai-service/requirements.txt` for the LangChain agent implementation.
