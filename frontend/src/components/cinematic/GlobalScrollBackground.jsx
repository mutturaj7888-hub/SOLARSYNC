import React, { useRef, useEffect, useState } from 'react';

/**
 * GlobalScrollBackground Component
 * Renders an ultra-high-definition (4K styled) cinematic background video
 * that persists across ALL pages and smoothly scrubs forward and backward
 * as the user scrolls on any page of the SolarSync platform.
 */
export default function GlobalScrollBackground({ opacity = 0.55 }) {
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const animFrameRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Metadata loaded - initialize duration and freeze playback
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur)) {
        setDuration(dur);
        setIsReady(true);
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  // Scroll listener that updates target video currentTime on ANY page
  useEffect(() => {
    const handleScroll = () => {
      if (!duration || duration <= 0) return;
      const el = document.documentElement;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        const scrolled = window.scrollY || window.pageYOffset;
        const progress = Math.max(0, Math.min(1, scrolled / scrollHeight));
        targetTimeRef.current = progress * duration;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [duration]);

  // 60 FPS lerp interpolation loop for ultra-smooth scrubbing forward and backward
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const target = targetTimeRef.current;
      const current = currentTimeRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.006) {
        const nextTime = current + diff * 0.16;
        currentTimeRef.current = nextTime;

        if (video.readyState >= 2) {
          try {
            video.currentTime = nextTime;
          } catch (e) {}
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [duration]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      zIndex: -1,
      pointerEvents: 'none',
      background: '#070C18'
    }}>
      {/* 4K Enhanced HTML5 Video Element */}
      <video
        ref={videoRef}
        src="/solarsync-hero.mp4"
        playsInline
        muted
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: isReady ? opacity : 0,
          transition: 'opacity 0.8s ease',
          // 4K Ultra-Definition Post-Processing Filter Pipeline
          filter: 'contrast(1.18) saturate(1.28) brightness(0.82) hue-rotate(-2deg)',
          imageRendering: 'crisp-edges',
          transform: 'scale(1.02)' // Prevents edge bleed during sub-pixel rendering
        }}
      />

      {/* Cinematic Depth Gradient & Vignette Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse at 50% 30%, transparent 25%, rgba(10, 15, 29, 0.82) 80%),
          linear-gradient(180deg, rgba(10, 15, 29, 0.72) 0%, rgba(10, 15, 29, 0.45) 50%, rgba(10, 15, 29, 0.92) 100%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Micro Clean-Energy Grid Pattern Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(16, 185, 129, 0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(16, 185, 129, 0.035) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      {/* Ambient Radial Energy Glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}

