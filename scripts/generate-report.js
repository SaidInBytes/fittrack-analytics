"use strict";

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = path.join(__dirname, "..", "fittrack-analytics-report.pdf");

// ── Colour palette ──────────────────────────────────────────────────────────
const COLORS = {
  primary: "#4F46E5",   // indigo
  heading: "#1E293B",   // slate-900
  subheading: "#334155", // slate-700
  body: "#475569",      // slate-600
  accent: "#6366F1",    // indigo-400
  light: "#F8FAFC",     // slate-50
  border: "#CBD5E1",    // slate-300
  white: "#FFFFFF",
};

// ── Content ─────────────────────────────────────────────────────────────────
const REPORT = {
  title: "FitTrack Analytics",
  subtitle: "Feature Overview & Personal Trainer Usability Report",
  date: new Date().toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),

  sections: [
    {
      heading: "1. Current Features",
      intro:
        "FitTrack Analytics is a modern fitness tracking application built " +
        "with Next.js 14, TypeScript, MongoDB, and Tailwind CSS. The following " +
        "features are already available in the application.",
      items: [
        {
          title: "Authentication with NextAuth",
          body:
            "Secure credentials-based login and user registration powered by " +
            "NextAuth.js. Passwords are hashed with bcryptjs, and session data " +
            "is stored server-side.",
        },
        {
          title: "Workout Logging",
          body:
            "Users can create strength and cardio workout entries. An exercise " +
            "autocomplete backed by the open wger API helps users quickly find " +
            "and select exercises.",
        },
        {
          title: "Nutrition Logging",
          body:
            "Meal logging with automatic calculation of total calories, protein, " +
            "carbohydrates, and fat. Supports food search for rapid entry.",
        },
        {
          title: "Progress Tracking & Dashboards",
          body:
            "Weight and body-measurement tracking over time with interactive " +
            "trend charts (Recharts). Dashboard overview cards summarise recent " +
            "workouts and progress at a glance.",
        },
        {
          title: "Settings & Dark Mode",
          body:
            "Profile details, unit preferences (metric/imperial), and dark-mode " +
            "preference are all persisted in MongoDB and applied across the app.",
        },
      ],
    },
    {
      heading: "2. Proposed New Features for Personal Trainer Usability",
      intro:
        "To make FitTrack Analytics a compelling tool for personal trainers " +
        "(PTs) and their clients, the following features are recommended for " +
        "the next development phase.",
      items: [
        {
          title: "Custom Workout Plans for Clients",
          body:
            "Allow PTs to build and assign structured, multi-week workout " +
            "programmes to individual clients. Plans should support drag-and-drop " +
            "day/week scheduling, exercise selection via the wger library, set/rep " +
            "targets, and version history so progress against a plan can be measured.",
        },
        {
          title: "Client Profile & Progress Summary",
          body:
            "A dedicated PT dashboard that lists all connected clients with key " +
            "metrics (latest weight, workouts completed this week, adherence rate). " +
            "Drill-down into any client profile to view their full workout, " +
            "nutrition, and body-measurement history. Generate printable or " +
            "shareable weekly/monthly progress reports.",
        },
        {
          title: "Direct Communication Between Trainers and Clients",
          body:
            "An in-app messaging system that lets PTs send feedback after each " +
            "logged session, answer client questions, and share motivational " +
            "content. Push notifications (web or email) keep both parties informed " +
            "without leaving the platform.",
        },
        {
          title: "Trainer & Client Roles",
          body:
            "Extend the authentication layer to support two distinct user roles: " +
            "Trainer and Client. PTs can invite clients by email, and each client " +
            "can belong to one or more trainers. Role-based access control ensures " +
            "clients only see their own data while trainers see all connected clients.",
        },
        {
          title: "Video & Exercise Library",
          body:
            "A curated library where PTs can upload instructional video clips or " +
            "link to external demonstrations. Videos can be attached directly to " +
            "exercises inside a training plan so clients always have the correct " +
            "technique reference.",
        },
        {
          title: "Gamification & Motivation",
          body:
            "Achievement badges, streak counters, and weekly challenge boards to " +
            "keep clients engaged. PTs can create custom challenges (e.g., '5 " +
            "sessions this week') with optional leaderboards among a client group.",
        },
      ],
    },
    {
      heading: "3. Tech Stack & Functionality Overview",
      intro:
        "The current architecture provides a solid foundation for all proposed " +
        "features. Below is a summary of each layer.",
      items: [
        {
          title: "Frontend – Next.js & Tailwind CSS",
          body:
            "Built on Next.js 14 (App Router) with React 18. Tailwind CSS handles " +
            "styling with a custom HSL-based design token system that supports " +
            "dark mode out of the box. Zustand manages client-side state, and " +
            "Recharts renders all data visualisations.",
        },
        {
          title: "Backend – MongoDB & NextAuth",
          body:
            "Next.js API Routes serve as the backend. Mongoose 8 models map to " +
            "MongoDB Atlas collections for Users, Workouts, Nutrition entries, and " +
            "Progress records. NextAuth handles session management and can be " +
            "extended to support OAuth providers or the new role system.",
        },
        {
          title: "REST API Endpoints for CRUD Operations",
          body:
            "POST /api/auth/register — new user registration.\n" +
            "POST /api/auth/[...nextauth] — NextAuth login.\n" +
            "GET / POST /api/workouts — list or create workout entries.\n" +
            "GET / POST /api/nutrition — list or create nutrition logs.\n" +
            "GET / POST /api/progress — list or create progress entries.\n" +
            "GET / PUT /api/user — fetch or update profile and preferences.\n" +
            "GET /api/exercises/search — exercise suggestions via wger API.",
        },
        {
          title: "Security & Compliance",
          body:
            "Passwords are never stored in plain text (bcryptjs). All data-mutating " +
            "API routes require a valid NextAuth session. For PT features handling " +
            "health data, GDPR compliance (EU) or HIPAA alignment (US) should be " +
            "evaluated before launch.",
        },
      ],
    },
    {
      heading: "4. Development Guidelines",
      intro:
        "Follow the steps below to set up a local development environment and " +
        "contribute to the project.",
      items: [
        {
          title: "Clone the Repository",
          body:
            "git clone https://github.com/SaidInBytes/fittrack-analytics.git\n" +
            "cd fittrack-analytics",
        },
        {
          title: "Install Dependencies",
          body: "npm install",
        },
        {
          title: "Configure Environment Variables",
          body:
            "Create a file named .env.local in the project root. " +
            "Replace every placeholder (shown in angle brackets) with your actual values:\n\n" +
            "MONGODB_URI=mongodb+srv://<your-user>:<your-password>@<your-cluster>.mongodb.net/fittrack\n" +
            "NEXTAUTH_SECRET=<your-random-secret>\n" +
            "NEXTAUTH_URL=http://localhost:3000\n" +
            "WGER_API_KEY=<your-wger-api-key>   # optional",
        },
        {
          title: "Start the Development Server",
          body:
            "npm run dev\n\n" +
            "Open http://localhost:3000 in your browser. " +
            "If you change .env.local while the server is running, " +
            "restart npm run dev to reload the environment.",
        },
        {
          title: "Lint Before Opening a Pull Request",
          body:
            "npm run lint\n\n" +
            "Fix any reported issues before pushing. All changes should target a " +
            "feature branch created from main.",
        },
      ],
    },
  ],
};

