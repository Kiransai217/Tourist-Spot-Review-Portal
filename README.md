# SpotScout — Tourist Spot Review Portal

SpotScout is a full-stack web application where travellers can discover tourist destinations, read community ratings, add places, and write reviews.

## Features

- User registration and login with hashed passwords (`bcryptjs`)
- Session-based authentication
- Browse all destinations
- Search by destination name, city, state, or description
- Filter by category and sort by newest, rating, or name
- Add a tourist destination with location, category, description, best time, entry fee, and optional image URL
- View destination details and community reviews
- Give one review per account for each destination; delete your own review
- Delete a destination you added
- Responsive UI for desktop and mobile
- MongoDB Atlas database and Render deployment support

## Tech stack

- Node.js and Express.js
- EJS templates, HTML, CSS, JavaScript
- MongoDB Atlas with Mongoose
- Express Session + connect-mongo
- bcryptjs for password hashing
- express-validator for server-side validation
- method-override for HTML form delete requests

## Run locally

### Requirements

- Node.js 18 or newer
- A MongoDB Atlas cluster (or a local MongoDB instance)

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Copy `.env.example` to a new file named `.env` and update the values:

```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=use-a-long-random-secret
PORT=3000
```

In MongoDB Atlas, create a database user and allow your development IP address under **Network Access**. Use the database name `tourist_spot_portal` in your connection string if you want to follow the example.

### 3. Start the server

```bash
npm start
```

Open <http://localhost:3000>.

### 4. Try the app

1. Choose **Join free** and create an account.
2. Open **Add a place** to publish a tourist destination.
3. Browse or search destinations.
4. Open a destination and submit a rating and review while logged in.

The database starts empty; add a few places through the UI to demonstrate the full workflow.

## Deploy to GitHub

1. Create a **public** repository on GitHub named `Tourist-Spot-Review-Portal` (do not initialize it with a README if you are uploading this existing project).
2. Extract this ZIP file and open the extracted project folder in VS Code.
3. Confirm `.env` is not in the project upload. The `.gitignore` already excludes `.env` and `node_modules/`.
4. Open a terminal in the project folder and run:

```bash
git init
git add .
git commit -m "Build Tourist Spot Review Portal"
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/Tourist-Spot-Review-Portal.git
git push -u origin main
```

Replace `YOUR-GITHUB-USERNAME` with your GitHub username. If Git says a remote already exists, use `git remote set-url origin https://github.com/YOUR-GITHUB-USERNAME/Tourist-Spot-Review-Portal.git` instead of adding it again.

## Deploy on Render

### 1. Prepare MongoDB Atlas

- In Atlas, create or select a database user.
- In **Network Access**, allow the Render service to connect. For a quick student demo, a temporary `0.0.0.0/0` entry permits connections from any IP and is less secure; use it only if necessary, use a strong database password, and restrict/remove it after the demo where practical.
- Copy the application connection string. Do not commit it to GitHub or share it publicly.

### 2. Create the Render web service

1. Sign in to [Render](https://render.com/).
2. Click **New → Web Service**.
3. Connect your GitHub repository `Tourist-Spot-Review-Portal`.
4. Use these settings:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Branch:** `main`
5. Under **Environment Variables**, add:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `SESSION_SECRET` = a long random secret (do not reuse a public value)
   - `NODE_ENV` = `production`
6. Create the Web Service and wait for the deployment to finish.

The app listens on `process.env.PORT`, as required by Render. Render will show a public URL similar to `https://your-service-name.onrender.com`.

## Important security notes

- Never commit `.env` or paste your database URI/session secret into screenshots, public issues, or chat.
- Passwords are hashed before they are saved.
- This is a student capstone/demo project, not a hardened production service. Before real-world use, add rate limiting, stronger moderation, CSRF protection, and more detailed operational logging.
- Tourist information, entry fees, and opening hours can change. Verify details with official sources before travelling.

## Project structure

```text
Tourist-Spot-Review-Portal/
├── app.js
├── config/
│   └── database.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Spot.js
│   └── User.js
├── routes/
│   ├── auth.js
│   └── spots.js
├── public/
│   ├── css/style.css
│   └── js/app.js
├── views/
│   ├── auth/
│   ├── partials/
│   ├── spots/
│   ├── 404.ejs
│   └── home.ejs
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
