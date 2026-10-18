import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

type Kind = 'triangle' | 'circle' | 'cross' | 'square'

const RED = new THREE.Color('#ff1a1a')
const ICE = new THREE.Color('#a9bcf0')
const WHITE = new THREE.Color('#ffffff')

function ShapeMesh({ kind, color, emissive = 1.6 }: { kind: Kind; color: THREE.Color; emissive?: number }) {
  const mat = (
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} metalness={0.4} roughness={0.25} toneMapped={false} />
  )
  if (kind === 'cross') {
    return (
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh><boxGeometry args={[1.5, 0.24, 0.24]} />{mat}</mesh>
        <mesh><boxGeometry args={[0.24, 1.5, 0.24]} />{mat}</mesh>
      </group>
    )
  }
  // Torus with 3 / 4 / 64 tubular segments = triangle / square / circle outline
  const seg = kind === 'triangle' ? 3 : kind === 'square' ? 4 : 64
  const rot = kind === 'triangle' ? Math.PI / 2 : kind === 'square' ? Math.PI / 4 : 0
  return (
    <mesh rotation={[0, 0, rot]}>
      <torusGeometry args={[0.72, 0.12, 16, seg]} />
      {mat}
    </mesh>
  )
}

const KINDS: Kind[] = ['triangle', 'circle', 'cross', 'square']

function Shapes({ count, side }: { count: number; side: number }) {
  const items = useMemo(() => {
    const rnd = mulberry(7)
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + rnd() * 0.6
      const radius = 3.2 + rnd() * 3.4
      return {
        kind: KINDS[i % 4],
        pos: [Math.cos(angle) * radius * 1.25 + side * 2.6, Math.sin(angle) * radius * 0.72, -2.5 - rnd() * 5] as [number, number, number],
        rot: [rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI] as [number, number, number],
        scale: 0.45 + rnd() * 0.75,
        color: i % 3 === 0 ? ICE : i % 7 === 0 ? WHITE : RED,
        speed: 0.8 + rnd() * 1.6,
      }
    })
  }, [count, side])

  return (
    <>
      {items.map((it, i) => (
        <Float key={i} speed={it.speed} rotationIntensity={1.4} floatIntensity={1.6}>
          <group position={it.pos} rotation={it.rot} scale={it.scale}>
            <ShapeMesh kind={it.kind} color={it.color} emissive={it.color === RED ? 2.2 : 1.1} />
          </group>
        </Float>
      ))}
    </>
  )
}

function HaloRing({ side }: { side: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.15
  })
  return (
    <group ref={ref} position={[side * 3.3, 0.2, -2.5]}>
      <mesh>
        <torusGeometry args={[3.4, 0.05, 8, 160, Math.PI * 1.3]} />
        <meshBasicMaterial color={RED} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[3.9, 0.025, 8, 160, Math.PI * 0.7]} />
        <meshBasicMaterial color={ICE} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Rig() {
  const { camera, pointer } = useThree()
  const target = useRef(new THREE.Vector3())
  useFrame((_, dt) => {
    const scroll = Math.min(1, window.scrollY / window.innerHeight)
    target.current.set(pointer.x * 1.2, pointer.y * 0.7, 9 + scroll * 4)
    camera.position.lerp(target.current, 1 - Math.pow(0.001, dt))
    camera.lookAt(0, -scroll * 1.5, 0)
  })
  return null
}

export default function HeroScene({ lowPower = false, side = 1 }: { lowPower?: boolean; side?: number }) {
  return (
    <Canvas
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 9], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 6]} intensity={40} color="#ff4d4d" />
      <pointLight position={[-5, -3, 4]} intensity={25} color="#a9bcf0" />
      <Shapes count={lowPower ? 10 : 18} side={side} />
      <HaloRing side={side} />
      <Sparkles count={lowPower ? 40 : 90} scale={[16, 9, 6]} size={2.2} speed={0.35} color="#ff4d4d" opacity={0.7} />
      <Rig />
      {!lowPower && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.85} luminanceThreshold={0.2} luminanceSmoothing={0.3} mipmapBlur />
          <ChromaticAberration offset={new THREE.Vector2(0.0009, 0.0006)} radialModulation={false} modulationOffset={0} />
          <Vignette eskil={false} offset={0.2} darkness={0.85} />
        </EffectComposer>
      )}
    </Canvas>
  )
}

function mulberry(a: number) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
