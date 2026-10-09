# Society Management — NestHub

A learning-focused society management app with multiple roles.

## Roles

- Resident
- Owner
- Committee
- Security
- Manager

## Modules

- Authentication
- Role-based dashboards/access
- Complaints
- Visitors
- Announcements
- Maintenance payments
- Properties
- Manager user/role management

## Stack

Frontend: React + Vite + Tailwind CSS + Zustand + Firebase Auth

Backend: Node.js + Express + MySQL + Firebase Admin SDK

## Setup

### 1. MySQL

Open MySQL Workbench and run:

```sql
SOURCE path/to/server/society_schema.sql;
```

Or paste the contents of `server/society_schema.sql`.

### 2. Server

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and set your MySQL password.

Download a Firebase Admin SDK private key from your existing Firebase project and save it as:

```text
server/society-firebase-admin.json
```

Never commit that file.

Then:

```bash
npm run dev
```

### 3. Client

```bash
cd client
npm install
npm run dev
```

The Firebase web configuration is already in `client/.env`.

### 4. First manager

New signups are always `resident`.

After creating your test account, promote it in MySQL:

```sql
USE society_management;

UPDATE society_users
SET role = 'manager'
WHERE email = 'your-email@example.com';
```

Then refresh/re-login.

## Important

All project-specific resources use the `society_` prefix. The app does not use the existing `busgo_*` or `chatter_*` Firestore collections.


## Simple role rules

The backend is the source of truth for permissions. Firebase proves who the user is, then `societyUserMiddleware.js` loads their MySQL profile and `roleMiddleware.js` checks whether their role is allowed for the route.

| Role | Main access |
|---|---|
| Resident | Own complaints, visitors, payments and property |
| Owner | Same as resident + owner property access |
| Committee | Complaints and announcements |
| Security | Visitor check-in/out and visitor records |
| Manager | User roles, properties, payments and management actions |

The frontend hides irrelevant navigation too, but that is only for usability. The Express middleware still enforces the real permission.

## Existing database repair

If you created `society_payments` before the current schema, make sure it contains `paid_at`:

```sql
ALTER TABLE society_payments
ADD COLUMN paid_at DATETIME NULL AFTER status;
```

Only run that statement if the column does not already exist. The current `server/society_schema.sql` already includes the column for fresh databases.
