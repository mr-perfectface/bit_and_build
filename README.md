# Jumblrr

**Making reading accessible for dyslexic students — built for Bit N Build Hackathon 2026**

Track 1: **Access** — Disability, Accessibility & Inclusion

## Problem Statement

Dyslexia affects an estimated 6–12% of Indian schoolchildren, yet mainstream classrooms and learning materials rarely accommodate their needs. Standard textbooks use dense, unspaced text that is genuinely harder for dyslexic students to decode, and teachers have no simple way to see which students are struggling with which topics — leaving both students and teachers without the tools to identify and address reading difficulties early.

## Our Solution

Jumblrr is a role-based learning platform where teachers create subject-organized lessons, and students read them through a fully adaptive interface — adjustable font, spacing, and background tint, dyslexia-friendly fonts, text-to-speech, inline highlighting of commonly confused word pairs, and a guided reading practice mode that listens to a student read aloud and highlights words that may need more practice.

## Key Features

- **Role-based access** — separate teacher and student experiences, enforced at the database level via Row Level Security
- **Adaptive reading settings** — font family, size, letter/word spacing, line height, background tint, and word chunking, saved per student
- **Text-to-speech** — browser-native read-aloud for any lesson
- **Confusable word highlighting** — commonly mixed-up word pairs are color-coded inline in lesson text
- **Difficult word lookup** — automatic detection and plain-language definitions for challenging vocabulary in lesson content, powered by a Supabase Edge Function using the Gemini API
- **Read & Check practice mode** — students read a passage aloud; speech recognition compares it against the original text, shows a reading-match score, and surfaces specific words to practice further
- **Word Chunking** — long, difficult words are broken down for easier reading.
- **Teacher dashboard** — subject and lesson management, and a student roster

## Tech Stack

- **Frontend**: React (Vite), React Router
- **Backend / Database**: Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions)
- **API Integration**: Gemini (difficult word detection & definitions)
- **Speech**: Web Speech API (text-to-speech and speech recognition)
- **Deployment**: Vercel
- **Styling**: Custom CSS (no framework), Google Fonts

## System Architecture

- `profiles` — user accounts (student/teacher role), linked to Supabase Auth
- `subjects` — subjects created by teachers
- `lesson` — lesson content, linked to a subject
- `preferences` — per-student adaptive reading settings
- `lesson_word_help` — API generated difficult words and thier meaning
- `confusing_words` — List of common words that are usually interchanged

All tables are protected with Row Level Security: students can only read/write their own data, and teachers can view all student profiles.

## Setup & Running Locally

1. Clone the repository:
```bash
git clone https://github.com/mr-perfectface/bit_and_build.git
cd bit_and_build
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root with your Supabase credentials:
    VITE_SUPABASE_URL=your-supabase-project-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key


4. Run the development server:
```bash
npm run dev
```
The app will be available at the local host link shown in your terminal.

## Live Deployment

**[https://bit-and-build-three.vercel.app/]**

## Team

- Shreeya Dessai — Database schema & backend integration
- Piyush Kumar — Authentication & API integration
- Afzal Nadaf — Frontend development
- Shravni Pandit — UI/UX design

## Future Scope

- Letter-level confusable pair highlighting (b/d, p/q)
- Teacher-initiated student account creation
- Per-student progress tracking across lessons
- Analytics dashboard for reading progress trends over time
- Exam focus mode
