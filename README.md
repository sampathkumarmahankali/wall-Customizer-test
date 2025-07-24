# MIALTAR - AI-Powered Wall Customizer

MIALTAR is a modern web application for designing and customizing image walls. It offers a seamless drag-and-drop experience, AI-powered image editing, advanced filtering, and robust user management, making it ideal for creating personalized wall art.

## Key Features

### Core User Features
- **Intuitive Wall Creator**: Set custom wall dimensions, backgrounds, and colors.
- **Drag-and-Drop Editor**: Easily upload, resize, and position images on the wall.
- **Advanced Image Editing**: Apply filters (brightness, contrast, etc.), shapes, frames, and borders.
- **AI-Powered Background Removal**: Automatically remove backgrounds from uploaded images.
- **Collage Creation**: Combine multiple images into a single collage element.
- **Secure Authentication**: User registration, login, email verification, and password reset.
- **Profile Management**: Update profile information and change passwords.
- **Export Options**: Export final designs as PNG, JPG, or PDF.

### Admin Dashboard
- **Comprehensive Analytics**: Track user registrations, active sessions, and revenue.
- **User Management**: View, search, and manage all registered users.
- **Subscription Plan Management**: Create, edit, and delete subscription plans (e.g., Premium, Ultra).
- **Content Moderation**: (Future-ready) A dedicated section for moderating user-generated content.
- **Revenue Tracking**: Monitor total revenue, monthly income, and subscription payments.

## Project Structure

```
wall-Customizer/
├── frontend/
│   ├── app/
│   │   ├── admin/              # Admin Dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   ├── payments/
│   │   │   ├── reports/
│   │   │   └── moderation/
│   │   ├── create/             # Wall creation page
│   │   ├── editor/             # Wall editor page
│   │   ├── login/
│   │   ├── register/
│   │   ├── profile/
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── auth/               # Auth-related components
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── shared/             # Header, Footer, etc.
│   │   ├── wall/               # Wall-specific components
│   │   └── ai/                 # AI-related components
│   └── lib/
│       ├── auth.ts
│       └── utils.ts
└── backend/
    ├── config/                 # Configuration files
    ├── middleware/             # Express middleware
    ├── routes/                 # API routes
    │   ├── auth.js
    │   ├── admin.js
    │   ├── plans.js
    │   ├── ai.js
    │   ├── session.js
    │   ├── email.js
    │   └── ...
    ├── services/               # Business logic services
    └── index.js                # Main server entry point
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MySQL
- An account with an AI service provider (for background removal)

### Backend Setup
1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file and configure your database and JWT secret:
    ```env
    PORT=4000
    JWT_SECRET=your_jwt_secret_key
    MYSQL_HOST=localhost
    MYSQL_USER=root
    MYSQL_PASSWORD=your_password
    MYSQL_DATABASE=your_database_name
    ```
4.  Set up the database schema by executing the SQL queries found in the `migrations` folder (if applicable).
5.  Start the server: `npm run dev` (uses nodemon)

### Frontend Setup
1.  Navigate to the `frontend` directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`
4.  The application will be available at `http://localhost:3000`.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register`: Register a new user.
- `POST /login`: Log in a user and get a JWT token.
- `POST /update-password`: Update the current user's password.
- `POST /verify-email`: Verify a user's email with a code.
- `GET /profile`: Get the authenticated user's profile.
- `POST /upload-profile-photo`: Upload a new profile photo (base64).
- `DELETE /remove-profile-photo`: Remove the current profile photo.

### Admin (`/api/admin`)
- `GET /dashboard`: Get statistics for the admin dashboard.
- `GET /analytics`: Get analytics data for user trends.
- `GET /users`: Get a list of all users.
- `GET /payments`: Get payment and revenue data.
- `POST /export/users`: Export user data to a CSV file.

### Plans (`/api/plans`)
- `GET /`: Get all subscription plans.
- `POST /`: Create a new subscription plan.
- `PUT /:id`: Update an existing plan.
- `DELETE /:id`: Delete a plan.

### AI Services (`/api/ai`)
- `POST /remove-background`: Remove the background from an image.
- `GET /status`: Check the availability of AI services.

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Base64 with Multer for AI services

## License

This project is licensed under the ISC License. 