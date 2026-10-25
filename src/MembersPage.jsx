import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './MembersPage.css';

const members = [
  '/images/members/MB_01.png',
  '/images/members/MB_02.png',
  '/images/members/MB_03.png',
];

export default function MembersPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastWheelAt = useRef(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, []);

  const move = useCallback((direction) => {
    setActiveIndex((current) => Math.max(0, Math.min(members.length - 1, current + direction)));
  }, []);

  const handleWheel = useCallback((event) => {
    if (Math.abs(event.deltaY) < 5) return;
    event.preventDefault();
    const now = Date.now();
    if (now - lastWheelAt.current < 650) return;
    lastWheelAt.current = now;
    move(event.deltaY > 0 ? 1 : -1);
  }, [move]);

  useEffect(() => {
    const gallery = document.querySelector('.members-gallery');
    if (!gallery) return;
    gallery.addEventListener('wheel', handleWheel, { passive: false });
    return () => gallery.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  return (
    <div className="members-page">
      <button
        className="members-menu-btn"
        type="button"
        aria-label="開啟選單"
        aria-expanded={menuOpen}
        aria-controls="members-side-menu"
        onClick={() => setMenuOpen(true)}
      >
        <img src="/images/btn-menu.png" alt="" />
      </button>

      <main className="members-content">
        <img
          src="/images/title-intro_mb.png"
          alt="INTRODUCTION"
          className="members-title"
        />

        <section
          className="members-gallery"
          aria-label="成員介紹輪播"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
              event.preventDefault();
              move(1);
            }
            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
              event.preventDefault();
              move(-1);
            }
          }}
          onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            if (touchStartX.current == null) return;
            const distance = touchStartX.current - (event.changedTouches[0]?.clientX ?? touchStartX.current);
            if (Math.abs(distance) > 40) move(distance > 0 ? 1 : -1);
            touchStartX.current = null;
          }}
        >
          <div className="members-card-stage">
            {members.map((src, index) => {
              const offset = index - activeIndex;
              return (
                <motion.button
                  type="button"
                  key={src}
                  className={`members-card ${index === activeIndex ? 'is-active' : ''}`}
                  aria-label={`查看第 ${index + 1} 位成員`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => setActiveIndex(index)}
                  initial={false}
                  animate={{
                    x: `${offset * 75}%`,
                    scale: offset === 0 ? 1 : 0.78,
                    opacity: Math.abs(offset) > 1 ? 0.45 : 1,
                    rotateY: offset * -12,
                    zIndex: members.length - Math.abs(offset),
                  }}
                  transition={{ type: 'spring', stiffness: 190, damping: 26 }}
                >
                  <img src={src} alt={`成員 ${String(index + 1).padStart(2, '0')}`} draggable="false" />
                </motion.button>
              );
            })}
          </div>
          <div className="members-gallery-hint">SCROLL TO EXPLORE</div>
          <div className="members-gallery-dots" aria-label="切換成員">
            {members.map((src, index) => (
              <button
                key={src}
                type="button"
                aria-label={`第 ${index + 1} 位成員`}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`members-gallery-dot ${activeIndex === index ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* 與首頁相同的側邊滑出選單 */}
      <div
        className={`menu-overlay ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="members-side-menu"
        className={`side-menu ${menuOpen ? 'is-open' : ''}`}
        aria-label="網站選單"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <button
          type="button"
          className="menu-close"
          onClick={() => setMenuOpen(false)}
          aria-label="關閉選單"
        >
          ×
        </button>
        <a href="/" className="side-menu-logo-link" aria-label="返回首頁">
          <img src="/images/hero-logo.png" alt="Pretty Derby Club" className="side-menu-logo" />
        </a>
        <nav className="side-menu-nav" aria-label="主選單">
          <a href="/" onClick={() => setMenuOpen(false)}><span>首頁</span><small>HOME</small></a>
          <a href="/members" onClick={() => setMenuOpen(false)}><span>成員介紹</span><small>MEMBERS</small></a>
          <a href="/events" onClick={() => setMenuOpen(false)}><span>活動</span><small>EVENTS</small></a>
          <a href="/contact" onClick={() => setMenuOpen(false)}><span>聯繫我們</span><small>CONTACT</small></a>
        </nav>
      </aside>
    </div>
  );
}
