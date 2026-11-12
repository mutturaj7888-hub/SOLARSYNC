import React, { useRef, useEffect, useState } from 'react';

/**
 * ScrollVideo Component
 * Seamlessly binds window scroll progress to HTML5 video currentTime
 * Using requestAnimationFrame with linear interpolation (lerp) for buttery smooth forward & backward playback.
 */
export default function ScrollVideo({ scrollProgress = 0, videoSrc = '/solarsync-hero.mp4' }) {
  const videoRef = useRef(null);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const animFrameRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // When metadata loads, capture video duration and pause automatic playback
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur)) {
        setDuration(dur);
        setIsVideoReady(true);
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  // Sync scrollProgress (0 to 1) to target time
  useEffect(() => {
    if (duration > 0) {
      const bounded = Math.max(0, Math.min(1, scrollProgress));
      targetTimeRef.current = bounded * duration;
    }
  }, [scrollProgress, duration]);

  // Smooth lerp frame scrubbing loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const target = targetTimeRef.current;
      const current = currentTimeRef.current;
      const diff = target - current;

      // Only seek when difference is noticeable to prevent browser seek contention
      if (Math.abs(diff) > 0.008) {
        // Smooth lerp factor (0.18 gives snappy yet cinematic feel)
        const nextTime = current + diff * 0.18;
        currentTimeRef.current = nextTime;

        if (video.readyState >= 2) {
          try {
            video.currentTime = nextTime;
          } catch (e) {
            // Ignore minor seek interruptions
          }
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
      zIndex: 0,
      pointerEvents: 'none',
      background: '#070C18'
    }}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline
        muted
        preload="auto"
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => setVideoError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: isVideoReady ? 0.72 : 0,
          transition: 'opacity 0.6s ease-in-out',
          filter: 'contrast(1.08) saturate(1.15) brightness(0.85)'
        }}
      />

      {/* Cinematic Dark Gradient & Vignette Overlays for Maximum Legibility */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at center, transparent 35%, rgba(10, 15, 29, 0.85) 90%),
          linear-gradient(180deg, rgba(10, 15, 29, 0.75) 0%, rgba(10, 15, 29, 0.45) 40%, rgba(10, 15, 29, 0.85) 100%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Subtle Clean Energy Grid Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        pointerEvents: 'none'
      }} />

      {/* Fallback if video error occurs */}
      {videoError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 30%, #064E3B 0%, #0A0F1D 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '0.85rem'
        }}>
          Cinematic Visual Stream
        </div>
      )}
    </div>
  );
}

