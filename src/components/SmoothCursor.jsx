import React, { useEffect, useRef, useState } from 'react';

export default function SmoothCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isWhatsAppHover, setIsWhatsAppHover] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Instant update for inner dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check hover targets
      const target = e.target;
      if (target) {
        const isInteractive = target.closest('button, a, input, select, textarea, .btn, .glass-panel, [role="button"]');
        const isWA = target.closest('.btn-whatsapp');
        setIsHovered(!!isInteractive);
        setIsWhatsAppHover(!!isWA);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // 240Hz rAF Animation Loop with Lerp physics
    let animationFrameId;
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const render = () => {
      // 0.22 factor gives ultra-smooth 240Hz high-refresh response
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.22);
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.22);

      if (ringRef.current) {
        const scale = isClicked ? 0.75 : isHovered ? 1.6 : 1;
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${scale})`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, isClicked]);

  return (
    <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 999999, overflow: 'hidden' }}>
      
      {/* Outer 240Hz Smooth Lerp Ring */}
      <div 
        ref={ringRef}
        style={{
          position: 'absolute',
          top: -20,
          left: -20,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: isWhatsAppHover 
            ? '2px solid rgba(37, 211, 102, 0.8)' 
            : isHovered 
            ? '2px solid rgba(6, 182, 212, 0.85)' 
            : '1.5px solid rgba(59, 130, 246, 0.5)',
          background: isWhatsAppHover
            ? 'radial-gradient(circle, rgba(37, 211, 102, 0.15) 0%, rgba(37, 211, 102, 0) 70%)'
            : isHovered
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0) 70%)'
            : 'transparent',
          boxShadow: isWhatsAppHover
            ? '0 0 15px rgba(37, 211, 102, 0.4)'
            : isHovered
            ? '0 0 20px rgba(6, 182, 212, 0.45)'
            : '0 0 10px rgba(59, 130, 246, 0.2)',
          transition: 'border 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
          willChange: 'transform',
          pointerEvents: 'none'
        }}
      />

      {/* Inner Crisp Center Dot */}
      <div 
        ref={dotRef}
        style={{
          position: 'absolute',
          top: -4,
          left: -4,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isWhatsAppHover
            ? '#25d366'
            : isHovered
            ? '#22d3ee'
            : '#3b82f6',
          boxShadow: isWhatsAppHover
            ? '0 0 10px #25d366'
            : isHovered
            ? '0 0 12px #22d3ee'
            : '0 0 8px #3b82f6',
          willChange: 'transform',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
