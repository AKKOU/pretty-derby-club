
import React, { useState } from "react";
import { motion } from "framer-motion";
import "./ContactPage.css";

const NAV_ITEMS = [
  { label: "首頁", english: "HOME", href: "/" },
  { label: "成員介紹", english: "MEMBERS", href: "/members" },
  { label: "活動", english: "EVENTS", href: "/events" },
  { label: "聯繫我們", english: "CONTACT", href: "/contact" },
];

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    friendCode: "",
    message: "",
  });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // 尚未串接後端或表單服務
    // 這裡可以接 EmailJS、Formspree 或自己的 API
    console.log("Contact form:", form);
    alert("表單已填寫完成！目前尚未串接正式送出服務。");
  };

  return (
    <div className="contact-page">
      {/* 左上角 MENU */}
      <motion.button
        type="button"
        className="contact-menu-btn"
        aria-label="開啟選單"
        onClick={() => setMenuOpen(true)}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <img src="/images/btn-menu.png" alt="MENU" />
      </motion.button>

      <main className="contact-content">
        {/* 頂端標題 */}
        <motion.img
          className="contact-title"
          src="/images/title-contact.png"
          alt="CONTACT"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        />

        {/* 回饋表單 */}
        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="contact-field">
            <label htmlFor="contact-name">姓名:</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              placeholder="請輸入您的姓名"
              value={form.name}
              onChange={updateField}
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">信箱:</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              placeholder="請輸入您的電子信箱"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-friend-code">
              賽馬娘好友代碼:
            </label>
            <input
              id="contact-friend-code"
              name="friendCode"
              type="text"
              placeholder="請輸入您的賽馬娘好友代碼"
              value={form.friendCode}
              onChange={updateField}
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">
              想對我們說的話:
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              placeholder="歡迎留下您的意見或想對我們說的話..."
              value={form.message}
              onChange={updateField}
              required
            />
          </div>

          <motion.button
            type="submit"
            className="contact-submit-btn"
            whileHover={{ scale: 1.06, y: -4 }}
            whileTap={{ scale: 0.95 }}
            aria-label="送出表單"
          >
            <img src="/images/btn-submit.png" alt="送出" />
          </motion.button>
        </motion.form>
      </main>

      {/* Footer */}
      <footer className="contact-footer">
        <img
          src="/images/hero-logo.png"
          alt="Pretty Derby Club"
          className="contact-footer-logo"
        />

        <nav className="contact-footer-links">
          {NAV_ITEMS.map((item) => (
            <a key={item.english} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="contact-footer-divider" />

        <p>
          © 2026 Pretty Derby Club. All Rights Reserved.
        </p>
      </footer>

      {/* MENU 背景遮罩 */}
      <div
        className={`contact-menu-overlay ${
          menuOpen ? "is-open" : ""
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* 側邊導覽選單 */}
      <aside
        className={`contact-side-menu ${
          menuOpen ? "is-open" : ""
        }`}
        aria-label="網站選單"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <button
          type="button"
          className="contact-menu-close"
          onClick={() => setMenuOpen(false)}
          aria-label="關閉選單"
        >
          ×
        </button>

        <a href="/" className="contact-menu-logo-link">
          <img
            src="/images/hero-logo.png"
            alt="Pretty Derby Club"
          />
        </a>

        <nav className="contact-side-menu-nav">
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
