# IEPSL Members Management System

A comprehensive web-based membership management system for the Institute of Environmental Professionals Sri Lanka (IEPSL).

## 🌟 Features

### Member Portal
- **Multi-step Registration** (8 steps)
  - Personal Details
  - Office Information
  - Work Experience
  - Educational Qualifications
  - Professional Certifications
  - References
  - Document Upload
  - Declaration & Submission
- **Member Dashboard** with status tracking
- **Profile Management**
- **Digital Membership Card**
- **Registration Progress Tracking**

### Admin Portal
- **Dashboard** with real-time statistics
- **Pending Applications** review and approval
- **Member Directory** with search and filters
- **Analytics & Charts** (Pie, Line, Bar charts)
- **Approval/Rejection Workflow**
- **Email Notifications**

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads
- Nodemailer for emails

### Frontend
- React 19 + Vite
- React Router DOM
- Tailwind CSS
- Recharts for data visualization
- Axios for API calls
- React Hook Form + Zod validation

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Backend Setup
```bash
cd config
npm install
```

Create `.env` file in `config` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

Start backend server:
```bash
npm start
```

### Frontend Setup
```bash
cd public
npm install --legacy-peer-deps
```

Create `.env` file in `public` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=IEPSL Members Portal
```

Start frontend server:
```bash
npm run dev
```

## 🚀 Usage

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

### Default Admin Credentials
```
Email: admin@iepsl.lk
Password: admin123
```

### Create Admin User
```bash
cd config
node scripts/createAdmin.js
```

## 📁 Project Structure

```
IEPSLproject/
├── config/                 # Backend
│   ├── controllers/       # API controllers
│   ├── middleware/        # Auth, upload, validation
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   ├── utils/            # Helper functions
│   ├── app.js            # Express app
│   ├── server.js         # Server entry
│   └── db.js             # Database connection
│
└── public/                # Frontend
    ├── src/
    │   ├── api/          # API functions
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── utils/        # Utilities
    │   ├── App.jsx       # Main app
    │   └── main.jsx      # Entry point
    ├── index.html
    └── vite.config.js
```

## 🎨 Design System

### Colors
- **Primary**: Teal (#14b8a6)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

### Typography
- **Font**: Inter (Google Fonts)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Member registration (Step 1)
- `POST /api/auth/login` - Login (member/admin)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Registration
- `POST /api/registration/step2-8` - Save registration steps
- `POST /api/registration/upload` - Upload documents
- `GET /api/registration/progress` - Get progress

### Admin
- `GET /api/admin/pending-registrations` - Get pending applications
- `GET /api/admin/members` - Get all members
- `GET /api/admin/member/:id` - Get member details
- `PUT /api/admin/member/:id/approve` - Approve member
- `PUT /api/admin/member/:id/reject` - Reject member
- `GET /api/admin/statistics` - Get statistics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- Helmet.js security headers
- CORS protection
- Input validation
- File upload restrictions

## 📧 Email Notifications

- Welcome email on registration
- Approval notification
- Rejection notification
- Payment confirmation

## 🎯 Key Features

- ✅ Responsive design (mobile-friendly)
- ✅ Real-time form validation
- ✅ Progress tracking
- ✅ File upload with preview
- ✅ Search and filter
- ✅ Data visualization with charts
- ✅ Professional UI/UX
- ✅ Email notifications
- ✅ Secure authentication

## 👥 Contributors

- Developer: [Your Name]
- Organization: IEPSL

## 📄 License

This project is proprietary software for IEPSL.

## 🆘 Support

For support, email support@iepsl.lk

## Legacy Payment History

Spreadsheet payment columns are preserved under `member.legacyImport.paymentHistory` and are shown in the admin member-details view. They are intentionally excluded from totals, renewal status, and verified payment reports because the source cells do not consistently provide a normalized payment year, amount, method, and verification evidence.

For migration, an administrator should validate each legacy entry against receipts or bank records, then create a normalized `Payment` record with `source: "legacy"`, the confirmed year and amount, and `paymentStatus: "completed"`. Keep the original `legacyImport.paymentHistory` value for audit traceability.

---

**Built with ❤️ for IEPSL**
