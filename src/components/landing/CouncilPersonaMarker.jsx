import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Symbolic 3D geometry per persona — each form reflects the archetype's essence.
 * Uses meshPhysicalMaterial for glass-like premium feel.
 */

const GLASS_BASE = {
  metalness: 0.1,
  roughness: 0.05,
  transmission: 0.95,
  thickness: 0.8,
  ior: 1.6,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  transparent: true,
  opacity: 1,
};

const METAL_BASE = {
  metalness: 0.92,
  roughness: 0.12,
};

function PersonaGeometry({ id }) {
  switch (id) {
    case "founder":
      // Architectural cube — sharp, structural
      return <boxGeometry args={[0.24, 0.24, 0.24]} />;
    case "billionaire":
      // Tall monolith — heavy, vertical authority
      return <boxGeometry args={[0.13, 0.38, 0.13]} />;
    case "artist":
      // Torus knot — organic ribbon, flowing
      return <torusKnotGeometry args={[0.1, 0.038, 64, 8, 2, 3]} />;
    case "athlete":
      // Triangular cone — kinetic upward energy
      return <coneGeometry args={[0.17, 0.34, 3]} />;
    case "monk":
      // Sphere — still, centered, whole
      return <sphereGeometry args={[0.19, 24, 24]} />;
    case "scientist":
      // Icosahedron — crystalline precision
      return <icosahedronGeometry args={[0.2, 0]} />;
    case "explorer":
      // Tetrahedron — pointing outward, pioneer form
      return <tetrahedronGeometry args={[0.24, 0]} />;
    case "romantic":
      // Octahedron — gem-like, warm symmetry
      return <octahedronGeometry args={[0.21, 0]} />;
    case "shadow":
      // Inverted cone — weight downward, hidden power
      return <coneGeometry args={[0.18, 0.32, 5]} />;
    default:
      return <octahedronGeometry args={[0.18, 0]} />;
  }
}

function getRotationSpeed(id) {
  const speeds = {
    founder: 0.008, billionaire: 0.003, artist: 0.012,
    athlete: 0.015, monk: 0.002, scientist: 0.009,
    explorer: 0.011, romantic: 0.007, shadow: 0.005,
  };
  return speeds[id] ?? 0.007;
}

function getFloatParams(index) {
  return {
    frequency: 0.7 + (index % 3) * 0.2,
    amplitude: 0.035 + (index % 2) * 0.015,
    phase: (index / 9) * Math.PI * 2,
  };
}

export function CouncilPersonaMarker({ persona, index, active, onHover, reducedMotion }) {
  const markerRef = useRef();
  const haloRef = useRef();
  const glowRef = useRef();
  const matRef = useRef();
  const hitBoxRef = useRef();

  const angle = useMemo(() => (index / 9) * Math.PI * 2 - Math.PI / 2, [index]);
  const radius = 2.3;
  const baseY = 0.1;
  const basePos = useMemo(
    () => [Math.cos(angle) * radius, baseY, Math.sin(angle) * radius],
    [angle]
  );

  const isActive = active === persona.id;
  const color = persona.color;
  const rotSpeed = getRotationSpeed(persona.id);
  const floatP = getFloatParams(index);
  const targetScale = useRef(1);

  useFrame((state) => {
    if (!markerRef.current) return;
    const t = state.clock.elapsedTime;

    if (!reducedMotion) {
      markerRef.current.rotation.y += rotSpeed;
      if (persona.id !== "shadow") {
        markerRef.current.rotation.x = Math.sin(t * floatP.frequency + floatP.phase) * 0.06;
      }
      markerRef.current.position.y =
        baseY + Math.sin(t * floatP.frequency + floatP.phase) * floatP.amplitude;
    }

    // Scale lerp
    targetScale.current = isActive ? 1.45 : 1;
    const targetVec = new THREE.Vector3(targetScale.current, targetScale.current, targetScale.current);
    markerRef.current.scale.lerp(targetVec, 0.1);
    if (hitBoxRef.current) hitBoxRef.current.scale.lerp(targetVec, 0.1);

    // Halo opacity lerp
    if (haloRef.current) {
      haloRef.current.material.opacity +=
        ((isActive ? 0.6 : 0.08) - haloRef.current.material.opacity) * 0.1;
      haloRef.current.scale.lerp(
        new THREE.Vector3(isActive ? 1.8 : 1, isActive ? 1.8 : 1, 1),
        0.1
      );
    }

    // Material emissive intensity lerp
    if (matRef.current) {
      const targetEI = isActive ? 1.8 : 0.3;
      matRef.current.emissiveIntensity +=
        (targetEI - matRef.current.emissiveIntensity) * 0.1;
    }
  });

  return (
    <group position={basePos}>
      {/* Ground halo ring */}
      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -baseY + 0.01, 0]}>
        <ringGeometry args={[0.2, 0.36, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Monk-specific outer halo above */}
      {persona.id === "monk" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.28, 0]}>
          <ringGeometry args={[0.27, 0.33, 48]} />
          <meshBasicMaterial color="#E8DFC8" transparent opacity={isActive ? 0.55 : 0.2} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {/* Shadow gets an extra dark base disc */}
      {persona.id === "shadow" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -baseY + 0.02, 0]}>
          <circleGeometry args={[0.28, 32]} />
          <meshBasicMaterial color="#1a0812" transparent opacity={0.7} depthWrite={false} />
        </mesh>
      )}

      {/* Invisible hit box for stable pointer interactions, preventing flicker */}
      <mesh
        ref={hitBoxRef}
        position={[0, baseY, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onHover?.(persona.id); }}
        onPointerOut={() => onHover?.(null)}
      >
        <cylinderGeometry args={[0.35, 0.35, 0.8, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Main persona marker — glass-like */}
      <mesh
        ref={markerRef}
        position={[0, 0, 0]}
        rotation={persona.id === "shadow" ? [Math.PI, 0, 0] : [0, 0, 0]}
      >
        <PersonaGeometry id={persona.id} />
        <meshPhysicalMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1.8 : 0.3}
          {...(persona.id === "billionaire" || persona.id === "founder"
            ? METAL_BASE
            : GLASS_BASE)}
        />
      </mesh>

      {/* Active persona point light */}
      {isActive && (
        <pointLight color={color} intensity={3.5} distance={4} decay={2} />
      )}
    </group>
  );
}
