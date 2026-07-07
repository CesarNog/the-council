import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { PERSONAS } from "../../lib/personas.js";

const SHAPE = {
  founder: "box",
  billionaire: "monolith",
  artist: "torus",
  athlete: "cone",
  monk: "sphere",
  scientist: "icosa",
  explorer: "tetra",
  romantic: "gem",
  shadow: "shard",
};

function PersonaGeometry({ type }) {
  switch (type) {
    case "box":
      return <boxGeometry args={[0.28, 0.28, 0.28]} />;
    case "monolith":
      return <boxGeometry args={[0.16, 0.36, 0.16]} />;
    case "torus":
      return <torusKnotGeometry args={[0.12, 0.035, 48, 8]} />;
    case "cone":
      return <coneGeometry args={[0.16, 0.32, 4]} />;
    case "sphere":
      return <sphereGeometry args={[0.17, 16, 16]} />;
    case "icosa":
      return <icosahedronGeometry args={[0.2, 0]} />;
    case "tetra":
      return <tetrahedronGeometry args={[0.22, 0]} />;
    case "gem":
      return <octahedronGeometry args={[0.2, 0]} />;
    default:
      return <octahedronGeometry args={[0.18, 0]} />;
  }
}

function PersonaNode({ persona, index, active, onHover, reducedMotion }) {
  const mesh = useRef();
  const halo = useRef();
  const angle = useMemo(() => (index / 9) * Math.PI * 2 - Math.PI / 2, [index]);
  const basePos = useMemo(() => new THREE.Vector3(Math.cos(angle) * 2.35, 0.08, Math.sin(angle) * 2.35), [angle]);
  const color = persona.color;
  const isActive = active === persona.id;
  const shape = SHAPE[persona.id] || "shard";

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    if (!reducedMotion) {
      mesh.current.rotation.y += 0.006;
      mesh.current.rotation.x = Math.sin(t * 0.5 + index) * 0.08;
      mesh.current.position.y = basePos.y + Math.sin(t * 0.9 + index * 0.7) * 0.04;
    }
    const scale = isActive ? 1.45 : 1;
    mesh.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    if (halo.current) {
      halo.current.scale.lerp(new THREE.Vector3(isActive ? 1.6 : 1, isActive ? 1.6 : 1, 1), 0.1);
      halo.current.material.opacity = isActive ? 0.55 : 0.12;
    }
  });

  return (
    <group position={basePos}>
      <mesh ref={halo} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        ref={mesh}
        onPointerOver={(e) => { e.stopPropagation(); onHover?.(persona.id); }}
        onPointerOut={() => onHover?.(null)}
      >
        <PersonaGeometry type={shape} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1.5 : 0.4}
          metalness={0.75}
          roughness={0.18}
        />
      </mesh>
      {persona.id === "monk" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.26, 0.34, 32]} />
          <meshBasicMaterial color="#E8E0D0" transparent opacity={isActive ? 0.5 : 0.2} side={THREE.DoubleSide} />
        </mesh>
      )}
      {isActive && <pointLight color={color} intensity={2.5} distance={3.5} />}
    </group>
  );
}

function CouncilTable({ ctaHover, activePersona, reducedMotion }) {
  const ring = useRef();
  const orb = useRef();
  const targetRot = useRef(0);

  useFrame((_, delta) => {
    if (ring.current && !reducedMotion) {
      const idx = PERSONAS.findIndex((p) => p.id === activePersona);
      if (idx >= 0) {
        targetRot.current = -(idx / 9) * Math.PI * 2 + Math.PI / 2;
      }
      ring.current.rotation.y += (targetRot.current - ring.current.rotation.y) * 0.03;
      ring.current.rotation.y += delta * 0.04;
    }
    if (orb.current) {
      const pulse = ctaHover ? 1.25 : 0.85;
      orb.current.material.emissiveIntensity += (pulse - orb.current.material.emissiveIntensity) * 0.08;
    }
  });

  return (
    <group ref={ring}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <circleGeometry args={[3.2, 64]} />
        <meshStandardMaterial color="#08070f" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[1.65, 2.55, 64]} />
        <meshStandardMaterial
          color="#1a1520"
          emissive="#C9A96E"
          emissiveIntensity={0.08}
          metalness={0.85}
          roughness={0.3}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <torusGeometry args={[2.1, 0.025, 16, 100]} />
        <meshStandardMaterial color="#C9A96E" emissive="#C9A96E" emissiveIntensity={0.35} metalness={1} roughness={0.15} />
      </mesh>
      {[...Array(9)].map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 2.1, 0.02, Math.sin(a) * 2.1]}>
            <boxGeometry args={[0.04, 0.5, 0.04]} />
            <meshStandardMaterial color="#C9A96E" emissive="#C9A96E" emissiveIntensity={0.15} metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.42, 0.48, 0.06, 32]} />
        <meshStandardMaterial color="#12101a" metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh ref={orb} position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial
          color="#F5E6C8"
          emissive="#C9A96E"
          emissiveIntensity={0.85}
          metalness={0.4}
          roughness={0.1}
          transparent
          opacity={0.98}
        />
      </mesh>
      <pointLight position={[0, 0.5, 0]} color="#C9A96E" intensity={ctaHover ? 3 : 1.8} distance={4} />
    </group>
  );
}

function CameraRig({ mouse, reducedMotion, activePersona }) {
  const { camera } = useThree();
  useFrame(() => {
    if (reducedMotion) return;
    const idx = PERSONAS.findIndex((p) => p.id === activePersona);
    const focusX = idx >= 0 ? Math.cos((idx / 9) * Math.PI * 2 - Math.PI / 2) * 0.15 : 0;
    camera.position.x += (mouse.current.x * 0.3 + focusX - camera.position.x) * 0.035;
    camera.position.y += (1.65 + mouse.current.y * 0.12 - camera.position.y) * 0.035;
    camera.lookAt(focusX * 0.5, 0.05, 0);
  });
  return null;
}

function Dust({ reducedMotion }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(120 * 3);
    for (let i = 0; i < 120; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = Math.random() * 2.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={120} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#C9A96E" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

export function CouncilScene({ activePersona, onPersonaHover, ctaHover, mouse, reducedMotion }) {
  return (
    <>
      <color attach="background" args={["#050408"]} />
      <fog attach="fog" args={["#050408", 5.5, 13]} />
      <ambientLight intensity={0.18} />
      <spotLight position={[0, 6, 2]} angle={0.45} penumbra={0.8} intensity={1.2} color="#C9A96E" castShadow={false} />
      <pointLight position={[-3, 2, -2]} intensity={0.25} color="#7C8CFF" />
      <pointLight position={[3, 1, 2]} intensity={0.2} color="#C86FE0" />
      <CameraRig mouse={mouse} reducedMotion={reducedMotion} activePersona={activePersona} />
      {!reducedMotion && <Stars radius={60} depth={30} count={600} factor={2.5} saturation={0} fade speed={0.2} />}
      <Dust reducedMotion={reducedMotion} />
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.15} disabled={reducedMotion}>
        <CouncilTable ctaHover={ctaHover} activePersona={activePersona} reducedMotion={reducedMotion} />
      </Float>
      {PERSONAS.map((p, i) => (
        <PersonaNode
          key={p.id}
          persona={p}
          index={i}
          active={activePersona}
          onHover={onPersonaHover}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  );
}
