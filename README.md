# 💪 FitTrack Analytics

A fitness tracking application built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS. Track workouts, nutrition, and body progress with detailed analytics.

## Features

- Authentication with NextAuth credentials login
- Workout logging with strength and cardio-style entries
- Nutrition logging with automatic calorie and macro totals
- Progress tracking for weight and body measurements
- Settings page for profile details and app preferences
- Dark mode synced from saved user preferences
- Exercise autocomplete powered by the wger API
- Dashboard summaries and charts for workouts and progress

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
│   │   ├── exercises/          # Exercise search proxy (wger)
│   │   ├── user/               # User settings/profile API
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
│   ├── middleware/             # Auth middleware
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
WGER_API_KEY=your-wger-api-key
```

`WGER_API_KEY` is optional, but recommended if you want exercise autocomplete suggestions from the wger API in the workouts page.

If you add or change values in `.env.local` while the dev server is already running, restart `npm run dev` so Next.js reloads the environment.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Current App Areas

- **Dashboard:** Overview cards plus workout and weight trend charts
- **Workouts:** Create and review workouts, with wger-backed exercise suggestions for strength entries
- **Nutrition:** Log meals and automatically calculate total calories, protein, carbs, and fat
- **Progress:** Track weight and measurements over time with a trend chart
- **Settings:** Update profile data, unit preference, and dark mode preference

## Screenshots

Add screenshots or short GIFs here once the UI is finalized.

- Dashboard overview
- Workout creation flow
- Nutrition logging flow
- Progress trend chart
- Settings with dark mode enabled

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/[...nextauth]` | Login with NextAuth credentials | No |
| GET | `/api/workouts` | List workouts for the current user | Yes |
| POST | `/api/workouts` | Create a workout entry | Yes |
| GET | `/api/nutrition` | List nutrition logs for the current user | Yes |
| POST | `/api/nutrition` | Create a nutrition log with computed totals | Yes |
| GET | `/api/progress` | List progress entries for the current user | Yes |
| POST | `/api/progress` | Create a progress entry | Yes |
| GET | `/api/user` | Fetch profile and settings data | Yes |
| PUT | `/api/user` | Update profile and preferences | Yes |
| GET | `/api/exercises/search?query=...` | Search exercise suggestions via wger | Yes |

## Notes

- The exercise search integration uses the public wger API and optionally authenticates with `WGER_API_KEY`.
- The app stores user preferences, including dark mode and units, in MongoDB.
- `npm run lint` is configured for this project through Next.js ESLint.

## Deployment

This app can be deployed to platforms that support Next.js 14 applications, such as Vercel.

### Required environment variables

Set these in your deployment provider:

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `WGER_API_KEY` (optional)

### Production notes

- Use a production MongoDB database, not a local development instance.
- Set `NEXTAUTH_URL` to your deployed app URL.
- Generate a strong `NEXTAUTH_SECRET` for production.
- Restart or redeploy the app after changing environment variables.

## Development Workflow

### Typical local workflow

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Create `.env.local` from the documented environment variables.
4. Start the dev server with `npm run dev`.
5. Run lint checks with `npm run lint` before opening a pull request.

### Branching

- Create a feature branch from `main`.
- Keep changes scoped to one feature or bugfix when possible.
- Update the README when API surface or setup steps change.

### Pull requests

- Summarize the feature or fix clearly.
- Mention any new environment variables.
- Include screenshots or GIFs for UI changes when relevant.
- Confirm local lint checks pass before requesting review.

## License

MIT
