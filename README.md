# 🏠 SmartStay - Smart Hostel Management Application

A comprehensive mobile application for managing hostel operations, built with React Native and Expo. SmartStay streamlines hostel administration with features for student management, attendance tracking, facility management, and real-time communication.

## ✨ Features

### For Students
- 📱 **Dashboard** - Overview of hostel activities and personal information
- 📅 **Attendance** - View attendance records and history
- 🎫 **Leave Requests** - Submit and track leave applications
- 🛠️ **Complaints** - Report and monitor facility issues
- 💬 **Chat** - Direct communication with hostel administrators
- 🔔 **Notifications** - Real-time updates and announcements
- 📢 **Notice Board** - Access hostel notices and announcements

### For Administrators
- 👥 **Student Management** - Manage student profiles and records
- ✅ **Attendance Tracking** - Record and monitor student attendance with calendar view
- 📋 **Leave Management** - Review and approve/reject leave requests
- 🔧 **Facility Management** - Track and resolve maintenance complaints
- 📊 **Analytics** - View hostel statistics and insights
- 💬 **Student Communication** - Chat with students individually
- 📢 **Notice Board** - Create and manage hostel announcements

## 🚀 Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation and routing
- **Expo Router** - File-based routing
- **React Native Reanimated** - Smooth animations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe server code
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Multer** - File upload handling

### Authentication
- **Google OAuth 2.0** - Secure sign-in
- **JWT Tokens** - Session management

## 📦 Getting Started

For detailed setup instructions, including database configuration, environment variables, and Google OAuth setup, please refer to:

**📖 [SETUP.md](./SETUP.md)** - Complete setup guide

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShaswatRastogi/Smart-Hostel-Management-Application.git
   cd Smart-Hostel-Management-Application
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Configure environment**
   - Follow the [SETUP.md](./SETUP.md) guide to configure PostgreSQL and environment variables

4. **Start the application**
   ```bash
   .\start-dev.bat  # Windows
   # OR manually start backend and frontend in separate terminals
   ```

## 🗄️ Database

The application uses **PostgreSQL** as its primary database. The system has been migrated from Firebase to PostgreSQL for:
- Better performance and scalability
- Full data control and ownership
- Advanced querying capabilities
- Relational data integrity

See [SETUP.md](./SETUP.md) for database setup instructions.

## 📱 Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Android Studio (for Android development)
- Expo CLI

### Running Development Server

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
npx expo start
```

## 🏗️ Project Structure

```
smarthostel/
├── app/                    # Frontend pages (Expo Router)
├── components/             # Reusable UI components
├── context/               # React context providers
├── utils/                 # Utility functions and helpers
├── assets/                # Images, fonts, and static assets
├── backend/               # Backend server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   └── scripts/       # Database scripts
│   └── backups/           # Database backups
└── SETUP.md               # Setup guide
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is available for educational and personal use.

## 👨‍💻 Author

**Shaswat Rastogi**
- GitHub: [@ShaswatRastogi](https://github.com/ShaswatRastogi)

---

**Built with ❤️ using React Native and PostgreSQL**
