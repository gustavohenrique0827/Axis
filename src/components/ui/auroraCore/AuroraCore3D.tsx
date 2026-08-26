import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colorForMode, pulseSpeedForMode, type AuroraCoreMode } from "./auroraCoreStates";

interface CoreMeshProps {
  mode: AuroraCoreMode;
}

/**
 * Geometria do núcleo — porta direta de SphereCore.tsx do jarvis-os (mesmo desenho: icosaedro
 * pulsante + gaiola wireframe + anel de energia), sem nenhuma das dependências de cena completa
 * do jarvis-os (sinapses, constellation de agentes, hand-tracking, grab).
 */
function CoreMesh({ mode }: CoreMeshProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const pulseSpeed = pulseSpeedForMode(modeRef.current);
    const [r, g, b] = colorForMode(modeRef.current);

    if (coreRef.current) {
      const pulse = 0.75 + Math.sin(t * pulseSpeed) * 0.06;
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.y += delta * 0.4;
      (coreRef.current.material as THREE.MeshBasicMaterial).color.setRGB(r * 0.9, g * 0.9, b * 0.9);
    }
    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.25;
      wireRef.current.rotation.x += delta * 0.1;
      (wireRef.current.material as THREE.MeshBasicMaterial).color.setRGB(r, g, b);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5;
      ringRef.current.rotation.x += delta * 0.2;
      (ringRef.current.material as THREE.MeshBasicMaterial).color.setRGB(r, g, b);
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.75, 2]} />
        <meshBasicMaterial transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh ref={wireRef}>
        <icosahedronGeometry args={[1.0, 1]} />
        <meshBasicMaterial wireframe transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.85, 0.014, 8, 32]} />
        <meshBasicMaterial transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  );
}

interface AuroraCore3DProps {
  mode: AuroraCoreMode;
  size: number;
}

/** Cena mínima dedicada só ao núcleo — sem nada além do necessário pra caber num widget de canto. */
export function AuroraCore3D({ mode, size }: AuroraCore3DProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 2, 2]} intensity={1.1} />
        <CoreMesh mode={mode} />
      </Canvas>
    </div>
  );
}
