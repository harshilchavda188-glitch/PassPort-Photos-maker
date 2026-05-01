# Project Analysis: AI Passport Photo Maker Pro

## Project Overview
This is a full-stack AI-powered passport photo maker application with:
- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS)
- **Backend**: Node.js/Express with TypeScript
- **AI Service**: Python FastAPI for background removal and image processing

---

## 1. Frontend Dependencies
**Location**: `frontend/package.json`
**Technology**: Next.js 14, React 18, TypeScript

### Core Dependencies:
- `next`: 14.1.0 - React framework
- `react`: ^18.2.0 - UI library
- `react-dom`: ^18.2.0 - React DOM

### Image Processing:
- `@imgly/background-removal`: ^1.7.0 - Browser-based background removal
- `face-api.js`: ^0.22.2 - Face detection
- `onnxruntime-web`: ^1.24.3 - ONNX runtime for ML

### UI/UX:
- `framer-motion`: ^11.0.3 - Animations
- `react-dropzone`: ^14.2.3 - File uploads
- `react-hot-toast`: ^2.4.1 - Toast notifications
- `react-icons`: ^5.0.1 - Icons
- `next-themes`: ^0.2.1 - Dark mode

### Utilities:
- `axios`: ^1.6.7 - HTTP client
- `html2canvas`: ^1.4.1 - Screenshot tool
- `jspdf`: ^2.5.2 - PDF generation
- `jszip`: ^3.10.1 - ZIP creation
- `zustand`: ^4.5.0 - State management

### Dev Dependencies:
- `typescript`: ^5.3.3
- `tailwindcss`: ^3.4.1
- `autoprefixer`: ^10.4.17
- `eslint`: ^8.56.0
- `eslint-config-next`: 14.1.0

---

## 2. Backend Dependencies
**Location**: `backend/package.json`
**Technology**: Node.js, Express, TypeScript, MongoDB

### Core Dependencies:
- `express`: ^4.18.2 - Web framework
- `typescript`: ^5.3.3 - TypeScript
- `mongoose`: ^8.1.1 - MongoDB ODM

### Image Processing:
- `sharp`: ^0.34.5 - Image processing
- `@napi-rs/canvas`: ^0.1.100 - Canvas operations

### Storage & API:
- `cloudinary`: ^2.0.0 - Cloud storage
- `multer`: ^1.4.5-lts.1 - File uploads
- `axios`: ^1.6.7 - HTTP client

### Security & Auth:
- `bcryptjs`: ^2.4.3 - Password hashing
- `jsonwebtoken`: ^9.0.2 - JWT auth
- `helmet`: ^7.1.0 - Security headers
- `cors`: ^2.8.5 - CORS
- `express-rate-limit`: ^7.1.5 - Rate limiting

### Utilities:
- `dotenv`: ^16.4.1 - Environment variables
- `joi`: ^17.12.0 - Validation
- `nodemailer`: ^6.9.8 - Email
- `jspdf`: ^2.5.1 - PDF generation
- `archiver`: ^6.0.1 - ZIP creation
- `morgan`: ^1.10.0 - Logging
- `compression`: ^1.7.4 - Compression

### Dev Dependencies:
- `nodemon`: ^3.0.3 - Auto-restart
- `ts-node`: ^10.9.2 - TS execution
- `eslint`: ^8.56.0
- `@types/*`: Various type definitions

---

## 3. AI Service Dependencies (Python)
**Location**: `backend/ai-service/requirements.txt`
**Technology**: Python FastAPI

### Core:
- `fastapi` - Web framework
- `uvicorn` - ASGI server

### AI/ML:
- `rembg` - Background removal
- `onnxruntime` - ONNX runtime

### Image Processing:
- `opencv-python` - Computer vision
- `numpy` - Numerical computing
- `Pillow` - Image processing

### Utilities:
- `python-multipart` - File uploads

---

## Project Structure

```
PassPort-Photos-Maker/
├── frontend/                 # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   └── lib/               # Utilities
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   └── ai-service/       # Python AI service
│       ├── services/    # AI services
│       └── utils/      # Helper functions
└── package.json          # Root utilities
```

---

## Installation Order

1. **Frontend**: `cd frontend && npm install`
2. **Backend**: `cd backend && npm install`
3. **AI Service**: `pip install -r requirements.txt`

---

## Required Environment Variables

### Frontend (.env):
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Backend (.env):
- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - JWT secret key
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `EMAIL_USER` - Email sender
- `EMAIL_PASS` - Email password
- And more...

---

## Scripts

### Frontend:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Backend:
- `npm run dev` - Start with nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Start compiled server

### AI Service:
- `python -m uvicorn app:app --reload` - Start service
