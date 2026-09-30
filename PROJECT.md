# College Management App

A role-based mobile app for students and teachers, built with React Native (Expo Router), Node.js/Express, and MySQL (TiDB Cloud).

## Features

**Student**
- View profile, syllabus, timetable, and fee status
- View attendance with an overall percentage and a per-subject breakdown
- View notices posted by teachers

**Teacher**
- Mark attendance in bulk for a subject and date
- Edit timetable slots
- View and search the student list
- Post notices

**Cross-cutting**
- JWT-based authentication with role-based access control
- Pull-to-refresh on every data screen
- Loading, error, and empty states throughout

## Tech Stack

- **Frontend:** React Native, Expo Router, TypeScript, NativeWind (Tailwind for React Native)
- **Backend:** Node.js, Express
- **Database:** MySQL, hosted on TiDB Cloud (Starter tier)
- **Deployment:** Backend on Render, database on TiDB Cloud
- **Auth:** JWT + bcrypt

## Project Structure

```
backend/
├── config/db.js
├── controllers/
├── middleware/
├── routes/
└── server.js

app/ (frontend, Expo Router)
├── src/
│   ├── api/axiosInstance.ts
│   ├── context/AuthContext.tsx
│   ├── hooks/useApi.ts
│   ├── types/api.ts
│   ├── components/common/
│   └── app/
│       ├── login.tsx
│       ├── signup.tsx
│       ├── student/
│       └── teacher/
```

## Setup

### Backend
1. `cd backend && npm install`
2. Create a `.env` file:
   ```
   DB_HOST=...
   DB_USERNAME=...
   DB_PASSWORD=...
   DB_PORT=4000
   DB_DATABASE=...
   JWT_SECRET=...
   ```
3. Run the schema (exported from the DBML in `college-schema-corrected.dbml`) against your TiDB/MySQL database.
4. `npm start`

### Frontend
1. `cd app && npm install`
2. Create a `.env` file:
   ```
   EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
3. `npx expo start --tunnel` (or drop `--tunnel` if your phone and computer share a network)

## Schema Decisions

- `users` holds login credentials (`email`, `password`, `role`); `students` and `teachers` each link back to it via `user_id`, keeping authentication separate from profile data.
- `attendance` stores one row per student, per subject, per day, rather than running totals — this lets the app calculate accurate percentages on demand and lets a teacher correct a mistake by re-marking a day rather than needing to manually adjust a counter. A unique key on `(student_id, subject, date)` makes re-submission an update, not a duplicate.
- Every table that belongs to a student or teacher does so through a foreign key (`student_id`, `teacher_id`), so no data floats without an owner.

## Known Limitations / Future Scope

- No admin role — syllabus, fees, and timetable rows are seeded directly via SQL rather than through an admin UI.
- No assignment upload / file storage.
- No push notifications or real-time updates (notices require a manual refresh or pull-to-refresh).
- No model/repository layer — SQL queries live directly in controllers, which was a deliberate scope cut for the timeline. A larger version of this app would extract these into a dedicated data layer.
- Timetable creation (not just editing) isn't exposed to teachers yet.

## Author Notes

Built end-to-end (schema → backend → mobile app) as a timed portfolio project.