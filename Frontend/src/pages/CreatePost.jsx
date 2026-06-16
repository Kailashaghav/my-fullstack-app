import React, { useState, useRef, useEffect } from 'react'
import axios from "axios"
import { useNavigate } from "react-router-dom"

const CreatePost = () => {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const particlesRef = useRef([])

  /* ─── 3-D particle background ─── */
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)

    // Create floating 3-D orbs
    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: Math.random() * 800 + 200,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 1,
      hue: Math.random() * 60 + 200, // blue-purple range
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      // Deep dark gradient background
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#0a0a1a')
      bg.addColorStop(0.5, '#0d0d2b')
      bg.addColorStop(1, '#050510')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        if (p.z < 50 || p.z > 1000) p.vz *= -1

        const scale = 800 / p.z
        const sx = (p.x - W / 2) * scale + W / 2
        const sy = (p.y - H / 2) * scale + H / 2
        const r = scale * 3
        const alpha = Math.min(1, scale * 0.8)

        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r)
        grad.addColorStop(0, `hsla(${p.hue},90%,70%,${alpha})`)
        grad.addColorStop(0.5, `hsla(${p.hue},70%,50%,${alpha * 0.5})`)
        grad.addColorStop(1, `hsla(${p.hue},90%,40%,0)`)
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })

      // Draw connecting lines
      particlesRef.current.forEach((a, i) => {
        particlesRef.current.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const scaleA = 800 / a.z, scaleB = 800 / b.z
            const ax = (a.x - W / 2) * scaleA + W / 2
            const ay = (a.y - H / 2) * scaleA + H / 2
            const bx = (b.x - W / 2) * scaleB + W / 2
            const by = (b.y - H / 2) * scaleB + H / 2
            ctx.strokeStyle = `rgba(100,120,255,${(1 - dist / 120) * 0.3})`
            ctx.lineWidth = 0.5
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke()
          }
        })
      })

      animFrameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animFrameRef.current); window.removeEventListener('resize', resize) }
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || (e.dataTransfer?.files[0])
    if (!file) return
    setPreview(URL.createObjectURL(file))
    // Animate progress bar
    setUploadProgress(0)
    let p = 0
    const iv = setInterval(() => { p += Math.random() * 15; if (p >= 100) { p = 100; clearInterval(iv) } setUploadProgress(p) }, 80)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const fake = { target: { files: e.dataTransfer.files } }
    handleFileChange({ ...fake, dataTransfer: e.dataTransfer })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    const formData = new FormData(e.target)
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/create-post`, formData)
      setSubmitted(true)
      setTimeout(() => navigate("/feed"), 1500)
    } catch {
      alert("Error creating post")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="cp-root">
      <canvas ref={canvasRef} className="cp-canvas" />

      {/* Floating glow orbs for depth */}
      <div className="cp-glow cp-glow-1" />
      <div className="cp-glow cp-glow-2" />
      <div className="cp-glow cp-glow-3" />

      <div className="cp-center">
        <div className="cp-card">
          {/* Header */}
          <div className="cp-header">
            <div className="cp-icon-ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h1 className="cp-title">Create Post</h1>
            <p className="cp-subtitle">Share your moment with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="cp-form">
            {/* Drop zone */}
            <div
              className={`cp-dropzone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('cp-file-input').click()}
            >
              <input
                id="cp-file-input"
                type="file"
                name="image"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {preview ? (
                <div className="cp-preview-wrap">
                  <img src={preview} alt="Preview" className="cp-preview-img" />
                  <div className="cp-preview-overlay">
                    <span>Click to change</span>
                  </div>
                </div>
              ) : (
                <div className="cp-drop-inner">
                  <div className="cp-drop-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                  </div>
                  <p className="cp-drop-text">Drag & drop your image here</p>
                  <p className="cp-drop-sub">or click to browse</p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="cp-progress-track">
                <div className="cp-progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            {uploadProgress === 100 && !preview && null}
            {uploadProgress === 100 && preview && (
              <p className="cp-upload-done">✓ Image ready</p>
            )}

            {/* Caption */}
            <div className="cp-field-wrap">
              <input
                type="text"
                name="caption"
                placeholder="Write a caption…"
                required
                className="cp-input"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`cp-btn ${uploading ? 'loading' : ''} ${submitted ? 'done' : ''}`}
              disabled={uploading || submitted}
            >
              {submitted ? (
                <span className="cp-btn-content">✓ Posted! Redirecting…</span>
              ) : uploading ? (
                <span className="cp-btn-content"><span className="cp-spinner" /> Publishing…</span>
              ) : (
                <span className="cp-btn-content">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Publish Post
                </span>
              )}
              <div className="cp-btn-glow" />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .cp-root {
          position: fixed; inset: 0; overflow: hidden;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .cp-canvas {
          position: absolute; inset: 0; z-index: 0;
        }
        .cp-glow {
          position: absolute; border-radius: 50%;
          filter: blur(80px); z-index: 1; pointer-events: none;
        }
        .cp-glow-1 {
          width: 400px; height: 400px; top: -100px; left: -100px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
        }
        .cp-glow-2 {
          width: 350px; height: 350px; bottom: -80px; right: -80px;
          background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%);
        }
        .cp-glow-3 {
          width: 300px; height: 300px; top: 50%; left: 60%;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
        }
        .cp-center {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: center;
          height: 100%; padding: 20px;
        }
        .cp-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 24px;
          padding: 40px;
          width: 100%; max-width: 480px;
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.15),
            0 24px 64px rgba(0,0,0,0.5),
            0 0 80px rgba(99,102,241,0.08),
            inset 0 1px 0 rgba(255,255,255,0.1);
          transform: perspective(1000px) rotateX(1deg);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          animation: cpCardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .cp-card:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-4px);
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.3),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 100px rgba(99,102,241,0.12),
            inset 0 1px 0 rgba(255,255,255,0.15);
        }
        @keyframes cpCardIn {
          from { opacity: 0; transform: perspective(1000px) rotateX(15deg) translateY(40px); }
          to   { opacity: 1; transform: perspective(1000px) rotateX(1deg) translateY(0); }
        }
        .cp-header { text-align: center; margin-bottom: 32px; }
        .cp-icon-ring {
          width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 16px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.4));
          border: 1px solid rgba(99,102,241,0.4);
          color: #a5b4fc;
          box-shadow: 0 0 30px rgba(99,102,241,0.3);
          animation: iconPulse 3s ease-in-out infinite;
        }
        @keyframes iconPulse {
          0%,100% { box-shadow: 0 0 30px rgba(99,102,241,0.3); }
          50%      { box-shadow: 0 0 50px rgba(99,102,241,0.5), 0 0 80px rgba(168,85,247,0.2); }
        }
        .cp-title {
          font-size: 28px; font-weight: 700; letter-spacing: -0.5px;
          background: linear-gradient(135deg, #e0e7ff, #a5b4fc, #c4b5fd);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 6px;
        }
        .cp-subtitle { color: rgba(165,180,252,0.6); font-size: 14px; }
        .cp-form { display: flex; flex-direction: column; gap: 16px; }
        .cp-dropzone {
          border: 2px dashed rgba(99,102,241,0.4);
          border-radius: 16px; padding: 32px; text-align: center;
          cursor: pointer; transition: all 0.3s ease; min-height: 180px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(99,102,241,0.04);
          position: relative; overflow: hidden;
        }
        .cp-dropzone::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05));
          opacity: 0; transition: opacity 0.3s;
        }
        .cp-dropzone:hover, .cp-dropzone.drag-over {
          border-color: rgba(99,102,241,0.8);
          background: rgba(99,102,241,0.08);
          transform: scale(1.01);
          box-shadow: 0 0 30px rgba(99,102,241,0.15), inset 0 0 30px rgba(99,102,241,0.05);
        }
        .cp-dropzone:hover::before, .cp-dropzone.drag-over::before { opacity: 1; }
        .cp-dropzone.drag-over {
          border-color: #a5b4fc; border-style: solid;
          animation: dzPulse 0.5s ease-in-out infinite alternate;
        }
        @keyframes dzPulse {
          from { box-shadow: 0 0 20px rgba(99,102,241,0.2); }
          to   { box-shadow: 0 0 50px rgba(99,102,241,0.5); }
        }
        .cp-drop-icon { color: rgba(165,180,252,0.6); margin-bottom: 12px; animation: floatIcon 3s ease-in-out infinite; }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .cp-drop-text { color: rgba(165,180,252,0.9); font-size: 15px; font-weight: 500; margin-bottom: 4px; }
        .cp-drop-sub  { color: rgba(165,180,252,0.4); font-size: 13px; }
        .cp-preview-wrap { position: relative; width: 100%; border-radius: 12px; overflow: hidden; }
        .cp-preview-img { width: 100%; max-height: 220px; object-fit: cover; display: block; border-radius: 12px; }
        .cp-preview-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s; border-radius: 12px;
          color: #fff; font-size: 14px; font-weight: 600;
        }
        .cp-preview-wrap:hover .cp-preview-overlay { opacity: 1; }
        .cp-progress-track {
          height: 4px; background: rgba(99,102,241,0.2); border-radius: 2px; overflow: hidden;
          animation: progTrackIn 0.3s ease;
        }
        @keyframes progTrackIn { from { opacity: 0; transform: scaleX(0.8); } to { opacity: 1; transform: scaleX(1); } }
        .cp-progress-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, #6366f1, #a855f7, #6366f1);
          background-size: 200% 100%;
          animation: progressShimmer 1.5s linear infinite;
          transition: width 0.1s ease;
        }
        @keyframes progressShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .cp-upload-done { color: #86efac; font-size: 13px; text-align: center; animation: fadeSlideUp 0.4s ease; }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .cp-field-wrap { position: relative; }
        .cp-input {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #e0e7ff; font-size: 15px; outline: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .cp-input::placeholder { color: rgba(165,180,252,0.35); }
        .cp-input:focus {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.08);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.1);
        }
        .cp-btn {
          position: relative; overflow: hidden;
          padding: 15px 24px; border: none; border-radius: 14px; cursor: pointer;
          font-size: 16px; font-weight: 600; color: #fff;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
          box-shadow: 0 4px 24px rgba(99,102,241,0.4), 0 0 0 1px rgba(99,102,241,0.3);
        }
        .cp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.4), 0 0 40px rgba(168,85,247,0.2);
        }
        .cp-btn:active:not(:disabled) { transform: translateY(0); }
        .cp-btn:disabled { opacity: 0.8; cursor: not-allowed; }
        .cp-btn.done { background: linear-gradient(135deg, #10b981, #059669); }
        .cp-btn-content { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .cp-btn-glow {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .cp-btn:hover .cp-btn-glow { opacity: 1; }
        .cp-spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default CreatePost
