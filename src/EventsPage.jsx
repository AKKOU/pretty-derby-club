import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './EventsPage.css';

const NAV_ITEMS = [
  { label: '首頁', english: 'HOME', href: '/' },
  { label: '成員介紹', english: 'MEMBERS', href: '/members' },
  { label: '活動', english: 'EVENTS', href: '/events' },
  { label: '聯繫我們', english: 'CONTACT', href: '/contact' },
];

export default function EventsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const pageRef = React.useRef(null);
  const scrollFrameRef = React.useRef(null);
  const scrollVelocityRef = React.useRef(0);
  const scrollLockedRef = React.useRef(false);

  useEffect(() => {
    scrollLockedRef.current = menuOpen || Boolean(selectedPhoto);
    if (scrollLockedRef.current && scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
      scrollVelocityRef.current = 0;
    }
  }, [menuOpen, selectedPhoto]);

  // Discrete mouse-wheel ticks get a gentle inertial tail.
  // Trackpads and precision scrolling stay native to avoid fighting the browser.
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    let previousTime = 0;

    const animateScroll = (time) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 32) : 16.67;
      previousTime = time;
      const step = elapsed / 16.67;
      const before = page.scrollTop;
      page.scrollTop += scrollVelocityRef.current * step;
      scrollVelocityRef.current *= Math.pow(0.80, step);
      const atEdge = page.scrollTop === before;
      if (Math.abs(scrollVelocityRef.current) < 0.35 || atEdge) {
        scrollVelocityRef.current = 0;
        scrollFrameRef.current = null;
        previousTime = 0;
        return;
      }
      scrollFrameRef.current = requestAnimationFrame(animateScroll);
    };

    const handleWheel = (event) => {
      if (scrollLockedRef.current || event.ctrlKey) return;
      const isDiscreteWheel = event.deltaMode !== 0 || Math.abs(event.deltaY) >= 75;
      if (!isDiscreteWheel) {
        // Never mix native trackpad momentum with our wheel animation.
        if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
        scrollVelocityRef.current = 0;
        previousTime = 0;
        return;
      }
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page.clientHeight : 1);
      const impulse = Math.max(-90, Math.min(90, pixels * 0.42));
      scrollVelocityRef.current = Math.max(-110, Math.min(110, scrollVelocityRef.current * 0.45 + impulse));
      if (scrollFrameRef.current === null) {
        scrollFrameRef.current = requestAnimationFrame(animateScroll);
      }
    };

    page.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      page.removeEventListener('wheel', handleWheel);
      if (scrollFrameRef.current !== null) cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetch('/images/events/events.json')
      .then((response) => {
        if (!response.ok) throw new Error('無法載入活動照片清單');
        return response.json();
      })
      .then((files) => {
        setPhotos(
          files.map((file) => `/images/events/${file}`)
        );
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedPhoto(null);
        setZoomed(false);
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePageScroll = (event) => {
    setShowTop(event.currentTarget.scrollTop > 160);
  };

  const scrollToTop = () => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
    scrollVelocityRef.current = 0;
    pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="events-page" ref={pageRef} onScroll={handlePageScroll}>
      <motion.button
        type="button"
        className="events-menu-btn"
        onClick={() => setMenuOpen(true)}
        aria-label="開啟選單"
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <img src="/images/btn-menu.png" alt="MENU" />
      </motion.button>

      <motion.button
        type="button"
        className="events-top-btn"
        aria-label="回到活動頁頂端"
        onClick={scrollToTop}
        initial={false}
        animate={{ opacity: showTop ? 1 : 0, y: showTop ? 0 : 90 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: showTop ? 'auto' : 'none' }}
        whileHover={showTop ? { scale: 1.07 } : undefined}
        whileTap={showTop ? { scale: 0.94 } : undefined}
      >
        <img src="/images/btn-top.png" alt="TOP" />
      </motion.button>

      <main className="events-content">
        <h1 className="events-title">
          <img
            src="/images/title-event.png"
            alt="EVENTS"
            className="events-title-img"
          />
        </h1>
        <p className="events-subtitle">活動紀錄 · ACTIVITY GALLERY</p>

        <div className="events-grid">
          {photos.map((src, index) => (
            <motion.button
              type="button"
              key={src}
              className="events-photo"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
              whileHover={{ scale: 1.035 }}
              onClick={() => { setSelectedPhoto(src); setZoomed(false); }}
              aria-label={`放大檢視活動照片 ${index + 1}`}
            >
              <img
                src={src}
                alt={`活動照片 ${index + 1}`}
                loading="lazy"
              />
            </motion.button>
          ))}
        </div>
      </main>

      {/* 與 IndexPage 相同的頁尾 */}
      <footer className="site-footer events-footer">
        <img src="/images/hero-logo.png" alt="Pretty Derby Club Logo" className="footer-logo-img" />
        <nav className="footer-links" aria-label="頁尾導覽">
          {NAV_ITEMS.map((item) => (
            <a key={item.english} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="footer-divider" />
        <p className="footer-copyright">© 2026 Pretty Derby Club. All Rights Reserved.</p>
      </footer>

      {/* 照片放大檢視：淡入背景、圖片縮放進場，關閉時反向播放 */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            key="events-lightbox"
            className="events-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="照片放大檢視"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={() => { setSelectedPhoto(null); setZoomed(false); }}
          >
            <button
              type="button"
              className="events-lightbox-close"
              aria-label="關閉照片"
              onClick={() => { setSelectedPhoto(null); setZoomed(false); }}
            >×</button>
            <motion.img
              className="events-lightbox-image"
              src={selectedPhoto}
              alt="活動照片放大檢視"
              initial={{ opacity: 0, scale: 0.78, y: 28 }}
              animate={{ opacity: 1, scale: zoomed ? 1.5 : 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 18 }}
              transition={{ type: 'spring', stiffness: 260, damping: 27, mass: 0.85 }}
              style={{ cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
              onClick={(event) => { event.stopPropagation(); setZoomed((value) => !value); }}
            />
            <span className="events-lightbox-hint">點擊照片{zoomed ? '縮小' : '放大'} · Esc 關閉</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 背景遮罩 */}
      <div
        className={`events-menu-overlay ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* 與首頁相同的側邊選單 */}
      <aside
        className={`events-side-menu ${menuOpen ? 'is-open' : ''}`}
        aria-label="網站選單"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <button
          type="button"
          className="events-menu-close"
          onClick={() => setMenuOpen(false)}
          aria-label="關閉選單"
        >
          ×
        </button>

        <a href="/" className="events-logo-link" aria-label="返回首頁">
          <img
            src="/images/hero-logo.png"
            alt="Pretty Derby Club"
            className="events-side-menu-logo"
          />
        </a>

        <nav className="events-side-menu-nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.english} href={item.href}>
              <span>{item.label}</span>
              <small>{item.english}</small>
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}