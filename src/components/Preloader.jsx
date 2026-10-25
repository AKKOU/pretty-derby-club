
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./Preloader.css";

const MIN_DURATION = 650;
const MAX_DURATION = 8000;
const QUIET_DURATION = 350;

export default function Preloader({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [displayLoading, setDisplayLoading] = useState(true);
  const runId = useRef(0);

  useEffect(() => {
    const currentRun = ++runId.current;
    const startedAt = performance.now();
    const timers = new Set();
    let observer;
    let finished = false;
    let quietTimer;

    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
      return timer;
    };

    const clearScheduled = (timer) => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
        timers.delete(timer);
      }
    };

    const finish = () => {
      if (finished || currentRun !== runId.current) return;

      finished = true;
      const elapsed = performance.now() - startedAt;

      schedule(() => {
        if (currentRun === runId.current) {
          setLoading(false);
          setDisplayLoading(false);
        }
      }, Math.max(0, MIN_DURATION - elapsed));
    };

    setLoading(true);
    setDisplayLoading(true);

    // 每次有新圖片或 DOM 更新時，重新等待畫面穩定。
    const checkReady = async () => {
      clearScheduled(quietTimer);

      quietTimer = schedule(async () => {
        if (finished || currentRun !== runId.current) return;

        const images = Array.from(
          document.querySelectorAll(
            ".pdc-preload-content img"
          )
        );

        const pending = images.filter((img) => !img.complete);

        if (pending.length > 0) {
          pending.forEach((img) => {
            img.addEventListener("load", checkReady, {
              once: true,
            });
            img.addEventListener("error", checkReady, {
              once: true,
            });
          });
          return;
        }

        if (document.fonts?.ready) {
          try {
            await document.fonts.ready;
          } catch {
            // 字型失敗時不阻擋頁面。
          }
        }

        if (currentRun !== runId.current || finished) return;

        finish();
      }, QUIET_DURATION);
    };

    const content = document.querySelector(
      ".pdc-preload-content"
    );

    if (content) {
      observer = new MutationObserver(checkReady);
      observer.observe(content, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["src", "srcset"],
      });
    }

    // 無論資源狀況如何，都有最長等待時間。
    const timeout = schedule(finish, MAX_DURATION);

    checkReady();

    return () => {
      runId.current += 1;
      observer?.disconnect();
      clearScheduled(timeout);
      timers.forEach(window.clearTimeout);
      timers.clear();
    };
  }, [location.pathname]);

  return (
    <>
      <div className="pdc-preload-content">
        {children}
      </div>

      <AnimatePresence>
        {displayLoading && (
          <motion.div
            className="pdc-preloader"
            role="status"
            aria-label="頁面載入中"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.img
              className="pdc-preloader-horse"
              src="/images/deco-horse.png"
              alt=""
              animate={{
                y: [0, -32, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <p className="pdc-preloader-text">
              LOADING...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
