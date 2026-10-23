import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v))
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Pure PlayStation & Red Zone 3-Stage Scroll-Synchronized Spine
 * All stages are strictly centered along the vertical spine axis x = 300
 * inside a smooth-panning SVG camera (`viewBox="0 ${camY} 600 900"`):
 * - STAGE 1 (y: 0..900): Red Zone Mascot Shield + Detailed 3D Splitting DualSense Controller -> 3D-Tumbling △○✕□ Symbols & Blu-Ray Discs
 * - STAGE 2 (y: 900..1800): 3D Vortex Collector Gate -> Centered PlayStation Holographic QR Sign-In Portal + Perspective Smartphone Laser Scanner & Turbine Nozzle
 * - STAGE 3 (y: 1800..2700): True 3D Depth-Sorted Intertwined Double-Helix Energy Conduits -> Sculpted PS5 Console Tower, Platinum Trophy & Propagating Shockwaves
 */
// Deterministic 15x15 QR data module coordinates (excluding the three 5x5 corner finders and center 3x3 logo)
const QR_MODULES: Array<{ x: number; y: number; isIce: boolean }> = (() => {
  const mods: Array<{ x: number; y: number; isIce: boolean }> = []
  const grid = 15
  const step = 10.8
  const half = ((grid - 1) * step) / 2
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const inTopLeft = r < 5 && c < 5
      const inTopRight = r < 5 && c >= grid - 5
      const inBotLeft = r >= grid - 5 && c < 5
      const inCenterLogo = r >= 6 && r <= 8 && c >= 6 && c <= 8
      if (inTopLeft || inTopRight || inBotLeft || inCenterLogo) continue

      const isTiming = (r === 4 && c % 2 === 0) || (c === 4 && r % 2 === 0)
      const hash = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453
      const frac = hash - Math.floor(hash)
      if (isTiming || frac > 0.42) {
        mods.push({
          x: -half + c * step,
          y: -half + r * step,
          isIce: frac > 0.74,
        })
      }
    }
  }
  return mods
})()

