import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PERSONAS } from "../../lib/personas.js";
import { CouncilPersonaMarker } from "./CouncilPersonaMarker.jsx";

// ---------------------------------------------------------------------------
// Floating dust motes — low-count, performant
// ---------------------------------------------------------------------------
function CouncilDust({ reducedMotion, mobile }) {
  const ref = useRef();
  const count = mobile ? 60 : 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 9;
      arr[i * 3 + 1] = Math.random() * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 9;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#C9A96E" transparent opacity={0.28} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Council chamber floor — dark polished disc + engravings + table ring
// ---------------------------------------------------------------------------
function CouncilFloor() {
  return (
    <group>
      {/* Main dark floor disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} receiveShadow>
        <circleGeometry args={[5, 96]} />
        <meshStandardMaterial color="#060508" metalness={0.6} roughness={0.55} />
      </mesh>

      {/* Outer engraving ring — faint gold */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0]}>
        <ringGeometry args={[3.8, 3.82, 96]} />
        <meshBasicMaterial color="#C9A96E" transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Council seat ring — main visual ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <ringGeometry args={[2.0, 2.52, 96]} />
        <meshStandardMaterial
          color="#1a1422"
          emissive="#C9A96E"
          emissiveIntensity={0.06}
          metalness={0.75}
          roughness={0.4}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Gold torus rim — raised edge of the table ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 0]}>
        <torusGeometry args={[2.26, 0.022, 16, 120]} />
        <meshStandardMaterial
          color="#C9A96E"
          emissive="#C9A96E"
          emissiveIntensity={0.45}
          metalness={1}
          roughness={0.12}
        />
      </mesh>

      {/* Inner ring — inner edge of table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.13, 0]}>
        <torusGeometry args={[2.0, 0.015, 12, 96]} />
        <meshStandardMaterial color="#C9A96E" emissive="#C9A96E" emissiveIntensity={0.3} metalness={1} roughness={0.15} />
      </mesh>

      {/* Nine seat markers on the table ring */}
      {PERSONAS.map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const r = 2.26;
        return (
          <mesh key={i} position={[Math.cos(a) * r, -0.1, Math.sin(a) * r]}>
            <cylinderGeometry args={[0.025, 0.025, 0.55, 12]} />
            <meshStandardMaterial color="#C9A96E" emissive="#C9A96E" emissiveIntensity={0.2} metalness={0.95} roughness={0.15} />
          </mesh>
        );
      })}

      {/* Center pedestal base */}
      <mesh position={[0, -0.14, 0]}>
        <cylinderGeometry args={[0.36, 0.44, 0.08, 32]} />
        <meshStandardMaterial color="#0e0c16" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Subtle floor reflection disc under orb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]}>
        <circleGeometry args={[0.8, 48]} />
        <meshBasicMaterial color="#C9A96E" transparent opacity={0.04} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Decision Orb — breathes, anchors the scene
// ---------------------------------------------------------------------------
function DecisionOrb({ ctaHover, reducedMotion }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const glowLightRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Inner orb — pulse breathing
    if (innerRef.current) {
      const pulse = ctaHover ? 1.15 : 1;
      const breathe = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.06;
      innerRef.current.scale.setScalar(pulse + breathe);
      innerRef.current.material.emissiveIntensity +=
        ((ctaHover ? 1.4 : 0.9) + (reducedMotion ? 0 : Math.sin(t * 1.1) * 0.15)
          - innerRef.current.material.emissiveIntensity) * 0.08;
    }

    // Outer glass shell — slower drift
    if (outerRef.current && !reducedMotion) {
      outerRef.current.rotation.y = t * 0.15;
      outerRef.current.rotation.z = Math.sin(t * 0.4) * 0.04;
    }

    // Dynamic light intensity
    if (glowLightRef.current) {
      const target = ctaHover ? 3.5 : 2.2;
      const breatheI = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.3;
      glowLightRef.current.intensity += (target + breatheI - glowLightRef.current.intensity) * 0.07;
    }
  });

  return (
    <group position={[0, 0.14, 0]}>
      {/* Glass outer shell */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshPhysicalMaterial
          color="#EDE0C8"
          metalness={0}
          roughness={0.0}
          transmission={0.65}
          thickness={0.8}
          ior={1.6}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Inner glowing core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.21, 24, 24]} />
        <meshStandardMaterial
          color="#FDF0D8"
          emissive="#C9A96E"
          emissiveIntensity={0.9}
          metalness={0.2}
          roughness={0.05}
        />
      </mesh>

      {/* Orb key light — main golden illumination */}
      <pointLight ref={glowLightRef} color="#D4A855" intensity={2.2} distance={6} decay={1.8} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Ring group — rotates slowly, tilts toward active persona