// ── PDF builder ──────────────────────────────────────────────────────────────
function buildPDF(doc) {
  const { width, margins } = doc.page;
  const usableWidth = width - margins.left - margins.right;

  // ── Cover page ──
  doc
    .rect(0, 0, width, 200)
    .fill(COLORS.primary);

  doc
    .fillColor(COLORS.white)
    .fontSize(28)
    .font("Helvetica-Bold")
    .text(REPORT.title, margins.left, 70, { width: usableWidth });

  doc
    .fontSize(14)
    .font("Helvetica")
    .text(REPORT.subtitle, margins.left, 110, { width: usableWidth });

  doc
    .fontSize(10)
    .fillColor("rgba(255,255,255,0.75)")
    .text(REPORT.date, margins.left, 155, { width: usableWidth });

  doc.moveDown(6);

  // ── Sections ──
  for (const section of REPORT.sections) {
    // Section heading bar
    const headingY = doc.y;
    doc
      .rect(margins.left - 12, headingY - 4, usableWidth + 12, 26)
      .fill(COLORS.primary);

    doc
      .fillColor(COLORS.white)
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(section.heading, margins.left, headingY + 3, { width: usableWidth });

    doc.moveDown(0.6);

    // Intro paragraph
    doc
      .fillColor(COLORS.body)
      .fontSize(10)
      .font("Helvetica")
      .text(section.intro, { width: usableWidth, lineGap: 3 });

    doc.moveDown(0.6);

    // Feature items
    for (const item of section.items) {
      // Check if we need a new page (leave at least 80 pt at bottom)
      if (doc.y > doc.page.height - doc.page.margins.bottom - 80) {
        doc.addPage();
      }

      // Bullet line
      doc
        .fillColor(COLORS.accent)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`\u25B6  ${item.title}`, { width: usableWidth });

      doc
        .fillColor(COLORS.body)
        .fontSize(10)
        .font("Helvetica")
        .text(item.body, { width: usableWidth, lineGap: 2 });

      doc.moveDown(0.6);
    }

    doc.moveDown(0.8);
  }

  // ── Footer on each page ──
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);

    const footerY = doc.page.height - doc.page.margins.bottom + 10;

    doc
      .moveTo(doc.page.margins.left, footerY - 4)
      .lineTo(doc.page.width - doc.page.margins.right, footerY - 4)
      .strokeColor(COLORS.border)
      .lineWidth(0.5)
      .stroke();

    doc
      .fillColor(COLORS.body)
      .fontSize(8)
      .font("Helvetica")
      .text(
        `FitTrack Analytics  —  ${REPORT.subtitle}`,
        doc.page.margins.left,
        footerY,
        { width: usableWidth / 2 }
      )
      .text(
        `Page ${i + 1} of ${totalPages}`,
        doc.page.margins.left + usableWidth / 2,
        footerY,
        { width: usableWidth / 2, align: "right" }
      );
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
function main() {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 60, bottom: 50, left: 60, right: 60 },
    bufferPages: true,
    info: {
      Title: `${REPORT.title} — ${REPORT.subtitle}`,
      Author: "FitTrack Analytics",
      Subject: "Personal Trainer Feature Report",
      CreationDate: new Date(),
    },
  });

  const stream = fs.createWriteStream(OUTPUT_FILE);
  doc.pipe(stream);

  buildPDF(doc);

  doc.end();

  stream.on("finish", () => {
    console.log(`PDF generated: ${OUTPUT_FILE}`);
  });

  stream.on("error", (err) => {
    console.error("Failed to write PDF:", err.message);
    process.exit(1);
  });
}

main();
