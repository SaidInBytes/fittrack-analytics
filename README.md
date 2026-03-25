# 💪 FitTrack Analytics

A fitness tracking application built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS. Track workouts, nutrition, and body progress with detailed analytics.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Zustand
- **Backend:** Next.js API Routes, Mongoose, NextAuth.js
- **Database:** MongoDB (Atlas)
- **Charts:** Recharts
- **Icons:** Lucide React

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Login & Register pages
│   ├── api/                    # REST API endpoints
│   │   ├── auth/               # NextAuth + registration
│   │   ├── workouts/           # Workout CRUD
│   │   ├── nutrition/          # Nutrition CRUD
│   │   └── progress/           # Progress CRUD
│   └── dashboard/              # Dashboard pages
│       ├── workouts/
│       ├── nutrition/
│       ├── progress/
│       └── settings/
├── backend/                    # Server-side logic
│   ├── config/                 # DB connection & auth config
│   ├── middleware/              # Auth middleware
│   ├── models/                 # Mongoose models
│   ├── services/               # Business logic
│   └── validators/             # Input validation
├── components/                 # React components
│   ├── layout/                 # Sidebar, Header
│   └── ui/                     # Button, Card
├── lib/                        # Utilities (cn helper)
├── store/                      # Zustand state management
└── types/                      # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
git clone https://github.com/SaidInBytes/fittrack-analytics.git
cd fittrack-analytics
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fittrack?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | `/api/auth/register`  | Register new user    | No   |
| POST   | `/api/auth/[...nextauth]` | Login (NextAuth) | No   |
| GET    | `/api/workouts`       | List workouts        | Yes  |
| POST   | `/api/workouts`       | Create workout       | Yes  |
| GET    | `/api/nutrition`      | List nutrition logs  | Yes  |
| POST   | `/api/nutrition`      | Create nutrition log | Yes  |
| GET    | `/api/progress`       | List progress        | Yes  |
| POST   | `/api/progress`       | Create progress      | Yes  |

## License

MIT
