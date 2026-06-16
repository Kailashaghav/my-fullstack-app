# My Fullstack App — Social Feed

A full-stack social feed application where users can create posts (with text and images) and browse them in a shared feed. Built with a React frontend and a Node.js/Express/MongoDB backend, deployed on Vercel and Render.

## About

This project is a minimal social feed platform: anyone can publish a post containing text and an image, and all posts appear in a live feed for others to see. It was built as a full-stack portfolio project to demonstrate end-to-end development — REST API design, MongoDB schema modeling, file/image handling, client-side routing, and production deployment across two separate hosting platforms (frontend on Vercel, backend on Render).

## Features

- Create posts with text content and an image
- Browse all posts in a chronological feed
- RESTful API backend with MongoDB persistence
- Environment-based API configuration (no hardcoded URLs)
- Client-side routing with React Router, including SPA-safe deployment on Vercel

## Tech Stack

**Frontend**
- React (Vite)
- React Router DOM
- Deployed on Vercel

**Backend**
- Node.js
- Express.js
- MongoDB (Mongoose)
- Deployed on Render

## Project Structure

```
my-fullstack-app/
├── Frontend/          # React + Vite client
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Feed.jsx
│   │   │   └── CreatePost.jsx
│   │   └── App.jsx
│   ├── vercel.json    # SPA rewrite config for Vercel
│   └── .env           # VITE_API_URL
└── Backend/           # Express + MongoDB API
    ├── models/
    ├── routes/
    └── server.js
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- A MongoDB connection string (local or MongoDB Atlas)

### Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run the server:

```bash
npm start
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in `Frontend/`:

```
VITE_API_URL=http://localhost:5000
```

Run the dev server:

```bash
npm run dev
```

## Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com), root directory set to `Frontend`, with `VITE_API_URL` set to the live backend URL as an environment variable.
- **Backend**: Deployed on [Render](https://render.com), connected to MongoDB Atlas for persistent storage.

## Routes

| Path | Description |
|------|-------------|
| `/` | Redirects to `/feed` |
| `/feed` | View all posts |
| `/create-post` | Create a new post |

## Author

**Kailash Aghav**
- Portfolio: [kailashaghavportfolio.vercel.app](https://kailashaghavportfolio.vercel.app)
- GitHub: [@Kailashaghav](https://github.com/Kailashaghav)
- LinkedIn: [kailash-aghav4](https://linkedin.com/in/kailash-aghav4)

## License

This project is open source and available under the [MIT License](LICENSE).
