import React, { useState, useEffect, useRef } from 'react'
import axios from "axios"

const Feed = () => {
  const [posts, setPosts] = useState([
    {
      _id: "1",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      caption: "Beautiful mountain scenery 🏔️",
    },
    {
      _id: "2",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1170&q=80",
      caption: "Golden hour on the lake ✨",
    },
  ])
  const [loadedImages, setLoadedImages] = useState({})
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  /* ─── 3-D star-field background ─── */
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)

    const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMouse)

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      z: Math.random() * 1000,
      pz: 0,
    }))
    stars.forEach(s => s.pz = s.z)

    const warp = Array.from({ length: 30 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      z: Math.random() * 1000, speed: Math.random() * 2 + 1,
    }))

    let tick = 0

    const draw = () => {
      tick++
      ctx.fillStyle = 'rgba(5,5,20,0.15)'
      ctx.fillRect(0, 0, W, H)

      // Background grid (depth lines)
      const mx = mouseRef.current.x / W - 0.5
      const my = mouseRef.current.y / H - 0.5
      ctx.save()
      ctx.strokeStyle = 'rgba(99,102,241,0.04)'
      ctx.lineWidth = 1
      const gridSpacing = 80
      for (let gx = (tick * 0.2) % gridSpacing; gx < W; gx += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(gx + mx * 20, 0); ctx.lineTo(gx + mx * 20, H); ctx.stroke()
      }
      for (let gy = (tick * 0.2) % gridSpacing; gy < H; gy += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, gy + my * 20); ctx.lineTo(W, gy + my * 20); ctx.stroke()
      }
      ctx.restore()

      // Stars with depth parallax
      stars.forEach(s => {
        s.pz = s.z
        s.z -= 2 + mx * 5
        if (s.z <= 0) { s.z = 1000; s.pz = s.z; s.x = Math.random() * W; s.y = Math.random() * H }

        const sx = (s.x - W / 2) * (1000 / s.z) + W / 2
        const sy = (s.y - H / 2) * (1000 / s.z) + H / 2
        const px = (s.x - W / 2) * (1000 / s.pz) + W / 2
        const py = (s.y - H / 2) * (1000 / s.pz) + H / 2
        const r = (1 - s.z / 1000) * 2.5
        const a = 1 - s.z / 1000

        ctx.strokeStyle = `rgba(180,190,255,${a})`
        ctx.lineWidth = r
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke()
      })

      // Nebula blobs
      if (tick % 3 === 0) {
        warp.forEach(p => {
          p.z -= p.speed
          if (p.z <= 0) { p.z = 1000; p.x = Math.random() * W; p.y = Math.random() * H }
          const scale = 1000 / p.z
          const sx = (p.x - W / 2) * scale + W / 2
          const sy = (p.y - H / 2) * scale + H / 2
          const r = scale * 15
          const a = (1 - p.z / 1000) * 0.08
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r)
          grad.addColorStop(0, `rgba(99,102,241,${a})`)
          grad.addColorStop(1, 'rgba(99,102,241,0)')
          ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fillStyle = grad; ctx.fill()
        })
      }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  useEffect(() => {
    axios.get("http://localhost:3000/posts")
      .then(res => setPosts(res.data.posts))
      .catch(() => {}) // keep demo posts on error
  }, [])

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }))
  }

  const handleCardTilt = (e, cardEl) => {
    const rect = cardEl.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const rx = ((e.clientY - cy) / (rect.height / 2)) * -8
    const ry = ((e.clientX - cx) / (rect.width / 2)) * 8
    cardEl.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`
    cardEl.style.boxShadow = `
      ${-ry * 2}px ${rx * 2}px 40px rgba(0,0,0,0.5),
      0 0 60px rgba(99,102,241,0.15),
      inset 0 1px 0 rgba(255,255,255,0.15)
    `
  }

  const handleCardLeave = (cardEl) => {
    cardEl.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)'
    cardEl.style.boxShadow = ''
  }

  return (
    <div className="fd-root">
      <canvas ref={canvasRef} className="fd-canvas" />

      {/* Ambient glows */}
      <div className="fd-ambient fd-a1" />
      <div className="fd-ambient fd-a2" />

      {/* Top bar */}
      <nav className="fd-nav">
        <div className="fd-nav-inner">
          <div className="fd-logo">
            <div className="fd-logo-dot" />
            <span>PhotoStream</span>
          </div>
          <a href="/create-post" className="fd-new-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Post
          </a>
        </div>
      </nav>

      <main className="fd-main">
        <div className="fd-header-block">
          <h1 className="fd-heading">Your Feed</h1>
          <p className="fd-sub">{posts.length} post{posts.length !== 1 ? 's' : ''} in your universe</p>
        </div>

        {posts.length === 0 ? (
          <div className="fd-empty">
            <div className="fd-empty-icon">🌌</div>
            <p>The feed is empty. Be the first to post!</p>
            <a href="/create-post" className="fd-empty-cta">Create a post</a>
          </div>
        ) : (
          <div className="fd-grid">
            {posts.map((post, idx) => (
              <div
                key={post._id}
                className="fd-card"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onMouseMove={(e) => handleCardTilt(e, e.currentTarget)}
                onMouseLeave={(e) => handleCardLeave(e.currentTarget)}
              >
                {/* Card shimmer */}
                <div className="fd-card-shimmer" />

                {/* Image */}
                <div className="fd-img-wrap">
                  {!loadedImages[post._id] && (
                    <div className="fd-img-skeleton">
                      <div className="fd-skeleton-pulse" />
                    </div>
                  )}
                  <img
                    src={post.image}
                    alt={post.caption}
                    className={`fd-img ${loadedImages[post._id] ? 'loaded' : ''}`}
                    onLoad={() => handleImageLoad(post._id)}
                  />
                  <div className="fd-img-overlay" />
                </div>

                {/* Content */}
                <div className="fd-card-body">
                  <p className="fd-caption">{post.caption}</p>

                  <div className="fd-actions">
                    <button className="fd-action-btn fd-like-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      Like
                    </button>
                    <button className="fd-action-btn fd-share-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                      Share
                    </button>
                  </div>
                </div>

                {/* 3-D depth layers */}
                <div className="fd-depth-layer fd-dl-1" />
                <div className="fd-depth-layer fd-dl-2" />
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .fd-root {
          position: fixed; inset: 0; overflow-y: auto;
          font-family: system-ui, -apple-system, sans-serif;
          background: #05050f;
        }
        .fd-canvas {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
        }
        .fd-ambient {
          position: fixed; border-radius: 50%; filter: blur(100px);
          z-index: 1; pointer-events: none;
        }
        .fd-a1 {
          width: 600px; height: 600px; top: -200px; left: -200px;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          animation: floatA 8s ease-in-out infinite;
        }
        .fd-a2 {
          width: 500px; height: 500px; bottom: -150px; right: -100px;
          background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
          animation: floatA 10s ease-in-out infinite reverse;
        }
        @keyframes floatA {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(30px, 30px); }
        }
        /* Nav */
        .fd-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(5,5,20,0.7);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99,102,241,0.15);
        }
        .fd-nav-inner {
          max-width: 900px; margin: 0 auto; padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .fd-logo { display: flex; align-items: center; gap: 10px; color: #e0e7ff; font-weight: 700; font-size: 18px; }
        .fd-logo-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          box-shadow: 0 0 12px rgba(99,102,241,0.8);
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%,100% { box-shadow: 0 0 12px rgba(99,102,241,0.8); }
          50%      { box-shadow: 0 0 24px rgba(168,85,247,0.9); }
        }
        .fd-new-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3));
          border: 1px solid rgba(99,102,241,0.4); color: #a5b4fc;
          text-decoration: none; font-size: 14px; font-weight: 600;
          transition: all 0.3s ease;
        }
        .fd-new-btn:hover {
          background: linear-gradient(135deg, rgba(99,102,241,0.5), rgba(168,85,247,0.5));
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
          transform: translateY(-1px);
        }
        /* Main */
        .fd-main {
          position: relative; z-index: 10;
          max-width: 900px; margin: 0 auto;
          padding: 100px 24px 60px;
        }
        .fd-header-block { text-align: center; margin-bottom: 48px; }
        .fd-heading {
          font-size: 42px; font-weight: 800; letter-spacing: -1px;
          background: linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #c4b5fd 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 8px;
          animation: headingIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes headingIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .fd-sub { color: rgba(165,180,252,0.5); font-size: 15px; animation: headingIn 0.8s 0.1s both; }
        /* Grid */
        .fd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 28px;
        }
        /* Card */
        .fd-card {
          position: relative; border-radius: 20px; overflow: hidden;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
          animation: cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
          cursor: pointer;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: perspective(1000px) rotateX(20deg) translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: perspective(1000px) rotateX(0deg) translateY(0) scale(1); }
        }
        .fd-card-shimmer {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(99,102,241,0.04) 100%);
        }
        /* Image */
        .fd-img-wrap { position: relative; aspect-ratio: 1/1; overflow: hidden; }
        .fd-img-skeleton {
          position: absolute; inset: 0;
          background: rgba(99,102,241,0.08);
        }
        .fd-skeleton-pulse {
          width: 100%; height: 100%;
          background: linear-gradient(90deg, rgba(99,102,241,0.05) 25%, rgba(99,102,241,0.15) 50%, rgba(99,102,241,0.05) 75%);
          background-size: 200% 100%;
          animation: skelPulse 1.5s infinite;
        }
        @keyframes skelPulse { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .fd-img {
          width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;
          opacity: 0; transition: opacity 0.5s ease, transform 0.6s ease;
          transform: scale(1.05);
        }
        .fd-img.loaded { opacity: 1; transform: scale(1); }
        .fd-img-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(to bottom, transparent 40%, rgba(5,5,20,0.8) 100%);
        }
        /* Card body */
        .fd-card-body {
          padding: 16px 20px 20px;
          position: relative; z-index: 2;
        }
        .fd-caption { color: rgba(225,230,255,0.9); font-size: 15px; line-height: 1.5; margin-bottom: 16px; }
        /* Actions */
        .fd-actions { display: flex; gap: 10px; }
        .fd-action-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; transition: all 0.25s ease;
        }
        .fd-like-btn {
          background: rgba(239,68,68,0.12); color: rgba(252,165,165,0.9);
          border: 1px solid rgba(239,68,68,0.2);
        }
        .fd-like-btn:hover {
          background: rgba(239,68,68,0.25);
          box-shadow: 0 0 16px rgba(239,68,68,0.2);
          transform: translateY(-1px);
        }
        .fd-share-btn {
          background: rgba(99,102,241,0.12); color: rgba(165,180,252,0.9);
          border: 1px solid rgba(99,102,241,0.2);
        }
        .fd-share-btn:hover {
          background: rgba(99,102,241,0.25);
          box-shadow: 0 0 16px rgba(99,102,241,0.2);
          transform: translateY(-1px);
        }
        /* Depth layers for fake 3-D card edges */
        .fd-depth-layer {
          position: absolute; pointer-events: none; border-radius: inherit;
        }
        .fd-dl-1 {
          inset: -1px; z-index: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 60%);
        }
        .fd-dl-2 {
          bottom: -4px; left: 4px; right: 4px; height: 100%;
          background: rgba(99,102,241,0.06);
          filter: blur(8px);
          z-index: -1;
        }
        /* Empty state */
        .fd-empty {
          text-align: center; padding: 80px 20px;
          color: rgba(165,180,252,0.5);
        }
        .fd-empty-icon { font-size: 64px; margin-bottom: 16px; animation: floatA 4s ease-in-out infinite; }
        .fd-empty p { font-size: 18px; margin-bottom: 24px; }
        .fd-empty-cta {
          display: inline-block; padding: 12px 28px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 12px; color: #fff;
          text-decoration: none; font-weight: 600;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          transition: all 0.3s ease;
        }
        .fd-empty-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,0.5); }
        /* Responsive */
        @media (max-width: 600px) {
          .fd-grid { grid-template-columns: 1fr; }
          .fd-heading { font-size: 30px; }
        }
      `}</style>
    </div>
  )
}

export default Feed