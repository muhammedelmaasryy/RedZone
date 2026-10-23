import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { markSceneReady } from '../../lib/sceneReady'

type Kind = 'triangle' | 'circle' | 'cross' | 'square'

const RED = new THREE.Color('#ff1a1a')
const ICE = new THREE.Color('#a9bcf0')
const WHITE = new THREE.Color('#ffffff')

const CAM_Z = 11
const CAM_FOV = 42
const VIEW_H = 2 * CAM_Z * Math.tan((CAM_FOV * Math.PI) / 360)

function ShapeMesh({ kind, color, emissive = 1.6 }: { kind: Kind; color: THREE.Color; emissive?: number }) {
  const mat = (
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissive} metalness={0.4} roughness={0.25} toneMapped={false} />
  )
  if (kind === 'cross') {
    return (
      <group rotation={[0, 0, Math.PI / 4]}>
        <mesh><boxGeometry args={[1.4, 0.22, 0.22]} />{mat}</mesh>
        <mesh><boxGeometry args={[0.22, 1.4, 0.22]} />{mat}</mesh>
      </group>
    )
  }
  const seg = kind === 'triangle' ? 3 : kind === 'square' ? 4 : 48
  const rot = kind === 'triangle' ? Math.PI / 2 : kind === 'square' ? Math.PI / 4 : 0
  return (
    <mesh rotation={[0, 0, rot]}>
      <torusGeometry args={[0.68, 0.11, 14, seg]} />
      {mat}
    </mesh>
  )
}

const KINDS: Kind[] = ['triangle', 'circle', 'cross', 'square']

function AmbientShapes({ count }: { count: number }) {
  const items = useMemo(() => {
    const rnd = mulberry(19)
    return Array.from({ length: count }).map((_, i) => {
      const side = i % 2 === 0 ? -1 : 1
      const x = side * (2.6 + rnd() * 3.8)
      const y = (0.5 - i / count) * VIEW_H * 2.6 + (rnd() - 0.5) * 1.5
      const z = -2.2 - rnd() * 4.5
      return {
        kind: KINDS[i % 4],
        pos: [x, y, z] as [number, number, number],
        rot: [rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI] as [number, number, number],
        scale: 0.38 + rnd() * 0.55,
        color: i % 3 === 0 ? ICE : i % 7 === 0 ? WHITE : RED,
        speed: 0.8 + rnd() * 1.5,
      }
    })
  }, [count])

  return (
    <>
      {items.map((it, i) => (
        <Float key={i} speed={it.speed} rotationIntensity={1.4} floatIntensity={1.5}>
          <group position={it.pos} rotation={it.rot} scale={it.scale}>
            <ShapeMesh kind={it.kind} color={it.color} emissive={it.color === RED ? 2.1 : 1.2} />
          </group>
        </Float>
      ))}
    </>
  )
}

function StageHalos({ accentHex }: { accentHex: string }) {
  const ref1 = useRef<THREE.Group>(null)
  const ref2 = useRef<THREE.Group>(null)
  const ref3 = useRef<THREE.Group>(null)
  const accent = useMemo(() => new THREE.Color(accentHex), [accentHex])

  useFrame((_, dt) => {
    if (ref1.current) ref1.current.rotation.z += dt * 0.18
    if (ref2.current) ref2.current.rotation.z -= dt * 0.22
    if (ref3.current) ref3.current.rotation.z += dt * 0.16
  })

  return (
    <>
      <group ref={ref1} position={[0, VIEW_H + 0.5, -2.5]}>
        <mesh>
          <torusGeometry args={[2.9, 0.04, 8, 128, Math.PI * 1.35]} />
          <meshBasicMaterial color={RED} toneMapped={false} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[3.35, 0.025, 8, 128, Math.PI * 0.75]} />
          <meshBasicMaterial color={ICE} toneMapped={false} />
        </mesh>
      </group>

      <group ref={ref2} position={[0, 0, -2.8]}>
        <mesh>
          <torusGeometry args={[2.6, 0.035, 8, 128, Math.PI * 1.25]} />
          <meshBasicMaterial color={ICE} toneMapped={false} />
        </mesh>
      </group>

      <group ref={ref3} position={[0, -VIEW_H - 0.5, -2.5]}>
        <mesh>
          <torusGeometry args={[3.0, 0.045, 8, 128, Math.PI * 1.4]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
      </group>
    </>
  )
}

function ReadySignal() {
  const frames = useRef(0)
  useFrame(() => {
    frames.current += 1
    if (frames.current === 3) markSceneReady()
  })
  return null
}

function Rig({ scrollRef }: { scrollRef: RefObject<number> }) {
  const { camera, pointer } = useThree()
  const curY = useRef(VIEW_H)
  const curX = useRef(0)

  useFrame((_, dt) => {
    const p = THREE.MathUtils.clamp(scrollRef.current, 0, 1)
    const targetY = (0.5 - p) * 2 * VIEW_H
    curY.current = THREE.MathUtils.damp(curY.current, targetY + pointer.y * 0.18, 8, dt)
    curX.current = THREE.MathUtils.damp(curX.current, pointer.x * 0.22, 6, dt)
    camera.position.set(curX.current, curY.current, CAM_Z)
    camera.lookAt(0, curY.current, 0)
  })
  return null
}

export default function HeroScene({
  lowPower = false,
  active = true,
  scrollRef,
  accentHex = '#ff1a1a',
}: {
  lowPower?: boolean
  active?: boolean
  scrollRef: RefObject<number>
  accentHex?: string
}) {
  return (
    <Canvas
      dpr={lowPower ? 1 : [1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, VIEW_H, CAM_Z], fov: CAM_FOV }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, VIEW_H + 2, 6]} intensity={38} color="#ff4d4d" />
      <pointLight position={[-5, 0, 5]} intensity={28} color="#a9bcf0" />
      <pointLight position={[3, -VIEW_H, 6]} intensity={35} color="#ff1a1a" />
      <AmbientShapes count={lowPower ? 10 : 20} />
      <StageHalos accentHex={accentHex} />
      <Sparkles
        count={lowPower ? 40 : 85}
        scale={[15, VIEW_H * 3.1, 6]}
        size={2.2}
        speed={0.35}
        color="#ff4d4d"
        opacity={0.68}
      />
      <Rig scrollRef={scrollRef} />
      <ReadySignal />
      {!lowPower && (
        <EffectComposer multisampling={0} resolutionScale={0.5}>
          <Bloom intensity={0.85} luminanceThreshold={0.22} luminanceSmoothing={0.3} mipmapBlur resolutionScale={0.5} />
          <Vignette eskil={false} offset={0.2} darkness={0.82} />
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
