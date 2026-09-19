# Blog CMS — Full Stack (React + Express + MongoDB)

A complete blog/CMS with user auth, post creation/editing, and comments.

## File Structure

```
blog-cms/
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema (auth, roles)
│   │   ├── Post.js               # Post schema (slug, tags, status)
│   │   └── Comment.js            # Comment schema
│   ├── middleware/
│   │   └── auth.js               # JWT protect + role guard
│   ├── controllers/
│   │   ├── authController.js     # register/login/me
│   │   ├── postController.js     # CRUD for posts
│   │   └── commentController.js  # CRUD for comments
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   └── commentRoutes.js
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios instance + auth token interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global auth state
│   │   ├── data/
│   │   │   └── categories.js     # Category list + color coding
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Masthead + category strip
│   │   │   ├── StoryCard.jsx     # Image/text card used across sections
│   │   │   ├── CategorySection.jsx
│   │   │   └── CommentSection.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Lead story + secondary headlines + category rows
│   │   │   ├── Category.jsx      # Full listing for one category
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── PostDetail.jsx    # Hero image/video, standfirst, related stories
│   │   │   ├── CreatePost.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx               # Routes
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## How the pieces connect

- **Database (MongoDB)**: three collections — `users`, `posts`, `comments` — defined as Mongoose schemas in `backend/models/`.
- **Backend (Express + Node)**: exposes a REST API under `/api/auth`, `/api/posts`, `/api/comments`. JWT-based auth via `middleware/auth.js` protects write operations.
- **Frontend (React)**: talks to the API through a single Axios instance (`src/api/axios.js`) that auto-attaches the JWT. `AuthContext` holds the logged-in user across the app; React Router handles navigation.

## Setup

### 1. Database
Install MongoDB locally or use MongoDB Atlas (free tier). Get a connection string.

### 2. Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev                # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # set REACT_APP_API_URL if different
npm install
npm start                  # starts on http://localhost:3000
```

## API Endpoints

| Method | Endpoint                     | Auth | Description               |
|--------|-------------------------------|------|----------------------------|
| POST   | /api/auth/register            | No   | Create account             |
| POST   | /api/auth/login               | No   | Log in, get JWT            |
| GET    | /api/auth/me                  | Yes  | Current user profile       |
| GET    | /api/posts                    | No   | List published posts (paginated, filter with `?category=Finance`) |
| GET    | /api/posts/front-page         | No   | Latest posts grouped by category, for the homepage |
| GET    | /api/posts/mine               | Yes  | Current user's posts       |
| GET    | /api/posts/:slug              | No   | Single post by slug        |
| POST   | /api/posts                    | Yes  | Create post                |
| PUT    | /api/posts/:id                | Yes  | Update own post (or admin) |
| DELETE | /api/posts/:id                | Yes  | Delete own post (or admin) |
| GET    | /api/comments/post/:postId    | No   | Comments for a post        |
| POST   | /api/comments/post/:postId    | Yes  | Add comment                |
| DELETE | /api/comments/:id             | Yes  | Delete own comment (or admin) |

## Notes
- Passwords are hashed with bcrypt before saving.
- Post slugs are auto-generated from the title.
- Extend roles (`admin`, `author`, `reader`) in `models/User.js` as needed.
- The frontend is now a news-agency style layout: a masthead with a category strip (Politics, Finance, Economics, Technology, Sports, World), a homepage lead story + secondary headlines + per-category rows, and article pages with a hero image or embedded video. Every `Post` now requires a `category` (see the enum in `models/Post.js`) — set it when creating a post, and optionally add a `videoUrl` (e.g. a YouTube embed link) instead of a cover image.
- To add/rename categories, update the enum in `backend/models/Post.js` and the list in `frontend/src/data/categories.js` together.

## Ad placements (monetization)

There's a reusable `AdSlot` component (`frontend/src/components/AdSlot.jsx`) already placed at:
- A leaderboard banner under the masthead on every page (`App.jsx`)
- A rectangle ad beside the lead story on the homepage
- A banner ad between category sections on the homepage
- A banner ad inside every article, after the body and before comments

Each slot currently renders a labeled gray placeholder box — this is intentional so your layout doesn't shift once real ads load. To go live:

1. Apply to an ad network — **Google AdSense** is the easiest first step (needs a live custom domain, not localhost). Once approved, get your publisher ID (`ca-pub-XXXXXXXXXXXXXXX`).
2. Paste AdSense's loader `<script>` tag into `frontend/public/index.html` where the placeholder comment is.
3. Replace the inner content of `ad-slot-box` in `AdSlot.jsx` with your `<ins class="adsbygoogle">` ad unit code (AdSense gives you this per ad slot from their dashboard) instead of the placeholder text.
4. Keep the reserved sizes (`leaderboard`, `rectangle`, `banner`) — Google penalizes ads that shift content around after loading (Cumulative Layout Shift), so matching your ad unit size to these dimensions avoids that.
5. Once you have real traffic (several thousand monthly visits), consider applying to **Mediavine** or **AdThrive** instead — they pay meaningfully better CPMs than AdSense and can usually reuse the same `AdSlot` component, just swapping the embed code.

Keep ad density reasonable — 3–4 slots per page (as set up here) is a safe starting point; packing in more can hurt both user experience and Google's site quality signals.
