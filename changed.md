# 🔄 Project Changelog: SmartStay V2

This document summarizes all major functional and technical changes implemented since the last repository state.

---

## 🔐 Authentication & Session Management
- **Admin Access Fix**: Resolved the `403 Forbidden` lockout. Admins can now successfully authenticate via Google even if they don't have an associated student profile.
-  **Session Resilience**: Updated `api.ts` interceptors to automatically clear local storage and reset the auth state upon encountering 401 (Unauthorized) or 403 (Forbidden) errors.
- **Backend Logging**: Enhanced `auth.ts` middleware with diagnostic traces to identify and prevent future permission drifts.

## 🔔 Intelligent Notification Architecture (V2)
- **Reactive Sync**: Implemented a bridge between `AuthContext` and `NotificationContext` to ensure the backend always has a fresh FCM push token mapped to the user immediately upon login.
- **Contextual Payloads**: Push notifications now resolve the student's **Full Name** and **Room Number** directly in the message body for better admin triage.
- **Deep Linking**: Added sophisticated role-aware routing—tapping a notification now navigates to the specific management screen instead of just the home dashboard.

## 🎨 UI/UX & Native Optimization
- **Android Adaptive Icons**: Fully reconfigured the app branding to support Android 8.0+ adaptive layers. Added high-resolution foreground and background assets to prevent icon cropping/stretching.
- **Admin Hub Redesign**: 
    - Moved **Hostel Management** from the primary sidebar into a consolidated **Student Management** dashboard.
    - Renamed to **"About Hostel"** for better semantic clarity.
    - Refactored the `AdminSidebar.tsx` for higher informational density and cleaner navigation.

## 🚀 New Functional Modules
- **💳 Real-time Payments**: Integrated **Razorpay** SDK for secure fee collection.
    - Automated background updating of student `dues` upon successful verification.
    - Instant push notification for payment confirmation.
- **🍲 Mess Analytics**: New daily tracking for "Going" vs "Skipping" students, allowing administrators to optimize meal preparation.
- **🚌 Bus Broadcaster**: Implemented a schedule management system. Creating or updating a bus route now triggers an automated push notification to all students.
- **💬 Enhanced Chat**: Added server-side support for **Read Receipts** (`is_read` status) to the 1-on-1 student-admin messaging system.

## 🧹 Maintenance & Documentation
- **Massive Cleanup**: Deleted redundant backend logs and temporary debug files (`.txt`, `.log`, `.ts` scripts used for manual data checks).
- **Documentation Revamp**: Overhauled `README.md` with:
    - High-fidelity **Mermaid Architecture** diagrams.
    - Updated Sequence Flows for Auth and Data submission.
    - Detailed setup guides for V2 features.
- **Security Audit**: Audited and confirmed that all sensitive files (`.env`, `google-services.json`, Firebase certificates) are correctly excluded via `.gitignore`.

---
**Status: Ready for Release**