// ---------------------------------------------------------------------------
function CouncilRing({ activePersona, reducedMotion, onPersonaHover, ctaHover }) {
  const groupRef = useRef();
  const targetRotY = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!reducedMotion) {
      const idx = PERSONAS.findIndex((p) => p.id === activePersona);
      if (idx >= 0) {
        const targetAngle = -(idx / 9) * Math.PI * 2 + Math.PI / 2;
        targetRotY.current += (targetAngle - targetRotY.current) * 0.025;
      }
      groupRef.current.rotation.y = targetRotY.current + delta * 0.05;
      targetRotY.current += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {PERSONAS.map((p, i) => (
        <CouncilPersonaMarker
          key={p.id}
          persona={p}
          index={i}
          active={activePersona}
          onHover={onPersonaHover}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera rig — gentle parallax from mouse
// ---------------------------------------------------------------------------
function CameraRig({ mouse, reducedMotion, activePersona }) {
  const { camera } = useThree();

  useFrame(() => {
    if (reducedMotion) return;
    const idx = PERSONAS.findIndex((p) => p.id === activePersona);
    const focusX = idx >= 0 ? Math.cos((idx / 9) * Math.PI * 2 - Math.PI / 2) * 0.18 : 0;

    camera.position.x += (mouse.current.x * 0.28 + focusX - camera.position.x) * 0.032;
    camera.position.y += (1.5 + mouse.current.y * -0.1 - camera.position.y) * 0.032;
    camera.lookAt(focusX * 0.4, 0.06, 0);
  });
  return null;
}

// ---------------------------------------------------------------------------
// Full scene
// ---------------------------------------------------------------------------
export function CouncilScene({ activePersona, onPersonaHover, ctaHover, mouse, reducedMotion, mobile }) {
  return (
    <>
      <color attach="background" args={["#040307"]} />
      <fog attach="fog" args={["#040307", 6, 14]} />

      {/* Lighting rig */}
      <ambientLight intensity={0.12} color="#200a30" />
      <spotLight
        position={[0, 5.5, 1.5]}
        angle={0.5}
        penumbra={0.9}
        intensity={0.6}
        color="#C9A96E"
        castShadow={false}
      />
      {/* Cool rim from behind-left */}
      <pointLight position={[-4, 2.5, -2.5]} intensity={0.18} color="#5060a8" />
      {/* Warm rim from right */}
      <pointLight position={[3.5, 1.5, 2]} intensity={0.14} color="#8b5030" />
      {/* Under-table ambient glow */}
      <pointLight position={[0, -0.5, 0]} intensity={0.3} color="#C9A96E" distance={3} decay={2} />

      <CameraRig mouse={mouse} reducedMotion={reducedMotion} activePersona={activePersona} />

      <CouncilFloor />
      <DecisionOrb ctaHover={ctaHover} reducedMotion={reducedMotion} />
      <CouncilRing
        activePersona={activePersona}
        reducedMotion={reducedMotion}
        onPersonaHover={onPersonaHover}
        ctaHover={ctaHover}
      />
      <CouncilDust reducedMotion={reducedMotion} mobile={mobile} />
    </>
  );
}