export function ReelSpine({
  containerRef,
  scrollRef,
  accentHex = '#ff1a1a',
}: {
  containerRef: RefObject<HTMLDivElement | null>
  scrollRef: RefObject<number>
  accentHex?: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const leftHalfRef = useRef<SVGGElement>(null)
  const rightHalfRef = useRef<SVGGElement>(null)
  const coreArcsRef = useRef<SVGGElement>(null)
  const mascotShieldRef = useRef<SVGGElement>(null)
  const shardsGroupRef = useRef<SVGGElement>(null)
  const conduitRingRef = useRef<SVGGElement>(null)
  const conduitInnerRef = useRef<SVGGElement>(null)
  const stream1Ref = useRef<SVGGElement>(null)
  const streamPulseRef = useRef<SVGLineElement>(null)
  const portalRingOuterRef = useRef<SVGCircleElement>(null)
  const portalRingInnerRef = useRef<SVGCircleElement>(null)
  const portalHudGroupRef = useRef<SVGGElement>(null)
  const qrCellsGroupRef = useRef<SVGGElement>(null)
  const phoneScannerRef = useRef<SVGGElement>(null)
  const laserConeRef = useRef<SVGPolygonElement>(null)
  const laserBeamCoreRef = useRef<SVGPolygonElement>(null)
  const qrScanLineRef = useRef<SVGGElement>(null)
  const statusPillRef = useRef<SVGRectElement>(null)
  const statusDotRef = useRef<SVGCircleElement>(null)
  const statusTextRef = useRef<SVGTextElement>(null)
  const nozzleGlowRef = useRef<SVGEllipseElement>(null)

  // True 3D Intertwined Helix Refs (Back layer, Middle layer, Front-crossing layer, Rungs & Pulses)
  const helixCoreBeamRef = useRef<SVGLineElement>(null)
  const helixRungsRef = useRef<SVGGElement>(null)
  const redBackGlowRef = useRef<SVGPathElement>(null)
  const redBackBodyRef = useRef<SVGPathElement>(null)
  const redBackSpecRef = useRef<SVGPathElement>(null)
  const iceFullGlowRef = useRef<SVGPathElement>(null)
  const iceFullShadowRef = useRef<SVGPathElement>(null)
  const iceFullBodyRef = useRef<SVGPathElement>(null)
  const iceFullSpecRef = useRef<SVGPathElement>(null)
  const icePulseRef = useRef<SVGPathElement>(null)
  const redFrontShadowRef = useRef<SVGPathElement>(null)
  const redFrontGlowRef = useRef<SVGPathElement>(null)
  const redFrontBodyRef = useRef<SVGPathElement>(null)
  const redFrontSpecRef = useRef<SVGPathElement>(null)
  const redPulseRef = useRef<SVGPathElement>(null)

  const splashGroupRef = useRef<SVGGElement>(null)
  const ps5AuraRef = useRef<SVGGElement>(null)
  const shockwavesRef = useRef<SVGGElement>(null)
  const trophyFloatRef = useRef<SVGGElement>(null)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    let curCamY = 0
    let smoothP = 0

    const tick = (now: number) => {
      const t = (now - start) / 1000

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const scrollable = Math.max(1, rect.height - window.innerHeight)
        scrollRef.current = clamp(-rect.top / scrollable, 0, 1)
      }
      const rawP = clamp(scrollRef.current, 0, 1)
      smoothP += (rawP - smoothP) * 0.14
      const p = smoothP

      // Smoothly pan the SVG camera from Stage 1 -> Stage 2 -> Stage 3
      // On mobile (< 1024px), use a zoomed-in 530x680 camera window focused on each stage's centerpiece
      const isMobile = window.innerWidth < 1024
      const targetCamY = isMobile ? 95 + rawP * 1815 : rawP * 1800
      curCamY += (targetCamY - curCamY) * 0.16
      if (svgRef.current) {
        if (isMobile) {
          svgRef.current.setAttribute('viewBox', `35 ${curCamY.toFixed(1)} 530 680`)
        } else {
          svgRef.current.setAttribute('viewBox', `0 ${curCamY.toFixed(1)} 600 900`)
        }
      }

      // -----------------------------------------------------------------------
      // 1. STAGE 1: Centered Red Zone Mascot Shield + 3D Splitting DualSense
      // -----------------------------------------------------------------------
      const scrollSplit = smoothstep(0.0, 0.28, p)
      const idleBreath = Math.sin(t * 2.0) * 0.5 + 0.5
      const splitAmt = Math.max(0.18 + idleBreath * 0.16, scrollSplit)

      const dx = 28 + splitAmt * 102
      const dy = splitAmt * 14 + Math.sin(t * 2.2) * 4.5
      const rot = 6 + splitAmt * 22 + Math.cos(t * 1.8) * 1.5
      const perspScaleX = 1 - splitAmt * 0.06

      if (leftHalfRef.current) {
        leftHalfRef.current.setAttribute(
          'transform',
          `translate(${(300 - dx).toFixed(1)}, ${(365 + dy).toFixed(1)}) rotate(${(-rot).toFixed(1)}) scale(${perspScaleX.toFixed(3)}, 1)`
        )
      }
      if (rightHalfRef.current) {
        rightHalfRef.current.setAttribute(
          'transform',
          `translate(${(300 + dx).toFixed(1)}, ${(365 + dy).toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${perspScaleX.toFixed(3)}, 1)`
        )
      }
      if (coreArcsRef.current) {
        const arcOp = clamp(0.35 + splitAmt * 0.65, 0, 1)
        coreArcsRef.current.setAttribute('opacity', arcOp.toFixed(2))
        coreArcsRef.current.setAttribute(
          'transform',
          `translate(300, 365) scale(${(0.5 + splitAmt * 0.85).toFixed(2)}, ${(0.85 + Math.sin(t * 14) * 0.12).toFixed(2)})`
        )
      }
      if (mascotShieldRef.current) {
        const shieldScale = 0.94 + splitAmt * 0.15 + Math.sin(t * 2.6) * 0.02
        const shieldY = 310 - splitAmt * 16 + Math.cos(t * 2.1) * 4
        mascotShieldRef.current.setAttribute(
          'transform',
          `translate(300, ${shieldY.toFixed(1)}) scale(${shieldScale.toFixed(3)})`
        )
      }

      // -----------------------------------------------------------------------
      // 2. STAGE 1->2 CASCADE: 3D-Tumbling △ ○ ✕ □, Blu-Ray Discs & Shards
      // -----------------------------------------------------------------------
      if (shardsGroupRef.current) {
        const nodes = shardsGroupRef.current.children
        const count = nodes.length
        for (let i = 0; i < count; i++) {
          const el = nodes[i] as SVGGElement
          const speed = 0.28 + (i % 3) * 0.04
          const phase = (i / count + t * speed + p * 1.35) % 1
          // Ease-in gravity acceleration as objects fall from y=420 into the vortex at y=935
          const fall = phase * phase * 0.35 + phase * 0.65
          const y = 420 + fall * 515
          // Funnel envelope: wide near controller, tightly focused into x=300 at y=935
          const env = Math.sin(phase * Math.PI) * Math.pow(1 - phase, 0.65)
          const lane = ((i % 7) - 3) * 34
          const spiral = Math.sin(phase * Math.PI * 3 + t * 2.8 + i * 1.4) * 22
          const x = 300 + (lane + spiral) * env * (0.72 + splitAmt * 0.48)
          const r = (t * (80 + (i % 4) * 28) + i * 47) % 360
          const baseSc = (0.68 + (i % 3) * 0.18) * (0.42 + Math.sin(phase * Math.PI) * 0.68)
          // 3D tumble foreshortening along one axis
          const tumble = 0.52 + 0.48 * Math.abs(Math.cos(t * (2.4 + (i % 3) * 0.7) + i))
          const op = Math.min(1, Math.sin(phase * Math.PI) * 1.85)
          el.setAttribute(
            'transform',
            `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${r.toFixed(1)}) scale(${baseSc.toFixed(2)}, ${(baseSc * tumble).toFixed(2)})`
          )
          el.setAttribute('opacity', op.toFixed(2))
        }
      }

      // -----------------------------------------------------------------------
      // 3. BOUNDARY 1->2 & STAGE 2: Centered QR Portal, Phone Scanner & Nozzle
      // -----------------------------------------------------------------------
      if (conduitRingRef.current) {
        conduitRingRef.current.setAttribute(
          'transform',
          `translate(300, 935) scale(1, 0.32) rotate(${(t * 75 + p * 480) % 360})`
        )
      }
      if (conduitInnerRef.current) {
        conduitInnerRef.current.setAttribute(
          'transform',
          `translate(300, 935) scale(1, 0.32) rotate(${(-t * 110 - p * 600) % 360})`
        )
      }

      const pour1 = Math.max(0.45, smoothstep(0.06, 0.34, p))
      if (stream1Ref.current) {
        const pulseW = 0.94 + Math.sin(t * 11) * 0.06
        stream1Ref.current.setAttribute(
          'transform',
          `translate(300, 955) scale(${pulseW.toFixed(3)}, ${pour1.toFixed(3)})`
        )
      }
      if (streamPulseRef.current) {
        streamPulseRef.current.setAttribute('stroke-dashoffset', (-t * 180).toFixed(1))
      }

      // Orbiting HUD rings strictly centered at (300, 1345)
      if (portalRingOuterRef.current) {
        portalRingOuterRef.current.setAttribute(
          'transform',
          `translate(300, 1345) rotate(${(t * 22 + p * 200) % 360})`
        )
      }
      if (portalRingInnerRef.current) {
        portalRingInnerRef.current.setAttribute(
          'transform',
          `translate(300, 1345) rotate(${(-t * 34 - p * 260) % 360})`
        )
      }

      // Subtle 3D float on the centered QR Portal (x=300, y=1345)
      const portalFloatY = 1345 + Math.sin(t * 2.0) * 3.5
      if (portalHudGroupRef.current) {
        portalHudGroupRef.current.setAttribute('transform', `translate(300, ${portalFloatY.toFixed(1)})`)
      }

      // Sweeping Laser Scan Line across the QR Code (centered at x=300, y=1240..1400)
      const scanNorm = Math.sin(t * 3.2) * 0.5 + 0.5
      const scanLocalY = -92 + scanNorm * 164
      const scanWorldY = portalFloatY + scanLocalY
      if (qrScanLineRef.current) {
        qrScanLineRef.current.setAttribute('transform', `translate(300, ${scanWorldY.toFixed(1)})`)
      }

      // Illuminate QR modules dynamically as the laser scan line passes over them
      if (qrCellsGroupRef.current) {
        const cells = qrCellsGroupRef.current.children
        for (let i = 0; i < cells.length && i < QR_MODULES.length; i++) {
          const cell = cells[i] as SVGRectElement
          const dist = Math.abs(QR_MODULES[i].y - (scanLocalY + 10))
          if (dist < 16) {
            cell.setAttribute('fill', '#ffffff')
            cell.setAttribute('opacity', '1')
          } else if (dist < 34) {
            cell.setAttribute('fill', '#ff4d4d')
            cell.setAttribute('opacity', '0.95')
          } else {
            cell.setAttribute('fill', QR_MODULES[i].isIce ? '#a9bcf0' : '#e2e8f8')
            cell.setAttribute('opacity', '0.78')
          }
        }
      }

      // Smartphone Scanner hovers in sleek 3D perspective overlapping bottom-right of portal ring
      const phoneIn = smoothstep(0.16, 0.42, p)
      const idlePhone = (Math.sin(t * 1.9) * 0.5 + 0.5) * 0.25
      const phoneAct = Math.max(idlePhone, phoneIn)
      const px = 448 - phoneAct * 24
      const py = portalFloatY + 32 + Math.cos(t * 2.3) * 4.5
      const prot = -8 - phoneAct * 6 + Math.sin(t * 1.7) * 1.5
      if (phoneScannerRef.current) {
        phoneScannerRef.current.setAttribute(
          'transform',
          `translate(${px.toFixed(1)}, ${py.toFixed(1)}) rotate(${prot.toFixed(1)})`
        )
      }

      // Dynamic volumetric laser frustum connecting the phone lens directly to the active QR scan band
      const lensX = px - 22
      const lensY = py - 24
      const qrTopY = Math.max(portalFloatY - 94, scanWorldY - 42)
      const qrBotY = Math.min(portalFloatY + 72, scanWorldY + 42)
      if (laserConeRef.current) {
        laserConeRef.current.setAttribute(
          'points',
          `${lensX.toFixed(1)},${lensY.toFixed(1)} 214,${(portalFloatY - 90).toFixed(1)} 214,${(portalFloatY + 70).toFixed(1)} 386,${(portalFloatY + 70).toFixed(1)} 386,${(portalFloatY - 90).toFixed(1)}`
        )
        const coneOp = (0.38 + phoneAct * 0.42) * (0.88 + Math.sin(t * 12) * 0.12)
        laserConeRef.current.setAttribute('opacity', coneOp.toFixed(2))
      }
      if (laserBeamCoreRef.current) {
        laserBeamCoreRef.current.setAttribute(
          'points',
          `${lensX.toFixed(1)},${lensY.toFixed(1)} 212,${qrTopY.toFixed(1)} 212,${qrBotY.toFixed(1)}`
        )
      }

      const approved = p > 0.4
      if (statusPillRef.current) {
        statusPillRef.current.setAttribute('stroke', approved ? '#4ade80' : '#ff1a1a')
      }
      if (statusDotRef.current) {
        statusDotRef.current.setAttribute('fill', approved ? '#4ade80' : '#ff1a1a')
      }
      if (statusTextRef.current) {
        statusTextRef.current.textContent = approved
          ? 'QR APPROVED · SESSION LOCKED'
          : 'SCANNING CONSOLE QR...'
        statusTextRef.current.setAttribute('fill', approved ? '#86efac' : '#dce6ff')
      }
      if (nozzleGlowRef.current) {
        const nozScale = 0.92 + Math.sin(t * 8) * 0.08
        nozzleGlowRef.current.setAttribute('rx', (26 * nozScale).toFixed(1))
      }

      // -----------------------------------------------------------------------
      // 4. STAGE 3: True 3D Depth-Sorted Double-Helix Conduits (Centered x=300)
      // -----------------------------------------------------------------------
      const phaseShift = t * 3.4 + p * 11.0
      const startY = portalFloatY + 210 // Emerges from inside the centered Turbine Nozzle throat (~1555)
      const endY = 2215 // Plugs directly into the centered PS5 Console Tower core (x=300)
      const spanY = endY - startY
      const turns = 4.25 * Math.PI
      const steps = 96

      const getHelixPoint = (u: number, offsetRad: number, ampScale: number) => {
        const y = startY + u * spanY
        // Smoothly pin both endpoints at x=300 (inside the nozzle at u=0 and inside the PS5 core at u=1)
        const pinchTop = smoothstep(0.0, 0.14, u)
        const pinchBot = 1 - smoothstep(0.86, 1.0, u) * 0.72
        const env = Math.sin(u * Math.PI)
        const amp = (4 + (14 + env * 74) * pinchTop * pinchBot) * ampScale
        const theta = u * turns - phaseShift + offsetRad
        const x = 300 + Math.sin(theta) * amp
        const z = Math.cos(theta) // z > 0 means closer to viewer (front), z < 0 means behind (back)
        return { x, y, z, theta, amp }
      }

      let redFullD = ''
      let iceFullD = ''
      let redFrontD = ''
      let inFrontSeg = false

      for (let i = 0; i <= steps; i++) {
        const u = i / steps
        const pr = getHelixPoint(u, 0, 1.0)
        const pi = getHelixPoint(u, Math.PI, 1.0)

        const cmdR = `${pr.x.toFixed(1)} ${pr.y.toFixed(1)}`
        const cmdI = `${pi.x.toFixed(1)} ${pi.y.toFixed(1)}`

        redFullD += i === 0 ? `M ${cmdR}` : ` L ${cmdR}`
        iceFullD += i === 0 ? `M ${cmdI}` : ` L ${cmdI}`

        // When pr.z > 0, the Crimson strand is in front of the Ice strand in 3D space!
        // Because z=0 occurs at the outer horizontal apexes (sin(theta) = ±1, far from the central crossing),
        // rendering the z > 0 arches on top of the Ice strand creates true 3D over-and-under intertwining!
        if (pr.z >= 0) {
          redFrontD += !inFrontSeg ? ` M ${cmdR}` : ` L ${cmdR}`
          inFrontSeg = true
        } else {
          inFrontSeg = false
        }
      }

      if (helixCoreBeamRef.current) {
        helixCoreBeamRef.current.setAttribute('y1', startY.toFixed(1))
        helixCoreBeamRef.current.setAttribute('y2', endY.toFixed(1))
      }

      // Update Back Crimson Layer
      if (redBackGlowRef.current) redBackGlowRef.current.setAttribute('d', redFullD)
      if (redBackBodyRef.current) redBackBodyRef.current.setAttribute('d', redFullD)
      if (redBackSpecRef.current) redBackSpecRef.current.setAttribute('d', redFullD)

      // Update Middle Ice-Blue Layer
      if (iceFullGlowRef.current) iceFullGlowRef.current.setAttribute('d', iceFullD)
      if (iceFullShadowRef.current) iceFullShadowRef.current.setAttribute('d', iceFullD)
      if (iceFullBodyRef.current) iceFullBodyRef.current.setAttribute('d', iceFullD)
      if (iceFullSpecRef.current) iceFullSpecRef.current.setAttribute('d', iceFullD)
      if (icePulseRef.current) {
        icePulseRef.current.setAttribute('d', iceFullD)
        icePulseRef.current.setAttribute('stroke-dashoffset', (-t * 260).toFixed(1))
      }

      // Update Front-Crossing Crimson Layer (occludes Ice strand on alternating crossings)
      if (redFrontShadowRef.current) redFrontShadowRef.current.setAttribute('d', redFrontD)
      if (redFrontGlowRef.current) redFrontGlowRef.current.setAttribute('d', redFrontD)
      if (redFrontBodyRef.current) redFrontBodyRef.current.setAttribute('d', redFrontD)
      if (redFrontSpecRef.current) redFrontSpecRef.current.setAttribute('d', redFrontD)
      if (redPulseRef.current) {
        redPulseRef.current.setAttribute('d', redFrontD)
        redPulseRef.current.setAttribute('stroke-dashoffset', (-t * 260).toFixed(1))
      }

      // Update 3D Base-Pair Energy Rungs connecting the two strands
      if (helixRungsRef.current) {
        const rungs = helixRungsRef.current.children
        const rCount = rungs.length
        for (let i = 0; i < rCount; i++) {
          const lineEl = rungs[i] as SVGLineElement
          const u = 0.08 + (i / (rCount - 1)) * 0.84
          const pr = getHelixPoint(u, 0, 1.0)
          const pi = getHelixPoint(u, Math.PI, 1.0)
          lineEl.setAttribute('x1', pr.x.toFixed(1))
          lineEl.setAttribute('y1', pr.y.toFixed(1))
          lineEl.setAttribute('x2', pi.x.toFixed(1))
          lineEl.setAttribute('y2', pi.y.toFixed(1))
          const rungOp = 0.22 + 0.45 * Math.abs(Math.sin(pr.theta))
          lineEl.setAttribute('opacity', rungOp.toFixed(2))
        }
      }

      // Orbiting PlayStation Shapes around the centered Stage 3 Helix
      if (splashGroupRef.current) {
        const nodes = splashGroupRef.current.children
        for (let i = 0; i < nodes.length; i++) {
          const el = nodes[i] as SVGGElement
          const u = (i / nodes.length + t * 0.22 + p * 0.7) % 1
          const y = startY + 35 + u * (spanY - 70)
          const env = Math.sin(u * Math.PI)
          const ang = u * turns - phaseShift + i * 1.45
          const x = 300 + Math.cos(ang) * (42 + env * 86)
          const depth = 0.65 + 0.35 * Math.sin(ang)
          const sc = (0.58 + (i % 3) * 0.18) * env * depth
          el.setAttribute(
            'transform',
            `translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${(t * 75 + i * 50) % 360}) scale(${sc.toFixed(2)})`
          )
          el.setAttribute('opacity', (env * depth * 0.95).toFixed(2))
        }
      }

      // Stage 3 Arena Shockwaves & PS5 Console Aura
      if (ps5AuraRef.current) {
        const auraScale = 0.82 + smoothstep(0.55, 0.95, p) * 0.26 + Math.sin(t * 2.8) * 0.03
        const auraRot = (t * 20 + p * 160) % 360
        ps5AuraRef.current.setAttribute(
          'transform',
          `translate(300, 2535) scale(1, 0.34) rotate(${auraRot.toFixed(1)}) scale(${auraScale.toFixed(2)})`
        )
      }
      if (shockwavesRef.current) {
        const rings = shockwavesRef.current.children
        for (let i = 0; i < rings.length; i++) {
          const ring = rings[i] as SVGEllipseElement
          const waveP = (t * 0.45 + i * 0.33) % 1
          const rx = 55 + waveP * 185
          const ry = rx * 0.32
          const op = (1 - waveP) * smoothstep(0.0, 0.2, waveP) * 0.75
          ring.setAttribute('rx', rx.toFixed(1))
          ring.setAttribute('ry', ry.toFixed(1))
          ring.setAttribute('opacity', op.toFixed(2))
        }
      }

      if (trophyFloatRef.current) {
        const ty = 2130 + Math.sin(t * 2.6) * 6
        const tsc = 0.92 + smoothstep(0.6, 0.95, p) * 0.18
        trophyFloatRef.current.setAttribute(
          'transform',
          `translate(300, ${ty.toFixed(1)}) scale(${tsc.toFixed(2)})`
        )
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [containerRef, scrollRef])

  return (
    <div className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 600 900"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full max-w-[620px] select-none"
        aria-hidden
      >
        <defs>
          <filter id="rz-glow-red" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="rz-glow-ice" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="rz-soft-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>

          <linearGradient id="rz-shell-white" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="38%" stopColor="#eef3ff" />
            <stop offset="75%" stopColor="#b8c7e8" />
            <stop offset="100%" stopColor="#6c7c9e" />
          </linearGradient>
          <linearGradient id="rz-obsidian" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#261119" />
            <stop offset="45%" stopColor="#110408" />
            <stop offset="100%" stopColor="#040002" />
          </linearGradient>
          <linearGradient id="rz-metal-bevel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#120408" />
            <stop offset="22%" stopColor="#3d1824" />
            <stop offset="50%" stopColor="#a9bcf0" />
            <stop offset="78%" stopColor="#3d1824" />
            <stop offset="100%" stopColor="#120408" />
          </linearGradient>
          <linearGradient id="rz-nozzle-shroud" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#090103" />
            <stop offset="18%" stopColor="#2d0912" />
            <stop offset="38%" stopColor="#6e1423" />
            <stop offset="50%" stopColor="#dce6ff" />
            <stop offset="62%" stopColor="#8a0c1d" />
            <stop offset="82%" stopColor="#26050c" />
            <stop offset="100%" stopColor="#090103" />
          </linearGradient>
          <linearGradient id="rz-crimson-tube" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#590004" />
            <stop offset="28%" stopColor="#d6000c" />
            <stop offset="52%" stopColor="#ff3b3b" />
            <stop offset="76%" stopColor="#cc0008" />
            <stop offset="100%" stopColor="#420002" />
          </linearGradient>
          <linearGradient id="rz-crimson-back" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2e0002" />
            <stop offset="50%" stopColor="#9e0008" />
            <stop offset="100%" stopColor="#290001" />
          </linearGradient>
          <linearGradient id="rz-ice-tube" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#283963" />
            <stop offset="28%" stopColor="#7c98db" />
            <stop offset="52%" stopColor="#e8f0ff" />
            <stop offset="76%" stopColor="#728fd4" />
            <stop offset="100%" stopColor="#1f2d52" />
          </linearGradient>
          <linearGradient id="rz-laser-cone" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#ff1a1a" stopOpacity="0.62" />
            <stop offset="38%" stopColor="#ff3838" stopOpacity="0.28" />
            <stop offset="75%" stopColor="#a9bcf0" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#a9bcf0" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="rz-gold-trophy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#e4ecff" />
            <stop offset="70%" stopColor="#8fa8e8" />
            <stop offset="100%" stopColor="#354878" />
          </linearGradient>
          <radialGradient id="rz-core-flare" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff3b3b" stopOpacity="0.82" />
            <stop offset="45%" stopColor="#8c0001" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#050001" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rz-nozzle-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="38%" stopColor="#ff2e2e" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#7a0008" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#050001" stopOpacity="0" />
          </radialGradient>

          <clipPath id="rz-mascot-shield-clip">
            <path d="M 0 -130 L 118 -86 L 118 22 C 118 92 66 138 0 160 C -66 138 -118 92 -118 22 L -118 -86 Z" />
          </clipPath>
        </defs>

        {/* Subtle Continuous Vertical Axial Guide Line down the exact center (x = 300) */}
        <line
          x1="300"
          y1="120"
          x2="300"
          y2="2550"
          stroke="#a9bcf0"
          strokeWidth="1"
          strokeDasharray="4 10"
          opacity="0.22"
        />

        {/* ===================================================================
            STAGE 1 (y: 0..900, centered around x: 300, y: 340):
            RED ZONE MASCOT SHIELD + 3D SPLITTING DUALSENSE CONTROLLER
           =================================================================== */}
        <circle cx="300" cy="340" r="225" fill="url(#rz-core-flare)" opacity="0.85" />
        <circle
          cx="300"
          cy="340"
          r="172"
          fill="none"
          stroke="#ff1a1a"
          strokeWidth="1.5"
          strokeDasharray="14 9"
          opacity="0.5"
        />
        <circle
          cx="300"
          cy="340"
          r="198"
          fill="none"
          stroke="#a9bcf0"
          strokeWidth="1.2"
          strokeDasharray="28 14"
          opacity="0.38"
        />

        {/* CASCADING 3D-TUMBLING STREAM OF △ ○ ✕ □, BLU-RAY DISCS & SHARDS (y: 420..935) */}
        <g ref={shardsGroupRef}>
          {Array.from({ length: 24 }).map((_, i) => {
            const kind = i % 5
            return (
              <g key={i}>
                {kind === 0 && (
                  <g filter="url(#rz-glow-red)">
                    <polygon points="0,-15 14,10 -14,10" fill="none" stroke="#ff1a1a" strokeWidth="3.8" />
                    <polygon points="0,-11 10,7 -10,7" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
                  </g>
                )}
                {kind === 1 && (
                  <g filter="url(#rz-glow-ice)">
                    <circle cx="0" cy="0" r="12" fill="none" stroke="#a9bcf0" strokeWidth="3.8" />
                    <circle cx="0" cy="0" r="8.5" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.7" />
                  </g>
                )}
                {kind === 2 && (
                  <g strokeLinecap="round" filter="url(#rz-glow-ice)">
                    <line x1="-10" y1="-10" x2="10" y2="10" stroke="#a9bcf0" strokeWidth="4.2" />
                    <line x1="10" y1="-10" x2="-10" y2="10" stroke="#a9bcf0" strokeWidth="4.2" />
                    <line x1="-8" y1="-8" x2="8" y2="8" stroke="#ffffff" strokeWidth="1.4" />
                    <line x1="8" y1="-8" x2="-8" y2="8" stroke="#ffffff" strokeWidth="1.4" />
                  </g>
                )}
                {kind === 3 && (
                  <g filter="url(#rz-glow-red)">
                    <rect x="-10" y="-10" width="20" height="20" rx="3" fill="none" stroke="#ff3b3b" strokeWidth="3.8" />
                    <rect x="-7" y="-7" width="14" height="14" rx="1.5" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.65" />
                  </g>
                )}
                {kind === 4 && (
                  /* 3D Iridescent PlayStation Blu-Ray Game Disc */
                  <g>
                    <circle cx="0" cy="0" r="16" fill="url(#rz-ice-tube)" stroke="#ffffff" strokeWidth="1.4" />
                    <path d="M -11 -11 L -4 -4 M 11 11 L 4 4" stroke="#ffffff" strokeWidth="2" opacity="0.75" />
                    <circle cx="0" cy="0" r="10.5" fill="none" stroke="#ff1a1a" strokeWidth="1.1" strokeDasharray="10 6" />
                    <circle cx="0" cy="0" r="4.2" fill="#050001" stroke="#a9bcf0" strokeWidth="1.5" />
                  </g>
                )}
              </g>
            )
          })}
        </g>

        {/* Energy Plasma Filaments Bridging the Split DualSense Core (x=300, y=365) */}
        <g ref={coreArcsRef} transform="translate(300, 365)">
          <path
            d="M -95 -28 Q -35 -52 0 -18 Q 42 16 95 -24"
            fill="none"
            stroke="#ff1a1a"
            strokeWidth="3"
            filter="url(#rz-glow-red)"
          />
          <path
            d="M -88 22 Q -28 -8 0 24 Q 36 52 88 18"
            fill="none"
            stroke="#a9bcf0"
            strokeWidth="2.5"
            filter="url(#rz-glow-ice)"
          />
          <line x1="-75" y1="0" x2="75" y2="0" stroke="#ffffff" strokeWidth="1.8" strokeDasharray="8 6" opacity="0.85" />
        </g>

        {/* RED ZONE MASCOT SHIELD EMBLEM AT STAGE 1 CENTER (x=300, y=310) */}
        <g ref={mascotShieldRef} transform="translate(300, 310)">
          <path
            d="M 0 -130 L 118 -86 L 118 22 C 118 92 66 138 0 160 C -66 138 -118 92 -118 22 L -118 -86 Z"
            fill="#280000"
          />
          <g clipPath="url(#rz-mascot-shield-clip)">
            <image
              href="/brand/mascot.webp"
              x="-130"
              y="-125"
              width="260"
              height="285"
              preserveAspectRatio="xMidYMin slice"
            />
          </g>
          <path
            d="M 0 -130 L 118 -86 L 118 22 C 118 92 66 138 0 160 C -66 138 -118 92 -118 22 L -118 -86 Z"
            fill="none"
            stroke="#ff1a1a"
            strokeWidth="6.5"
            filter="url(#rz-glow-red)"
          />
          <path
            d="M 0 -118 L 106 -78 L 106 20 C 106 82 58 124 0 144 C -58 124 -106 82 -106 20 L -106 -78 Z"
            fill="none"
            stroke="#bdc9e7"
            strokeWidth="3.5"
          />
        </g>

        {/* LEFT HALF OF 3D DUALSENSE CONTROLLER */}
        <g ref={leftHalfRef} transform="translate(260, 365) rotate(-12)">
          {/* Exposed Internal Cyber Chassis & Copper/Neon Traces */}
          <rect x="-18" y="-58" width="18" height="96" rx="3" fill="#170409" stroke="#ff1a1a" strokeWidth="1.5" />
          <path
            d="M 0 -68 L -8 -32 L 4 0 L -6 35 L 0 62"
            fill="none"
            stroke="#ff1a1a"
            strokeWidth="4.5"
            filter="url(#rz-glow-red)"
          />
          {/* L1 / L2 Sculpted Adaptive Trigger Bumper */}
          <path
            d="M -114 -68 Q -74 -94 -26 -76 L -20 -54 L -108 -44 Z"
            fill="url(#rz-obsidian)"
            stroke="#a9bcf0"
            strokeWidth="1.8"
          />
          <path d="M -98 -75 Q -66 -86 -34 -72" fill="none" stroke="#ff1a1a" strokeWidth="2" />
          {/* Main Matte-White Sculpted Faceplate */}
          <path
            d="M 0 -68 L -82 -68 Q -138 -66 -152 -8 Q -170 58 -140 138 Q -126 170 -96 158 Q -72 146 -58 86 L -42 40 L 0 40 Z"
            fill="url(#rz-shell-white)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          {/* Inner Grip Seam & Two-Tone Obsidian Lower Grip */}
          <path
            d="M -140 68 Q -130 142 -98 156 Q -74 146 -60 86 L -42 40 L 0 40 L 0 10 L -68 16 Q -114 22 -140 68 Z"
            fill="url(#rz-obsidian)"
            stroke="#a9bcf0"
            strokeWidth="1"
          />
          {/* Left Touchpad Wing + Lightbar Accent */}
          <path
            d="M 0 -64 L -56 -64 L -44 -6 L 0 -6 Z"
            fill="url(#rz-obsidian)"
            stroke="#a9bcf0"
            strokeWidth="2"
          />
          <path
            d="M -59 -62 L -47 -4"
            fill="none"
            stroke="#ff1a1a"
            strokeWidth="3.5"
            filter="url(#rz-glow-red)"
          />
          {/* Glassy Directional D-Pad with Micro Directional Chevrons */}
          <g transform="translate(-96, -14)">
            <rect x="-23" y="-8" width="46" height="16" rx="4" fill="url(#rz-obsidian)" stroke="#a9bcf0" strokeWidth="1.6" />
            <rect x="-8" y="-23" width="16" height="46" rx="4" fill="url(#rz-obsidian)" stroke="#a9bcf0" strokeWidth="1.6" />
            <polygon points="0,-19 4,-12 -4,-12" fill="#a9bcf0" />
            <polygon points="0,19 4,12 -4,12" fill="#a9bcf0" />
            <polygon points="-19,0 -12,-4 -12,4" fill="#a9bcf0" />
            <polygon points="19,0 12,-4 12,4" fill="#a9bcf0" />
          </g>
          {/* Left 3D Concave Analog Thumbstick */}
          <g transform="translate(-46, 20)">
            <circle cx="0" cy="0" r="22" fill="#090104" stroke="#a9bcf0" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="18" fill="url(#rz-obsidian)" stroke="#ff1a1a" strokeWidth="2.2" />
            <circle cx="0" cy="0" r="13" fill="none" stroke="#a9bcf0" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx="-2" cy="-2" r="8" fill="#1d070e" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
          </g>
        </g>

        {/* RIGHT HALF OF 3D DUALSENSE CONTROLLER */}
        <g ref={rightHalfRef} transform="translate(340, 365) rotate(12)">
          {/* Exposed Internal Cyber Chassis */}
          <rect x="0" y="-58" width="18" height="96" rx="3" fill="#170409" stroke="#a9bcf0" strokeWidth="1.5" />
          <path
            d="M 0 -68 L 8 -32 L -4 0 L 6 35 L 0 62"
            fill="none"
            stroke="#a9bcf0"
            strokeWidth="4.5"
            filter="url(#rz-glow-ice)"
          />
          {/* R1 / R2 Sculpted Adaptive Trigger Bumper */}
          <path
            d="M 114 -68 Q 74 -94 26 -76 L 20 -54 L 108 -44 Z"
            fill="url(#rz-obsidian)"
            stroke="#ff1a1a"
            strokeWidth="1.8"
          />
          <path d="M 98 -75 Q 66 -86 34 -72" fill="none" stroke="#a9bcf0" strokeWidth="2" />
          {/* Main Matte-White Sculpted Faceplate */}
          <path
            d="M 0 -68 L 82 -68 Q 138 -66 152 -8 Q 170 58 140 138 Q 126 170 96 158 Q 72 146 58 86 L 42 40 L 0 40 Z"
            fill="url(#rz-shell-white)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          {/* Two-Tone Obsidian Lower Grip */}
          <path
            d="M 140 68 Q 130 142 98 156 Q 74 146 60 86 L 42 40 L 0 40 L 0 10 L 68 16 Q 114 22 140 68 Z"
            fill="url(#rz-obsidian)"
            stroke="#ff1a1a"
            strokeWidth="1"
          />
          {/* Right Touchpad Wing + Lightbar Accent */}
          <path
            d="M 0 -64 L 56 -64 L 44 -6 L 0 -6 Z"
            fill="url(#rz-obsidian)"
            stroke="#ff1a1a"
            strokeWidth="2"
          />
          <path
            d="M 59 -62 L 47 -4"
            fill="none"
            stroke="#a9bcf0"
            strokeWidth="3.5"
            filter="url(#rz-glow-ice)"
          />
          {/* Sacred PlayStation Action Buttons (△ ○ ✕ □) with Actual Micro-Glyphs */}
          <g transform="translate(96, -14)">
            {/* Top: Triangle */}
            <circle cx="0" cy="-18" r="8" fill="url(#rz-obsidian)" stroke="#a9bcf0" strokeWidth="1.8" />
            <polygon points="0,-22 4,-15 -4,-15" fill="none" stroke="#ffffff" strokeWidth="1.4" />
            {/* Right: Circle */}
            <circle cx="18" cy="0" r="8" fill="url(#rz-obsidian)" stroke="#ff1a1a" strokeWidth="1.8" />
            <circle cx="18" cy="0" r="4" fill="none" stroke="#ff4d4d" strokeWidth="1.5" />
            {/* Bottom: Cross */}
            <circle cx="0" cy="18" r="8" fill="url(#rz-obsidian)" stroke="#a9bcf0" strokeWidth="1.8" />
            <path d="M -3 15 L 3 21 M 3 15 L -3 21" stroke="#a9bcf0" strokeWidth="1.6" strokeLinecap="round" />
            {/* Left: Square */}
            <circle cx="-18" cy="0" r="8" fill="url(#rz-obsidian)" stroke="#ff4d4d" strokeWidth="1.8" />
            <rect x="-21.5" y="-3.5" width="7" height="7" fill="none" stroke="#ffffff" strokeWidth="1.4" />
          </g>
          {/* Right 3D Concave Analog Thumbstick */}
          <g transform="translate(46, 20)">
            <circle cx="0" cy="0" r="22" fill="#090104" stroke="#ff1a1a" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="18" fill="url(#rz-obsidian)" stroke="#a9bcf0" strokeWidth="2.2" />
            <circle cx="0" cy="0" r="13" fill="none" stroke="#ff1a1a" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx="2" cy="-2" r="8" fill="#1d070e" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
          </g>
        </g>

        {/* ===================================================================
            BOUNDARY 1->2 (y: 895..975, strictly centered at x: 300):
            3D PERSPECTIVE VORTEX COLLECTOR RING & DATA CONDUIT
           =================================================================== */}
        <g>
          {/* Outer Perspective Collector Dish */}
          <ellipse cx="300" cy="935" rx="145" ry="34" fill="url(#rz-obsidian)" stroke="#a9bcf0" strokeWidth="2" />
          <ellipse cx="300" cy="935" rx="115" ry="25" fill="#070103" stroke="#ff1a1a" strokeWidth="1.5" opacity="0.85" />
          {/* Counter-Rotating 3D Perspective Turbine Rings */}
          <g ref={conduitRingRef} transform="translate(300, 935) scale(1, 0.32)">
            <circle cx="0" cy="0" r="96" fill="none" stroke="#ff1a1a" strokeWidth="6" strokeDasharray="32 18" />
            <circle cx="0" cy="0" r="72" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="14 22" opacity="0.8" />
          </g>
          <g ref={conduitInnerRef} transform="translate(300, 935) scale(1, 0.32)">
            <circle cx="0" cy="0" r="52" fill="none" stroke="#a9bcf0" strokeWidth="5" strokeDasharray="24 14" />
          </g>
          {/* Central Metallic Collar Bridge */}
          <rect
            x="204"
            y="926"
            width="192"
            height="18"
            rx="9"
            fill="url(#rz-metal-bevel)"
            stroke="#ffffff"
            strokeWidth="1.2"
          />
          <circle cx="232" cy="935" r="4" fill="#050001" stroke="#a9bcf0" strokeWidth="1.5" />
          <circle cx="300" cy="935" r="6.5" fill="#ff1a1a" filter="url(#rz-glow-red)" />
          <circle cx="368" cy="935" r="4" fill="#050001" stroke="#a9bcf0" strokeWidth="1.5" />
        </g>

        {/* ===================================================================
            STAGE 2 (y: 955..1800, strictly centered at x: 300):
            PLAYSTATION HOLOGRAPHIC QR SIGN-IN PORTAL, 3D TURBINE NOZZLE
            & PERSPECTIVE SMARTPHONE LASER SCANNER
           =================================================================== */}
        {/* High-Velocity Plasma Stream from Vortex Gate into top of QR Portal (x=300) */}
        <g ref={stream1Ref} transform="translate(300, 955)">
          <path
            d="M -18 0 L -10 230 L 10 230 L 18 0 Z"
            fill="url(#rz-crimson-tube)"
            opacity="0.45"
            filter="url(#rz-glow-red)"
          />
          <path d="M -9 0 L -5 230 L 5 230 L 9 0 Z" fill="url(#rz-crimson-tube)" />
          <line
            ref={streamPulseRef}
            x1="0"
            y1="0"
            x2="0"
            y2="230"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeDasharray="22 14"
            strokeLinecap="round"
          />
        </g>

        {/* Orbiting Cyber Security Rings strictly centered at (300, 1345) */}
        <circle
          ref={portalRingOuterRef}
          cx="0"
          cy="0"
          r="192"
          transform="translate(300, 1345)"
          fill="none"
          stroke="#ff1a1a"
          strokeWidth="2"
          strokeDasharray="52 20 14 20"
          opacity="0.65"
        />
        <circle
          ref={portalRingInnerRef}
          cx="0"
          cy="0"
          r="166"
          transform="translate(300, 1345)"
          fill="none"
          stroke="#a9bcf0"
          strokeWidth="1.8"
          strokeDasharray="34 18"
          opacity="0.58"
        />

        {/* ===================================================================
            STAGE 3 DOUBLE-HELIX CONDUITS (y: 1555..2215, centered at x: 300)
            Rendered BEFORE the QR Portal's front nozzle shroud so the helix
            strands visibly emerge from INSIDE the 3D turbine throat!
           =================================================================== */}
        {/* Central Axial Plasma Spine Core */}
        <line
          ref={helixCoreBeamRef}
          x1="300"
          y1="1555"
          x2="300"
          y2="2215"
          stroke="#ff1a1a"
          strokeWidth="3"
          strokeDasharray="10 14"
          opacity="0.38"
          filter="url(#rz-glow-red)"
        />

        {/* 1. Back Layer of Crimson Strand (z < 0 passes behind Ice strand) */}
        <g>
          <path
            ref={redBackGlowRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#ff1a1a"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.28"
            filter="url(#rz-soft-blur)"
          />
          <path
            ref={redBackBodyRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="url(#rz-crimson-back)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={redBackSpecRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#ff7a7a"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
        </g>

        {/* 3D Base-Pair Energy Rungs connecting the two helical conduits */}
        <g ref={helixRungsRef}>
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={i}
              x1="300"
              y1="1600"
              x2="300"
              y2="1600"
              stroke={i % 2 === 0 ? '#a9bcf0' : '#ff4d4d'}
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.35"
            />
          ))}
        </g>

        {/* 2. Middle Layer: Full 3D-Shaded Ice-Blue Cryo/Data Conduit */}
        <g>
          {/* Ambient occlusion shadow cast onto the back Crimson strand */}
          <path
            ref={iceFullShadowRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#040002"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
          <path
            ref={iceFullGlowRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#a9bcf0"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.38"
            filter="url(#rz-glow-ice)"
          />
          <path
            ref={iceFullBodyRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="url(#rz-ice-tube)"
            strokeWidth="17.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={iceFullSpecRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          {/* High-Speed Light Packets Racing Down the Ice Conduit */}
          <path
            ref={icePulseRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="18 110"
            filter="url(#rz-glow-ice)"
          />
        </g>

        {/* 3. Front-Crossing Layer: Crimson Strand Arches where z >= 0 (crosses OVER the Ice strand!) */}
        <g>
          {/* Ambient occlusion shadow cast onto the Ice strand at front crossings */}
          <path
            ref={redFrontShadowRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#040002"
            strokeWidth="27"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
          <path
            ref={redFrontGlowRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#ff1a1a"
            strokeWidth="25"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.45"
            filter="url(#rz-glow-red)"
          />
          <path
            ref={redFrontBodyRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="url(#rz-crimson-tube)"
            strokeWidth="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={redFrontSpecRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#ffd6d6"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.92"
          />
          {/* High-Speed Light Packets Racing Down the Crimson Conduit */}
          <path
            ref={redPulseRef}
            d="M 300 1555 L 300 2215"
            fill="none"
            stroke="#ffffff"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeDasharray="22 120"
            filter="url(#rz-glow-red)"
          />
        </g>

        {/* ===================================================================
            CENTERED PLAYSTATION HOLOGRAPHIC QR SIGN-IN PORTAL (x: 300, y: 1345)
           =================================================================== */}
        <g ref={portalHudGroupRef} transform="translate(300, 1345)">
          {/* Outer Beveled Cyber Armor Frame */}
          <polygon
            points="-138,-168 138,-168 158,-148 158,148 138,168 -138,168 -158,148 -158,-148"
            fill="url(#rz-obsidian)"
            stroke="#a9bcf0"
            strokeWidth="2.5"
          />
          {/* Inner Chamfered Frame Line */}
          <polygon
            points="-132,-160 132,-160 150,-142 150,142 132,160 -132,160 -150,142 -150,-142"
            fill="none"
            stroke="#ff1a1a"
            strokeWidth="1"
            opacity="0.45"
          />

          {/* Top PS5 Sign-In Header Bar (Strictly Centered at x=0) */}
          <rect x="-134" y="-150" width="268" height="32" rx="5" fill="#180409" stroke="#ff1a1a" strokeWidth="1.3" />
          <circle cx="-116" cy="-134" r="4.5" fill="#ff1a1a" />
          <circle cx="-101" cy="-134" r="4.5" fill="#a9bcf0" />
          <text
            x="0"
            y="-130"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11.5"
            fontWeight="bold"
            fontFamily="monospace"
            letterSpacing="2.2"
          >
            PSN QR SIGN-IN
          </text>
          <text x="114" y="-131" textAnchor="end" fill="#a9bcf0" fontSize="9" fontFamily="monospace" opacity="0.8">
            TLS 1.3
          </text>

          {/* Glowing QR Code Matrix Vault inside Portal (Centered at x=0, y=-10) */}
          <rect x="-96" y="-106" width="192" height="192" rx="12" fill="#060103" stroke="#ff1a1a" strokeWidth="2" />
          {/* Subtle HUD Grid inside QR Box */}
          <line x1="-96" y1="-10" x2="96" y2="-10" stroke="#a9bcf0" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.25" />
          <line x1="0" y1="-106" x2="0" y2="86" stroke="#a9bcf0" strokeWidth="0.6" strokeDasharray="4 6" opacity="0.25" />

          {/* 3 Official QR Corner Finder Patterns */}
          <g transform="translate(0, -10)">
            {/* Top-Left Finder */}
            <rect x="-80" y="-80" width="44" height="44" rx="4" fill="none" stroke="#ff1a1a" strokeWidth="5.5" />
            <rect x="-68" y="-68" width="20" height="20" rx="2" fill="#a9bcf0" />
            {/* Top-Right Finder */}
            <rect x="36" y="-80" width="44" height="44" rx="4" fill="none" stroke="#ff1a1a" strokeWidth="5.5" />
            <rect x="48" y="-68" width="20" height="20" rx="2" fill="#a9bcf0" />
            {/* Bottom-Left Finder */}
            <rect x="-80" y="36" width="44" height="44" rx="4" fill="none" stroke="#ff1a1a" strokeWidth="5.5" />
            <rect x="-68" y="48" width="20" height="20" rx="2" fill="#a9bcf0" />

            {/* Dense Realistic QR Data Modules (dynamically illuminated by laser in tick) */}
            <g ref={qrCellsGroupRef}>
              {QR_MODULES.map((m, idx) => (
                <rect
                  key={idx}
                  x={m.x - 3.8}
                  y={m.y - 3.8}
                  width="7.6"
                  height="7.6"
                  rx="1.6"
                  fill={m.isIce ? '#a9bcf0' : '#e2e8f8'}
                  opacity="0.78"
                />
              ))}
            </g>

            {/* Center QR Security Crest */}
            <rect x="-15" y="-15" width="30" height="30" rx="6" fill="#140307" stroke="#ff1a1a" strokeWidth="2" />
            <polygon points="0,-8 8,6 -8,6" fill="none" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* Corner Target Reticle Brackets */}
          <path d="M -108 -90 L -108 -114 L -84 -114" fill="none" stroke="#a9bcf0" strokeWidth="3.2" />
          <path d="M 108 -90 L 108 -114 L 84 -114" fill="none" stroke="#a9bcf0" strokeWidth="3.2" />
          <path d="M -108 70 L -108 94 L -84 94" fill="none" stroke="#a9bcf0" strokeWidth="3.2" />
          <path d="M 108 70 L 108 94 L 84 94" fill="none" stroke="#a9bcf0" strokeWidth="3.2" />

          {/* Live Status Pill at bottom of Portal (Strictly Centered at x=0) */}
          <rect
            ref={statusPillRef}
            x="-122"
            y="108"
            width="244"
            height="32"
            rx="16"
            fill="#120206"
            stroke="#ff1a1a"
            strokeWidth="2"
          />
          <circle ref={statusDotRef} cx="-102" cy="124" r="4.5" fill="#ff1a1a" filter="url(#rz-glow-red)" />
          <text
            ref={statusTextRef}
            x="6"
            y="128"
            textAnchor="middle"
            fill="#dce6ff"
            fontSize="10.5"
            fontWeight="bold"
            fontFamily="monospace"
            letterSpacing="1.4"
          >
            SCANNING CONSOLE QR...
          </text>

          {/* 3D Sculpted Multi-Tier Plasma Turbine Nozzle (Strictly Centered at x=0, y=168..228) */}
          <g transform="translate(0, 168)">
            {/* Upper Mounting Flange */}
            <rect x="-64" y="-3" width="128" height="12" rx="4" fill="url(#rz-metal-bevel)" stroke="#a9bcf0" strokeWidth="1.2" />
            {/* Main Conical Armored Shroud */}
            <path
              d="M -54 9 L 54 9 L 36 52 L -36 52 Z"
              fill="url(#rz-nozzle-shroud)"
              stroke="#a9bcf0"
              strokeWidth="1.5"
            />
            {/* Metallic Structural Ribs & Cooling Vents on Nozzle */}
            <line x1="-34" y1="12" x2="-24" y2="48" stroke="#090103" strokeWidth="2.5" />
            <line x1="34" y1="12" x2="24" y2="48" stroke="#090103" strokeWidth="2.5" />
            <line x1="-16" y1="14" x2="-12" y2="46" stroke="#ff1a1a" strokeWidth="1.8" opacity="0.85" />
            <line x1="16" y1="14" x2="12" y2="46" stroke="#a9bcf0" strokeWidth="1.8" opacity="0.85" />
            {/* 3D Recessed Circular Emitter Throat Aperture */}
            <ellipse cx="0" cy="52" rx="36" ry="10" fill="#070103" stroke="#ffffff" strokeWidth="1.4" />
            <ellipse
              ref={nozzleGlowRef}
              cx="0"
              cy="52"
              rx="26"
              ry="7"
              fill="url(#rz-nozzle-core)"
              filter="url(#rz-glow-red)"
            />
          </g>
        </g>

        {/* Sweeping Laser Scan Bar with Dual Edge Emitters (Strictly Centered at x=300) */}
        <g ref={qrScanLineRef} transform="translate(300, 1345)">
          <line
            x1="-98"
            y1="0"
            x2="98"
            y2="0"
            stroke="#ff1a1a"
            strokeWidth="5"
            filter="url(#rz-glow-red)"
          />
          <line x1="-96" y1="0" x2="96" y2="0" stroke="#ffffff" strokeWidth="1.8" />
          <polygon points="-104,-5 -94,0 -104,5" fill="#a9bcf0" />
          <polygon points="104,-5 94,0 104,5" fill="#a9bcf0" />
        </g>

        {/* Volumetric Laser Scan Frustum from Smartphone Lens to Centered QR Matrix */}
        <polygon ref={laserConeRef} points="415,1345 214,1255 214,1415" fill="url(#rz-laser-cone)" />
        <polygon ref={laserBeamCoreRef} points="415,1345 212,1310 212,1380" fill="url(#rz-laser-cone)" opacity="0.55" />

        {/* Sleek 3D-Beveled Smartphone Scanner with Live On-Screen QR Mirror */}
        <g ref={phoneScannerRef} transform="translate(432, 1375) rotate(-12)">
          {/* 3D Side Chassis Depth Extrusion */}
          <rect
            x="-46"
            y="-98"
            width="104"
            height="198"
            rx="19"
            fill="#040002"
            stroke="#4c5c82"
            strokeWidth="1.5"
          />
          {/* Main Brushed Titanium Frame */}
          <rect
            x="-52"
            y="-102"
            width="104"
            height="198"
            rx="18"
            fill="url(#rz-obsidian)"
            stroke="#a9bcf0"
            strokeWidth="2.5"
          />
          {/* OLED Screen Display */}
          <rect x="-45" y="-92" width="90" height="178" rx="13" fill="#080104" stroke="#ff1a1a" strokeWidth="1.4" />
          {/* Diagonal Glass Specular Reflection */}
          <polygon points="-44,-90 12,-90 -44,25" fill="#ffffff" opacity="0.04" />
          {/* Dynamic Island + Camera Sensor */}
          <rect x="-18" y="-84" width="36" height="7" rx="3.5" fill="#1f050a" />
          <circle cx="10" cy="-80.5" r="2" fill="#4f6fa8" />
          {/* App Header */}
          <text x="0" y="-66" textAnchor="middle" fill="#a9bcf0" fontSize="7.5" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
            PS APP · SCANNER
          </text>
          {/* Live Mirrored Mini-QR Viewfinder on Phone Screen */}
          <rect
            x="-30"
            y="-54"
            width="60"
            height="60"
            rx="7"
            fill="#120206"
            stroke="#ff1a1a"
            strokeWidth="2"
            strokeDasharray="14 7"
          />
          {/* Mini Finder Squares inside Phone Viewfinder */}
          <rect x="-22" y="-46" width="12" height="12" fill="none" stroke="#ff1a1a" strokeWidth="2.2" />
          <rect x="10" y="-46" width="12" height="12" fill="none" stroke="#ff1a1a" strokeWidth="2.2" />
          <rect x="-22" y="-14" width="12" height="12" fill="none" stroke="#ff1a1a" strokeWidth="2.2" />
          <rect x="-6" y="-30" width="5" height="5" fill="#ffffff" />
          <rect x="3" y="-22" width="5" height="5" fill="#a9bcf0" />
          <rect x="-4" y="-14" width="5" height="5" fill="#ffffff" />
          <circle cx="0" cy="-24" r="9" fill="#ff1a1a" opacity="0.45" filter="url(#rz-glow-red)" />
          {/* App Brand & Approve CTA */}
          <text x="0" y="26" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold" fontFamily="monospace" letterSpacing="1.2">
            RED ZONE
          </text>
          <text x="0" y="38" textAnchor="middle" fill="#a9bcf0" fontSize="7" fontFamily="monospace">
            PRIMARY SLOT · PS5
          </text>
          <rect x="-32" y="48" width="64" height="18" rx="9" fill="#ff1a1a" filter="url(#rz-glow-red)" />
          <text x="0" y="60" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace" letterSpacing="1">
            APPROVE
          </text>
          {/* Home Indicator Bar */}
          <rect x="-16" y="78" width="32" height="3" rx="1.5" fill="#a9bcf0" opacity="0.5" />
        </g>

        {/* ===================================================================
            STAGE 3 (y: 1800..2700, strictly centered at x: 300):
            ORBITING PLAYSTATION SYMBOLS, PLATINUM TROPHY & SCULPTED PS5 TOWER
           =================================================================== */}
        {/* Orbiting PlayStation Shapes around the Stage 3 Data Helix */}
        <g ref={splashGroupRef}>
          {Array.from({ length: 14 }).map((_, i) => (
            <g key={i}>
              {i % 2 === 0 ? (
                <polygon points="0,-10 9,7 -9,7" fill="none" stroke="#ff1a1a" strokeWidth="3" filter="url(#rz-glow-red)" />
              ) : (
                <circle cx="0" cy="0" r="8" fill="none" stroke="#a9bcf0" strokeWidth="3" filter="url(#rz-glow-ice)" />
              )}
            </g>
          ))}
        </g>

        {/* Propagating Concentric 3D Arena Shockwaves under the PS5 Console (y: 2535) */}
        <g ref={shockwavesRef} transform="translate(300, 2535)">
          <ellipse cx="0" cy="0" rx="80" ry="26" fill="none" stroke="#ff1a1a" strokeWidth="3.5" />
          <ellipse cx="0" cy="0" rx="130" ry="42" fill="none" stroke="#a9bcf0" strokeWidth="3" />
          <ellipse cx="0" cy="0" rx="180" ry="58" fill="none" stroke={accentHex} strokeWidth="3" />
        </g>

        {/* Rotating Energy Halo under the PS5 Console Tower (x=300, y=2535) */}
        <g ref={ps5AuraRef} transform="translate(300, 2535) scale(1, 0.34)">
          <circle cx="0" cy="0" r="215" fill="none" stroke="#ff1a1a" strokeWidth="7" strokeDasharray="170 42" opacity="0.85" />
          <circle cx="0" cy="0" r="170" fill="none" stroke="#a9bcf0" strokeWidth="6" strokeDasharray="125 32" opacity="0.9" />
          <circle cx="0" cy="0" r="125" fill="none" stroke={accentHex} strokeWidth="6" strokeDasharray="90 25" opacity="0.9" />
          <circle cx="0" cy="0" r="82" fill="none" stroke="#ffffff" strokeWidth="4" strokeDasharray="60 20" opacity="0.85" />
        </g>

        {/* Floating Holographic Platinum Trophy Crest above the PS5 Tower (x=300, y=2130) */}
        <g ref={trophyFloatRef} transform="translate(300, 2130)">
          <circle cx="0" cy="0" r="50" fill="url(#rz-core-flare)" opacity="0.88" />
          <circle cx="0" cy="0" r="36" fill="none" stroke="#a9bcf0" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.65" />
          {/* Sculpted Trophy Cup Handles */}
          <path
            d="M -21 -18 Q -42 -18 -34 4 Q -28 18 -13 13"
            fill="none"
            stroke="url(#rz-gold-trophy)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M 21 -18 Q 42 -18 34 4 Q 28 18 13 13"
            fill="none"
            stroke="url(#rz-gold-trophy)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Trophy Cup Body with Specular Highlight */}
          <path
            d="M -24 -26 L 24 -26 L 16 14 Q 0 26 -16 14 Z"
            fill="url(#rz-gold-trophy)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <path d="M -16 -22 L -6 -22 L -10 10 L -14 8 Z" fill="#ffffff" opacity="0.45" />
          <rect x="-6" y="18" width="12" height="14" rx="2" fill="url(#rz-gold-trophy)" />
          <rect x="-20" y="32" width="40" height="9" rx="3.5" fill="url(#rz-obsidian)" stroke="#a9bcf0" strokeWidth="1.5" />
        </g>

        {/* SCULPTED STANDING PS5 CONSOLE TOWER & ARENA BASE (Strictly Centered at x=300, y=2380) */}
        <g transform="translate(300, 2380)">
          {/* Multi-Tiered Arena Pedestal */}
          <ellipse cx="0" cy="156" rx="148" ry="32" fill="url(#rz-obsidian)" stroke="#ff1a1a" strokeWidth="2.5" />
          <ellipse cx="0" cy="151" rx="112" ry="22" fill="#170409" stroke="#a9bcf0" strokeWidth="1.5" />
          <ellipse cx="0" cy="147" rx="68" ry="12" fill="url(#rz-metal-bevel)" stroke="#ffffff" strokeWidth="1" />

          {/* Left Swept-Back Matte White PS5 Faceplate Wing */}
          <path
            d="M -70 -170 Q -48 -146 -44 -90 L -40 146 L -78 140 Q -90 10 -70 -170 Z"
            fill="url(#rz-shell-white)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          {/* Left Inner Vent Louvers (PS5 Pro / Slim Styling) */}
          <line x1="-78" y1="-22" x2="-42" y2="-16" stroke="#120408" strokeWidth="3.5" />
          <line x1="-79" y1="-12" x2="-42" y2="-6" stroke="#120408" strokeWidth="3.5" />
          <line x1="-80" y1="-2" x2="-42" y2="4" stroke="#120408" strokeWidth="3.5" />

          {/* Right Swept-Back Matte White PS5 Faceplate Wing */}
          <path
            d="M 70 -170 Q 48 -146 44 -90 L 40 146 L 82 140 Q 94 45 78 -40 Q 73 -110 70 -170 Z"
            fill="url(#rz-shell-white)"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          {/* Right Inner Vent Louvers */}
          <line x1="42" y1="-16" x2="79" y2="-22" stroke="#120408" strokeWidth="3.5" />
          <line x1="42" y1="-6" x2="80" y2="-12" stroke="#120408" strokeWidth="3.5" />
          <line x1="42" y1="4" x2="81" y2="-2" stroke="#120408" strokeWidth="3.5" />
          {/* Optical Disc Slot Detail */}
          <line x1="58" y1="36" x2="58" y2="112" stroke="#2c3a57" strokeWidth="2.5" strokeLinecap="round" />

          {/* Center Glossy Obsidian Console Tower Core */}
          <path
            d="M -43 -154 Q 0 -138 43 -154 L 36 148 L -36 148 Z"
            fill="url(#rz-obsidian)"
            stroke="#2a0c14"
            strokeWidth="1.5"
          />
          {/* Specular Glass Highlight Down Center Core */}
          <path d="M -18 -144 L -6 -144 L -12 142 L -22 142 Z" fill="#ffffff" opacity="0.06" />

          {/* Iconic V-Shaped PS5 Neon LED Light Strips (Blazing Crimson & Ice Blue) */}
          <path
            d="M -43 -150 L -35 140"
            fill="none"
            stroke="#ff1a1a"
            strokeWidth="4.5"
            filter="url(#rz-glow-red)"
          />
          <path d="M -43 -150 L -35 140" fill="none" stroke="#ffffff" strokeWidth="1.4" />
          <path
            d="M 43 -150 L 35 140"
            fill="none"
            stroke="#a9bcf0"
            strokeWidth="4.5"
            filter="url(#rz-glow-ice)"
          />
          <path d="M 43 -150 L 35 140" fill="none" stroke="#ffffff" strokeWidth="1.4" />

          {/* Center PS5 Front USB-C Ports, Power Button & PlayStation Crest */}
          <line x1="0" y1="-100" x2="0" y2="128" stroke="#ff1a1a" strokeWidth="2" opacity="0.6" />
          <circle cx="0" cy="-28" r="15" fill="#160307" stroke="#a9bcf0" strokeWidth="2" />
          <polygon points="0,-35 7.5,-21 -7.5,-21" fill="#ff1a1a" />
          <rect x="-3" y="68" width="6" height="2.5" rx="1" fill="#a9bcf0" />
          <rect x="-3" y="78" width="6" height="2.5" rx="1" fill="#a9bcf0" />
          <rect x="-1.5" y="96" width="3" height="14" rx="1.5" fill="#ff1a1a" filter="url(#rz-glow-red)" />
        </g>
      </svg>
    </div>
  )
}
