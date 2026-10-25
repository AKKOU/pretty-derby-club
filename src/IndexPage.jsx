import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './IndexPage.css';
const IMAGES = {
    menuBtn: '/images/btn-menu.png',
    topBtn: '/images/btn-top.png',
    recruitBtn: '/images/btn-recruit.png',
    joinBtn: '/images/btn-join.png',
    introTitle: '/images/title-intro.png',
    videoTitle: '/images/title-video.png',
    heroLogo: '/images/hero-logo.png',
    introCard: '/images/intro-card.png',
    decoHorse: '/images/deco-horse.png',
};
const HERO_IMAGES = [
    '/images/heros/hero-main_1.png',
    '/images/heros/hero-main_2.png',
    '/images/heros/hero-main_3.png',
    '/images/heros/hero-main_4.png',
];
const NAV_ITEMS = [
    { label: '首頁', english: 'HOME', href: '#home' },
    { label: '成員介紹', english: 'MEMBERS', href: '/members' },
    { label: '活動', english: 'EVENTS', href: '/events' },
    { label: '聯繫我們', english: 'CONTACT', href: '/contact' },
];
const getYouTubeId = (url) => {
    if (!url)
        return '';
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtu.be'))
            return parsed.pathname.slice(1);
        if (parsed.pathname.startsWith('/embed/'))
            return parsed.pathname.split('/')[2] || '';
        if (parsed.pathname === '/watch')
            return parsed.searchParams.get('v') || '';
        if (parsed.pathname.startsWith('/shorts/'))
            return parsed.pathname.split('/')[2] || '';
    }
    catch {
        return '';
    }
    return '';
};
export default function IndexPage() {
    const [currentSection, setCurrentSection] = useState(0);
    const [heroIndex, setHeroIndex] = useState(0);
    const [videos, setVideos] = useState([]);
    const [videoIndex, setVideoIndex] = useState(0);
    const [playingVideoIndex, setPlayingVideoIndex] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const isScrolling = useRef(false);
    const scrollAccumulator = useRef(0);
    const scrollTimeout = useRef(null);
    useEffect(() => {
        fetch('/videos.json')
            .then((response) => {
            if (!response.ok)
                throw new Error('Unable to load videos.json');
            return response.json();
        })
            .then((data) => setVideos(Array.isArray(data) ? data : data.videos || []))
            .catch((error) => console.error('載入影片清單失敗：', error));
    }, []);
    useEffect(() => {
        const timer = window.setInterval(() => {
            setHeroIndex((index) => (index + 1) % HERO_IMAGES.length);
        }, 4000);
        return () => window.clearInterval(timer);
    }, []);
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setMenuOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
    useEffect(() => {
        const handleWheel = (event) => {
            event.preventDefault();
            if (isScrolling.current || menuOpen)
                return;
            scrollAccumulator.current += event.deltaY;
            const threshold = 80;
            const direction = scrollAccumulator.current > threshold ? 1 : scrollAccumulator.current < -threshold ? -1 : 0;
            if (direction) {
                setCurrentSection((section) => {
                    const next = Math.max(0, Math.min(2, section + direction));
                    if (next !== section) {
                        isScrolling.current = true;
                        window.setTimeout(() => { isScrolling.current = false; }, 850);
                    }
                    return next;
                });
                scrollAccumulator.current = 0;
            }
            window.clearTimeout(scrollTimeout.current);
            scrollTimeout.current = window.setTimeout(() => { scrollAccumulator.current = 0; }, 170);
        };
        const container = document.getElementById('pdc-container');
        container?.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container?.removeEventListener('wheel', handleWheel);
            window.clearTimeout(scrollTimeout.current);
        };
    }, [menuOpen]);
    // 切換影片時先回到縮圖，避免 iframe 在滑動時出現黑畫面。
    useEffect(() => {
        setPlayingVideoIndex(null);
    }, [videoIndex]);

    const changeVideo = (direction) => {
        if (videos.length < 2)
            return;
        setVideoIndex((index) => (index + direction + videos.length) % videos.length);
    };
    const goHome = (event) => {
        event.preventDefault();
        setMenuOpen(false);
        setCurrentSection(0);
    };
    const fadeInUp = {
        hidden: { opacity: 0, y: 42 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };
    return (<div className="pdc-container" id="pdc-container">
      <motion.button className="img-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="開啟選單" whileHover={{ scale: 1.1, rotate: -5 }} whileTap={{ scale: 0.9 }}>
        <img src={IMAGES.menuBtn} alt="MENU" />
      </motion.button>
      <motion.button
        type="button"
        className="img-btn pdc-top-btn"
        aria-label="回到首頁頂端"
        onClick={() => { setCurrentSection(0); scrollAccumulator.current = 0; }}
        initial={false}
        animate={{ opacity: currentSection > 0 ? 1 : 0, y: currentSection > 0 ? 0 : 90 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: currentSection > 0 ? 'auto' : 'none' }}
        whileHover={currentSection > 0 ? { scale: 1.07 } : undefined}
        whileTap={currentSection > 0 ? { scale: 0.94 } : undefined}
      >
        <img src={IMAGES.topBtn} alt="TOP" />
      </motion.button>
      <motion.div className="sections-wrapper" animate={{ y: `-${currentSection * 100}vh` }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
        {/* 1. 首頁 Hero */}
        <section className="hero-section" id="home">
          <div className="hero-content">
            <motion.div className="hero-left" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
              <div className="hero-logo-wrapper">
                <img src={IMAGES.heroLogo} alt="Pretty Derby Club Logo" className="hero-logo-img"/>
              </div>
              <div className="news-board-container">
                <div className="news-board-box">
                  <div className="board-horse-track" aria-hidden="true">
                    <div className="board-horse-walker">
                      <img
                        src={IMAGES.decoHorse}
                        alt=""
                        className="board-horse-img"
                      />
                    </div>
                  </div>
                  <ul className="hero-bullet-list">
                    <li><a href="#news">分享你的喜悅，一起在最後的舞台綻放光彩吧!</a></li>
                    <li><a href="#news">小馬俱樂部馬娃聚會，將於12月21日舉辦</a></li>
                    <li><a href="#news">【情報】《賽馬娘 Pretty Derby》主線故事...</a></li>
                  </ul></div>
                <motion.button className="img-btn recruit-btn" onClick={() => { window.location.href = "/contact"; }} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}><img src={IMAGES.recruitBtn} alt="成員招募中"/></motion.button>
              </div>
            </motion.div>
            <motion.div className="hero-right" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: 'easeOut' }}>
              <motion.div className="hero-carousel-track" animate={{ x: `-${heroIndex * 100}%` }} transition={{ duration: 0.8, ease: 'easeInOut' }}>
                {HERO_IMAGES.map((src, index) => <img key={src} src={src} alt={`Pretty Derby Hero ${index + 1}`} className="hero-main-img"/>)}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 2. 介紹 Introduction */}
        <section className="intro-section">
          <motion.div className="section-title-wrapper" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><img src={IMAGES.introTitle} alt="INTRODUCTION" className="title-img intro-title-img"/></motion.div>
          <motion.div className="intro-content" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="intro-image-card"><img src={IMAGES.introCard} alt="Introduction Visual"/></div>
            <div className="intro-text-list">
              <motion.div className="intro-item" whileHover={{ x: 10 }}><div className="intro-question-bar"><span className="square-icon"/><h2>小馬俱樂部在做什麼？</h2></div><p className="intro-desc">小馬俱樂部成立於2026年4月，其主要成立目的為建立友善的賽馬娘交流空間，使成員可以自由地分享對於賽馬娘的愛好，平時舉辦不定期的馬娃聚會與群聚練馬社群日，希望活絡賽馬娘的遊玩風氣。</p></motion.div>
              <motion.div className="intro-item" whileHover={{ x: 10 }}><div className="intro-question-bar"><span className="square-icon"/><h2>賽馬娘是什麼？</h2></div><p className="intro-desc">《賽馬娘》（全稱《賽馬娘 Pretty Derby》，日語：ウマ娘 プリティーダービー）是由日本遊戲公司 Cygames 企劃與製作的跨媒體大型 IP，作品將日本及世界歷史上的真實傳奇競賽馬「萌擬人化」為擁有獸耳與尾巴的少女。</p></motion.div>
            </div>
            <motion.button className="img-btn join-btn" onClick={() => { window.location.href = "/contact"; }} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}><img src={IMAGES.joinBtn} alt="加入我們"/></motion.button>
          </motion.div>
        </section>

        {/* 3. 影片 Video Coverflow */}
        <section className="video-section">
          <div className="double-line-divider top-divider"/>
          <motion.div className="section-title-wrapper video-title-wrapper" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><img src={IMAGES.videoTitle} alt="VIDEO" className="title-img video-title-img"/></motion.div>
          <div className="video-carousel-shell">
            <img src={IMAGES.decoHorse} alt="" className="deco-horse horse-top"/>
            <img src={IMAGES.decoHorse} alt="" className="deco-horse horse-bottom"/>
            <motion.div className="video-carousel" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <button type="button" className="video-nav-btn video-nav-prev" onClick={() => changeVideo(-1)} aria-label="上一部影片" disabled={videos.length < 2}>‹</button>
              <div className="video-coverflow-stage">
                {videos.length > 0 ? (
                  videos.map((video, index) => {
                    // Keep every video mounted so cards animate between positions.
                    // The shortest circular distance determines its Coverflow slot.
                    const total = videos.length;
                    let offset = (index - videoIndex + total) % total;
                    if (offset > total / 2) offset -= total;

                    const isActive = offset === 0;
                    const isVisible = Math.abs(offset) <= 1;
                    const id = getYouTubeId(video?.url);

                    return (
                      <motion.div
                        key={video?.url || index}
                        className={`video-card coverflow-card ${isActive ? 'coverflow-active' : 'coverflow-side'}`}
                        initial={false}
                        animate={{
                          x: `${offset * 78}%`,
                          rotateY: offset * -35,
                          scale: isActive ? 1 : 0.78,
                          opacity: isVisible ? (isActive ? 1 : 0.8) : 0,
                          zIndex: isActive ? 3 : isVisible ? 2 : 0,
                        }}
                        transition={{
                          x: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                          rotateY: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                          scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                          opacity: { duration: 0.45, ease: 'easeInOut' },
                          zIndex: { duration: 0 },
                        }}
                        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
                        onClick={() => {
                          if (!isActive && isVisible) changeVideo(offset);
                        }}
                      >
                        {isActive && playingVideoIndex === index && id ? (
                          <iframe
                            key={`player-${id}`}
                            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                            title={video?.title || 'Current Video'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        ) : id ? (
                          <button
                            type="button"
                            className="video-thumbnail-button"
                            aria-label={isActive ? `播放 ${video?.title || '影片'}` : `切換至 ${video?.title || '影片'}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (isActive) {
                                setPlayingVideoIndex(index);
                              } else if (isVisible) {
                                changeVideo(offset);
                              }
                            }}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                              alt={video?.title || 'Video thumbnail'}
                              loading={isVisible ? 'eager' : 'lazy'}
                            />
                            {isActive && <span className="video-play-icon" aria-hidden="true">▶</span>}
                          </button>
                        ) : (
                          <div className="video-empty-state">影片連結無效</div>
                        )}
                        {video?.title && (
                          <div className="video-caption">{video.title}</div>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="video-empty-state">載入影片中…</div>
                )}
              </div>
              <button type="button" className="video-nav-btn video-nav-next" onClick={() => changeVideo(1)} aria-label="下一部影片" disabled={videos.length < 2}>›</button>
              {/* 圓點位於輪播內；選取指示器只沿 X 軸滑動 */}
              {videos.length > 0 && (
                <div className="carousel-dots" role="group" aria-label="選擇影片">
                  <motion.span
                    className="dot-indicator"
                    aria-hidden="true"
                    initial={false}
                    animate={{ x: videoIndex * 28 }}
                    transition={{ type: 'tween', duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {videos.map((video, index) => (
                    <button
                      key={video?.url || index}
                      type="button"
                      className="dot"
                      aria-label={`切換至第 ${index + 1} 部影片`}
                      aria-current={videoIndex === index ? 'true' : undefined}
                      onClick={() => setVideoIndex(index)}
                    />
                  ))}
                </div>
              )}

            </motion.div>
          </div>
          
          {/* Footer 直接放在影片頁底部，不再佔用獨立的第四頁 */}
          <footer className="site-footer">
            <img src={IMAGES.heroLogo} alt="Pretty Derby Club Logo" className="footer-logo-img" />
            <nav className="footer-links" aria-label="頁尾導覽">
              {NAV_ITEMS.map((item) => (
                <a key={item.english} href={item.href} onClick={item.href === '#home' ? goHome : undefined}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="footer-divider" />
            <p className="footer-copyright">© 2026 Pretty Derby Club. All Rights Reserved.</p>
          </footer>
        </section>
      </motion.div>

      {/* 側邊滑出選單 */}
      <div className={`menu-overlay ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen}/>
      <aside className={`side-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen} aria-label="網站選單">
        <button type="button" className="menu-close" onClick={() => setMenuOpen(false)} aria-label="關閉選單">×</button>
        <a href="/" className="side-menu-logo-link" aria-label="返回首頁" onClick={goHome}>
          <img src={IMAGES.heroLogo} alt="Pretty Derby Club" className="side-menu-logo"/>
        </a>
        <nav className="side-menu-nav">{NAV_ITEMS.slice(1).map((item) => <a key={item.english} href={item.href} onClick={() => setMenuOpen(false)}><span>{item.label}</span><small>{item.english}</small></a>)}</nav>
      </aside>
    </div>);
}
