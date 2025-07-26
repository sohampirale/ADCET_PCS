# ADCET Portfolio & Credits System (PCS)

A full-stack web application for students and mentors to create, manage, and showcase E-Portfolios and Handmade Portfolios, track event participation, and manage academic credits. Built with Next.js, Prisma, PostgreSQL, and modern authentication.

---

## 🚀 Features
- User authentication (email/password, Google OAuth)
- Role-based access: Student & Mentor
- E-Portfolio: Add, edit, and showcase digital work (links, titles, mentors, likes)
- Handmade Portfolio: Upload, organize, and display images of creative work (with mentor assignment, likes)
- Event management: Track events, coordinators, and credits
- Like system for portfolios and events
- Mentor assignment and tracking
- API-first design (RESTful endpoints)
- Responsive, modern UI (React, Tailwind CSS, Lucide icons)
- Secure, scalable backend (Prisma ORM, PostgreSQL)

## 🛠️ Tech Stack
- **Next.js** (App Router)
- **React 19**
- **Prisma ORM**
- **PostgreSQL**
- **NextAuth.js** (auth)
- **Tailwind CSS**
- **Zod** (validation)
- **Lucide React** (icons)
- **TypeScript**

## 🗂️ Database Models
- **User** (Student/Mentor, profile, role, mentor/mentee relationships)
- **EPortfolio** (title, link, owner, mentor, likes)
- **HandmadePortfolio** (title, images, owner, mentor, likes)
- **Event** (title, description, images, mentor, coordinators, credits, likes)
- **Like** (polymorphic: EPortfolio, HandmadePortfolio, Event)
- **EventCoordinator** (event, user, credit)

## 📦 API Endpoints
- `/api/auth` - Authentication (login, signup, session)
- `/api/user` - User management
- `/api/e-portfolio` - CRUD for E-Portfolios
- `/api/handmade-portfolio` - CRUD for Handmade Portfolios
- `/api/event` - Event management
- `/api/me` - Session check
- `/api/.../like` - Like/unlike portfolios/events

## 🏁 Getting Started

1. **Clone the repo and install dependencies:**
   ```bash
   git clone <repo-url>
   cd ADCET_PCS
   npm install
   ```
2. **Set up your `.env` file** with PostgreSQL and Google OAuth credentials.
3. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```
5. **Open** [http://localhost:3000](http://localhost:3000)

## 📁 Folder Structure
- `src/app` - Next.js app routes (API & pages)
- `src/components` - UI components (EPortfolio, HandmadePortfolio, Auth, etc.)
- `src/controllers` - API controllers
- `src/services` - Business logic/services
- `src/schemas` - Zod validation schemas
- `src/lib` - Utilities (prisma, error handling, etc.)
- `prisma/` - Prisma schema and migrations

## 🤝 Contributing
Pull requests and issues are welcome! Please open an issue to discuss your ideas.

## 📝 License
MIT
