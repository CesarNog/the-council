import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { CouncilScene } from "./CouncilScene.jsx";

export default function LandingHero3D({
  activePersona,
  onPersonaHover,
  ctaHover,
  reducedMotion,
  mobile = false,
}) {
  const mouse = useRef({ x: 0, y: 0 });

  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  return (
    <div
      className="landing-hero-canvas"
      onPointerMove={onPointerMove}
      role="img"
      aria-label="An abstract 3D council chamber with nine symbolic seats surrounding a glowing decision orb."
    >
      <Canvas
        camera={{ position: [0, 2.35, 7.8], fov: mobile ? 45 : 33 }}
        dpr={mobile ? [1, 1.5] : [1, 1.75]}
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
            mobile={mobile}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
