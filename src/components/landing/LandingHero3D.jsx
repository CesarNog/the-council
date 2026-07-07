import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CouncilScene } from "./PersonaOrbit3D.jsx";

export default function LandingHero3D({
  activePersona,
  onPersonaHover,
  ctaHover,
  reducedMotion,
}) {
  const mouse = useRef({ x: 0, y: 0 });

  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  return (
    <div className="landing-hero-canvas" onPointerMove={onPointerMove} role="presentation">
      <Canvas
        camera={{ position: [0, 1.8, 5.5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reducedMotion ? "demand" : "always"}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <CouncilScene
            activePersona={activePersona}
            onPersonaHover={onPersonaHover}
            ctaHover={ctaHover}
            mouse={mouse}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
