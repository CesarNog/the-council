import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { PERSONAS } from "../../lib/personas.js";

function PersonaNode({ persona, index, active, onHover, reducedMotion }) {
  const mesh = useRef();
  const angle = useMemo(() => (index / 9) * Math.PI * 2 - Math.PI / 2, [index]);
  const pos = useMemo(() => [Math.cos(angle) * 2.4, 0, Math.sin(angle) * 2.4], [angle]);
  const color = persona.color;

  useFrame((state) => {
    if (!mesh.current || reducedMotion) return;
    mesh.current.rotation.y += 0.004;
    const scale = active === persona.id ? 1.35 : 1;
    mesh.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.08);
  });

  return (
    <group position={pos}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => { e.stopPropagation(); onHover?.(persona.id); }}
        onPointerOut={() => onHover?.(null)}
      >
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active === persona.id ? 1.2 : 0.35}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      {active === persona.id && (
        <pointLight color={color} intensity={2} distance={3} />
      )}
    </group>
  );
}

function CouncilTable({ ctaHover }) {
  const ring = useRef();
  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={ring}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[1.8, 2.5, 64]} />
        <meshStandardMaterial color="#C9A96E" emissive="#C9A96E" emissiveIntensity={0.15} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.08, 32]} />
        <meshStandardMaterial color="#1a1528" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color="#C9A96E"
          emissive="#C9A96E"
          emissiveIntensity={ctaHover ? 1.4 : 0.7}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  );
}

function CameraRig({ mouse, reducedMotion }) {
  const { camera } = useThree();
  useFrame(() => {
    if (reducedMotion) return;
    camera.position.x += (mouse.current.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (1.8 + mouse.current.y * 0.15 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function CouncilScene({ activePersona, onPersonaHover, ctaHover, mouse, reducedMotion }) {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 4, 2]} intensity={0.8} color="#C9A96E" />
      <pointLight position={[-3, 1, -2]} intensity={0.3} color="#7C8CFF" />
      <CameraRig mouse={mouse} reducedMotion={reducedMotion} />
      {!reducedMotion && <Stars radius={80} depth={40} count={1200} factor={3} saturation={0} fade speed={0.3} />}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3} disabled={reducedMotion}>
        <CouncilTable ctaHover={ctaHover} />
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
