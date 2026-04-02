import { useState, useEffect } from 'react';
import welcomeAnimationLogo from '../../welcome_animation_logo.png';

/* ═══════════════════════════════════════════════
   WELCOME ANIMATION — RayanFinTech
   Modified: Supports both Light & Dark themes natively.
   ═══════════════════════════════════════════════ */
export default function WelcomeAnimation({ onComplete, animationSpeed = 1 }) {
  const [phase, setPhase] = useState(0); // 0=sphere, 1=expand, 2=beams, 3=exit
  
  // Adjusted timings based on animationSpeed
  const t1_delay = 1500 / animationSpeed;
  const t2_delay = 2000 / animationSpeed;
  const t3_delay = 3000 / animationSpeed;
  const t4_delay = 3700 / animationSpeed;
  
  // Read the saved theme from localStorage synchronously to avoid flicker
  const [isDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const t = isDark ? {
    // Dark Theme: Green accent (#A3FF12)
    bgStart: '#141414',
    bgEnd: '#0a0a0a',
    sphereInner: 'rgba(163, 255, 18, 0.12)',
    sphereOuter: 'rgba(163, 255, 18, 0.04)',
    sphereExpandedInner: '#0e140a', // Soft dark green cast
    sphereExpandedOuter: '#0a0a0a',
    halo: 'rgba(163, 255, 18, 0.15)',
    glowCore: 'rgba(163, 255, 18, 0.15)',
    glowAura: 'rgba(163, 255, 18, 0.06)',
    rays: 'rgba(163, 255, 18, 0.25)', // Green rays
    logoStartFilter: 'drop-shadow(0 0 15px rgba(163, 255, 18, 0.4)) drop-shadow(0 0 30px rgba(163, 255, 18, 0.15))',
    logoEndFilter: 'brightness(2.5) saturate(0) drop-shadow(0 0 25px rgba(255,255,255,0.4))'
  } : {
    // Light Theme: Orange accent (#FF9500 / #d4891a)
    bgStart: '#fcfaf7',       // Very soft misty warm white
    bgEnd: '#ffffff',         // Pristine white
    sphereInner: 'rgba(255, 149, 0, 0.12)',
    sphereOuter: 'rgba(255, 149, 0, 0.04)',
    sphereExpandedInner: '#fffaf5',
    sphereExpandedOuter: '#ffffff',
    halo: 'rgba(255, 149, 0, 0.15)',
    glowCore: 'rgba(255, 149, 0, 0.12)',
    glowAura: 'rgba(255, 149, 0, 0.05)',
    rays: 'rgba(255, 149, 0, 0.3)', // Orange rays
    logoStartFilter: 'drop-shadow(0 10px 15px rgba(255, 149, 0, 0.15)) drop-shadow(0 4px 6px rgba(255, 149, 0, 0.08))',
    logoEndFilter: 'brightness(1.05) drop-shadow(0 15px 30px rgba(0, 0, 0, 0.15))'
  };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), t1_delay);
    const t2 = setTimeout(() => setPhase(2), t2_delay);
    const t3 = setTimeout(() => setPhase(3), t3_delay);
    const t4 = setTimeout(() => { if (onComplete) onComplete(); }, t4_delay);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete, t1_delay, t2_delay, t3_delay, t4_delay]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: phase >= 1 ? t.bgEnd : t.bgStart,
      transition: 'background-color 1s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      transform: phase === 3 ? 'translateY(-100%)' : 'translateY(0)',
      transition: phase === 3 ? 'transform 0.65s cubic-bezier(0.76, 0, 0.24, 1)' : 'background-color 1s ease',
    }}>

      {/* ── Expanding Sphere Phase 1 -> 2 ── */}
      <div style={{
        position: 'absolute',
        width: phase >= 1 ? '300vmax' : '280px',
        height: phase >= 1 ? '300vmax' : '280px',
        borderRadius: '50%',
        background: phase >= 1
          ? `radial-gradient(ellipse at center, ${t.sphereExpandedInner} 0%, ${t.sphereExpandedOuter} 60%)`
          : `radial-gradient(ellipse at center, ${t.sphereInner} 0%, ${t.sphereOuter} 60%, transparent 80%)`,
        boxShadow: phase >= 1
          ? 'none'
          : `0 0 60px 20px ${t.glowCore}, 0 0 120px 60px ${t.glowAura}`,
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {phase < 1 && (
          <div style={{
            position: 'absolute',
            width: '240px', height: '240px',
            borderRadius: '50%',
            border: `1px solid ${t.halo}`,
            animation: 'spherePulse 2s ease-in-out infinite',
          }} />
        )}
      </div>

      {/* ── Outer halo ring (phase 0 only) ── */}
      {phase < 1 && (
        <div style={{
          position: 'absolute',
          width: '330px', height: '330px',
          borderRadius: '50%',
          border: `1px solid ${t.halo}`,
          animation: 'spherePulse 2.5s ease-in-out 0.3s infinite',
        }} />
      )}

      {/* ── Radial Beams (phase 2) ── */}
      {phase >= 2 && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 0.6s ease',
          animation: 'beamFadeIn 0.5s ease forwards',
        }}>
          {[...Array(16)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: '1px',
              height: '45vmax',
              background: `linear-gradient(to top, transparent, ${t.rays}, transparent)`,
              transformOrigin: 'bottom center',
              transform: `rotate(${i * 22.5}deg) translateX(-50%)`,
              left: '50%',
              top: 0,
              animation: `beamShimmer 1.5s ease-in-out ${i * 0.05}s infinite alternate`,
            }} />
          ))}
        </div>
      )}

      {/* ── LOGO ONLY ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        animation: 'logoEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}>
        <div style={{
          position: 'relative',
          filter: phase >= 1 ? t.logoEndFilter : t.logoStartFilter,
          transition: 'filter 0.8s ease',
        }}>
          <img
            src={welcomeAnimationLogo}
            alt="Logo"
            style={{
              width: '180px', height: '180px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes spherePulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes logoEntrance {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1.1); }
        }
        @keyframes beamFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes beamShimmer {
          from { opacity: 0.1; transform: rotate(var(--r)) scaleY(0.7) translateX(-50%); }
          to   { opacity: 0.6;  transform: rotate(var(--r)) scaleY(1.2) translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
