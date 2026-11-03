import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 3 },
        // 1. Multi-stop Diagonal Linear Gradient (135deg angle)
        // Stops: Top-Left: #583714 | Mid-Light: #FFE997 | Bottom-Right: #A37836 transitioning into #FFE997
        background: 'linear-gradient(135deg, #583714 0%, #7D511E 20%, #FFE997 50%, #A37836 78%, #FFE997 100%)',
        // 2. Ray Light Flare Effect (Top-Left Light Beam):
        // Translucent light flare from top-left blended using mix-blend-mode: screen
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-25%',
          left: '-20%',
          width: '95%',
          height: '95%',
          background: 'linear-gradient(125deg, rgba(255, 233, 151, 0.45) 0%, rgba(255, 233, 151, 0.18) 45%, transparent 70%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 0,
        },
        // 3. Floating Dust / Particle Glow Effect (Bokeh Particles):
        // Layered radial gradients (1px-4px) scattered around
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 18% 28%, rgba(255, 233, 151, 0.9) 0%, transparent 4px),
            radial-gradient(circle at 25% 72%, rgba(255, 233, 151, 0.8) 0%, transparent 3px),
            radial-gradient(circle at 75% 20%, rgba(255, 233, 151, 0.85) 0%, transparent 4px),
            radial-gradient(circle at 82% 65%, rgba(255, 233, 151, 0.95) 0%, transparent 5px),
            radial-gradient(circle at 45% 85%, rgba(255, 233, 151, 0.75) 0%, transparent 3px),
            radial-gradient(circle at 60% 12%, rgba(255, 233, 151, 0.8) 0%, transparent 4px),
            radial-gradient(circle at 12% 82%, rgba(255, 233, 151, 0.7) 0%, transparent 3px),
            radial-gradient(circle at 88% 35%, rgba(255, 233, 151, 0.85) 0%, transparent 4px)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* 4. Four-Point Sparkle / Lens Flare Star (Bottom-Right) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 28, sm: 45 },
          right: { xs: 28, sm: 65 },
          width: 36,
          height: 36,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.95,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            background: 'linear-gradient(to bottom, transparent, #FFE997 40%, #FFFFFF 50%, #FFE997 60%, transparent)',
            borderRadius: '999px',
          },
          '&::before': {
            left: '50%',
            top: 0,
            bottom: 0,
            width: 3,
            transform: 'translateX(-50%)',
            boxShadow: '0 0 14px 3px rgba(255, 233, 151, 0.95)',
          },
          '&::after': {
            top: '50%',
            left: 0,
            right: 0,
            height: 3,
            transform: 'translateY(-50%)',
            boxShadow: '0 0 14px 3px rgba(255, 233, 151, 0.95)',
          },
        }}
      />
      {/* Second Sparkle Star (Top-Left) */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 25, sm: 40 },
          left: { xs: 25, sm: 50 },
          width: 24,
          height: 24,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.8,
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            background: 'linear-gradient(to bottom, transparent, #FFE997 40%, #FFFFFF 50%, #FFE997 60%, transparent)',
            borderRadius: '999px',
          },
          '&::before': {
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2.5,
            transform: 'translateX(-50%)',
            boxShadow: '0 0 10px 2px rgba(255, 233, 151, 0.85)',
          },
          '&::after': {
            top: '50%',
            left: 0,
            right: 0,
            height: 2.5,
            transform: 'translateY(-50%)',
            boxShadow: '0 0 10px 2px rgba(255, 233, 151, 0.85)',
          },
        }}
      />
      <Outlet />
    </Box>
  );
}
