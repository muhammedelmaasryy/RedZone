import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v))
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

// Deterministic 15x15 QR data module coordinates (computed once at module load)
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

// Pre-computed 3D ambient background particles for depth-of-field parallax
const BG_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  x: ((Math.sin(i * 73.1) * 0.5 + 0.5) - 0.5) * 560,
  yOffset: (i / 28) * 2600,
  z: 0.35 + (i % 5) * 0.16,
  shape: i % 4, // 0: triangle, 1: circle, 2: cross, 3: square
  speed: 14 + (i % 4) * 6,
  phase: i * 1.7,
}))

function createGlowSprite(colorInner: string, colorMid: string, size = 128): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  if (ctx) {
    const half = size / 2
    const g = ctx.createRadialGradient(half, half, 0, half, half, half)
    g.addColorStop(0, colorInner)
    g.addColorStop(0.38, colorMid)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  return c
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function drawPSSymbol(
  ctx: CanvasRenderingContext2D,
  kind: number,
  size: number,
  color: string,
  lineW = 2.6,
) {
  ctx.strokeStyle = color
  ctx.lineWidth = lineW
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (kind === 0) {
    // Triangle
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.lineTo(size * 0.92, size * 0.7)
    ctx.lineTo(-size * 0.92, size * 0.7)
    ctx.closePath()
    ctx.stroke()
  } else if (kind === 1) {
    // Circle
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.82, 0, Math.PI * 2)
    ctx.stroke()
  } else if (kind === 2) {
    // Cross
    const s = size * 0.7
    ctx.beginPath()
    ctx.moveTo(-s, -s)
    ctx.lineTo(s, s)
    ctx.moveTo(s, -s)
    ctx.lineTo(-s, s)
    ctx.stroke()
  } else {
    // Square
    const s = size * 0.72
    ctx.strokeRect(-s, -s, s * 2, s * 2)
  }
}

/**
 * 4K 60/120fps Hardware-Accelerated Canvas Cinema Engine
 * Zero DOM mutations per frame — renders all 3 stages, volumetric additive glow,
 * depth-sorted 3D double-helix conduits, and 3D hardware models directly on a
 * Retina-scaled HTML5 Canvas for video-grade smoothness on mobile & desktop.
 */
export function ReelSpine({
  scrollRef,
  active = true,
}: {
  scrollRef: RefObject<number>
  accentHex?: string
  active?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    // Pre-render volumetric glow sprites once (zero runtime filter overhead!)
    const redGlow = createGlowSprite('rgba(255, 35, 35, 0.72)', 'rgba(229, 0, 0, 0.22)', 160)
    const iceGlow = createGlowSprite('rgba(195, 215, 255, 0.68)', 'rgba(169, 188, 240, 0.20)', 160)
    const greenGlow = createGlowSprite('rgba(74, 222, 128, 0.68)', 'rgba(34, 197, 94, 0.20)', 160)
    const goldGlow = createGlowSprite('rgba(255, 230, 128, 0.72)', 'rgba(212, 154, 26, 0.22)', 128)

    // Preload mascot image for Stage 1 Shield
    const mascotImg = new Image()
    mascotImg.src = '/brand/mascot.webp'
    let mascotLoaded = false
    mascotImg.onload = () => {
      mascotLoaded = true
    }

    // Pre-cache static DualSense Left & Right Half Path2D geometries
    const leftShellPath = new Path2D(
      'M 0 -68 L -82 -68 Q -138 -66 -152 -8 Q -170 58 -140 138 Q -126 170 -96 158 Q -72 146 -58 86 L -42 40 L 0 40 Z',
    )
    const leftGripPath = new Path2D(
      'M -140 68 Q -130 142 -98 156 Q -74 146 -60 86 L -42 40 L 0 40 L 0 10 L -68 16 Q -114 22 -140 68 Z',
    )
    const leftBumperPath = new Path2D('M -114 -68 Q -74 -94 -26 -76 L -20 -54 L -108 -44 Z')
    const leftTouchpadPath = new Path2D('M 0 -64 L -56 -64 L -44 -6 L 0 -6 Z')

    const rightShellPath = new Path2D(
      'M 0 -68 L 82 -68 Q 138 -66 152 -8 Q 170 58 140 138 Q 126 170 96 158 Q 72 146 58 86 L 42 40 L 0 40 Z',
    )
    const rightGripPath = new Path2D(
      'M 140 68 Q 130 142 98 156 Q 74 146 60 86 L 42 40 L 0 40 L 0 10 L 68 16 Q 114 22 140 68 Z',
    )
    const rightBumperPath = new Path2D('M 114 -68 Q 74 -94 26 -76 L 20 -54 L 108 -44 Z')
    const rightTouchpadPath = new Path2D('M 0 -64 L 56 -64 L 44 -6 L 0 -6 Z')

    const shieldOuterPath = new Path2D(
      'M 0 -130 L 118 -86 L 118 22 C 118 92 66 138 0 160 C -66 138 -118 92 -118 22 L -118 -86 Z',
    )
    const shieldInnerPath = new Path2D(
      'M 0 -118 L 106 -78 L 106 20 C 106 82 58 124 0 144 C -58 124 -106 82 -106 20 L -106 -78 Z',
    )

    const ps5LeftWing = new Path2D(
      'M -70 -170 Q -48 -146 -44 -90 L -40 146 L -78 140 Q -90 10 -70 -170 Z',
    )
    const ps5RightWing = new Path2D(
      'M 70 -170 Q 48 -146 44 -90 L 40 146 L 82 140 Q 94 45 78 -40 Q 73 -110 70 -170 Z',
    )
    const ps5CenterCore = new Path2D('M -43 -154 Q 0 -138 43 -154 L 36 148 L -36 148 Z')

    let viewW = 600
    let viewH = 900
    let dpr = 1
    let isMobile = window.innerWidth < 1024

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      isMobile = window.innerWidth < 1024
      dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      viewW = Math.max(1, rect.width)
      viewH = Math.max(1, rect.height)
      canvas.width = Math.round(viewW * dpr)
      canvas.height = Math.round(viewH * dpr)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    // Smooth S-curve spring camera state
    let curP = clamp(scrollRef.current, 0, 1)
    let velP = 0
    let scrollEnergy = 0
    let accumPhase = 0
    let lastTime = performance.now()
    let raf = 0

    const render = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000))
      lastTime = now
      const t = now / 1000

      const rawP = clamp(scrollRef.current, 0, 1)

      // Critically-damped 2nd-order spring for 4K video-smooth stage transitions
      const omega = 3.85
      const accel = (rawP - curP) * (omega * omega) - 2 * omega * velP
      velP += accel * dt
      curP = clamp(curP + velP * dt, 0, 1)

      const instVel = Math.abs(velP)
      scrollEnergy = clamp(scrollEnergy * Math.exp(-4.5 * dt) + instVel * 0.4, 0, 2.0)
      accumPhase += dt * (1 + scrollEnergy * 1.6)

      const p = curP

      // Map world coordinates (600x900 virtual stage) into the canvas viewport
      const logicalW = isMobile ? 520 : 600
      const logicalH = isMobile ? 670 : 900
      const scale = Math.min(viewW / logicalW, viewH / logicalH)

      // World Y centers for Stage 1 (350), Stage 2 (1345), Stage 3 (2290)
      // Smoothly interpolate camera targetY across the 3 stages
      const targetWorldY =
        p <= 0.5
          ? 355 + (p / 0.5) * (1345 - 355)
          : 1345 + ((p - 0.5) / 0.5) * (2285 - 1345)

      const horizSway = clamp(velP * -24, -18, 18)

      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, viewW, viewH)

      // Center the 600-wide virtual spine at (viewW/2, viewH/2)
      ctx.translate(viewW / 2 + horizSway * scale, viewH / 2)
      ctx.scale(scale, scale)
      ctx.translate(-300, -targetWorldY)

      const visTop = targetWorldY - (viewH / scale) * 0.65
      const visBot = targetWorldY + (viewH / scale) * 0.65

      // =====================================================================
      // 0. AMBIENT 3D PARALLAX PLAYSTATION SYMBOLS & VOLUMETRIC BOKEH
      // =====================================================================
      for (let i = 0; i < BG_PARTICLES.length; i++) {
        const bp = BG_PARTICLES[i]
        const py = ((bp.yOffset - t * bp.speed) % 2600 + 2600) % 2600
        if (py < visTop - 80 || py > visBot + 80) continue
        const px = 300 + bp.x + Math.sin(t * 0.9 + bp.phase) * 18
        const alpha = (0.12 + 0.14 * Math.sin(t * 1.5 + bp.phase)) * bp.z
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(t * 0.4 + bp.phase)
        ctx.globalAlpha = alpha
        drawPSSymbol(
          ctx,
          bp.shape,
          8 * bp.z,
          i % 2 === 0 ? '#ff1a1a' : '#a9bcf0',
          1.8,
        )
        ctx.restore()
      }

      // Central Axis Telemetry Guide Line
      ctx.save()
      ctx.strokeStyle = 'rgba(169, 188, 240, 0.18)'
      ctx.lineWidth = 1.2
      ctx.setLineDash([4, 10])
      ctx.beginPath()
      ctx.moveTo(300, Math.max(100, visTop))
      ctx.lineTo(300, Math.min(2550, visBot))
      ctx.stroke()
      ctx.restore()

      // =====================================================================
      // 1. STAGE 1 (y: 120..935): MASCOT SHIELD + 3D SPLITTING DUALSENSE
      // =====================================================================
      if (visTop < 960) {
        // Core Volumetric Flare behind Shield & Controller
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(redGlow, 300 - 240, 340 - 240, 480, 480)
        ctx.restore()

        // Rotating Orbital Telemetry Rings around Stage 1
        ctx.save()
        ctx.translate(300, 340)
        ctx.rotate(t * 0.25)
        ctx.strokeStyle = 'rgba(255, 26, 26, 0.42)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([14, 9])
        ctx.beginPath()
        ctx.arc(0, 0, 174, 0, Math.PI * 2)
        ctx.stroke()

        ctx.rotate(-t * 0.45)
        ctx.strokeStyle = 'rgba(169, 188, 240, 0.34)'
        ctx.lineWidth = 1.2
        ctx.setLineDash([26, 14])
        ctx.beginPath()
        ctx.arc(0, 0, 198, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Split physics for the DualSense Controller
        const scrollSplit = smoothstep(0.0, 0.35, p)
        const idleBreath = Math.sin(t * 1.85) * 0.5 + 0.5
        const splitAmt = clamp(
          Math.max(0.22 + idleBreath * 0.45, scrollSplit) + scrollEnergy * 0.12,
          0,
          1.15,
        )

        // Cascading 3D-Tumbling Stream of PlayStation Symbols & Blu-Ray Discs (y: 410..935)
        const shardCount = 16
        for (let i = 0; i < shardCount; i++) {
          const speed = 0.26 + (i % 3) * 0.045
          const phase = (i / shardCount + accumPhase * speed + p * 1.1) % 1
          const fall = phase * phase * 0.35 + phase * 0.65
          const sy = 415 + fall * 520
          if (sy < visTop - 40 || sy > visBot + 40) continue

          const env = Math.sin(phase * Math.PI) * Math.pow(1 - phase, 0.6)
          const lane = ((i % 7) - 3) * 32
          const spiral = Math.sin(phase * Math.PI * 3 + t * 2.6 + i * 1.4) * 20
          const sx = 300 + (lane + spiral) * env * (0.7 + splitAmt * 0.45)
          const rot = accumPhase * (1.4 + (i % 4) * 0.45) + i * 0.8
          const baseSc = (0.72 + (i % 3) * 0.16) * (0.45 + Math.sin(phase * Math.PI) * 0.65)
          const tumble = 0.45 + 0.55 * Math.abs(Math.cos(accumPhase * 2.2 + i))
          const op = Math.min(1, Math.sin(phase * Math.PI) * 1.75)

          ctx.save()
          ctx.translate(sx, sy)
          ctx.rotate(rot)
          ctx.scale(baseSc, baseSc * tumble)
          ctx.globalAlpha = op

          const kind = i % 5
          if (kind < 4) {
            const col = kind % 2 === 0 ? '#ff1a1a' : '#a9bcf0'
            drawPSSymbol(ctx, kind, 13, col, 3.2)
          } else {
            // 3D Iridescent PlayStation Blu-Ray Disc
            ctx.fillStyle = '#a9bcf0'
            ctx.beginPath()
            ctx.arc(0, 0, 15, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 1.5
            ctx.stroke()

            ctx.strokeStyle = '#ff1a1a'
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.arc(0, 0, 9.5, 0, Math.PI * 2)
            ctx.stroke()

            ctx.fillStyle = '#050001'
            ctx.beginPath()
            ctx.arc(0, 0, 4, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
        }

        // Energy Plasma Filaments Bridging the Split DualSense Core
        const arcScaleX = 0.35 + splitAmt * 1.05
        const arcOp = clamp((splitAmt - 0.08) * 1.5, 0, 1)
        if (arcOp > 0.02) {
          ctx.save()
          ctx.translate(300, 365)
          ctx.scale(arcScaleX, 1)
          ctx.globalAlpha = arcOp
          ctx.globalCompositeOperation = 'lighter'

          ctx.strokeStyle = '#ff1a1a'
          ctx.lineWidth = 3.2
          ctx.beginPath()
          const wave1 = Math.sin(t * 9) * 12
          ctx.moveTo(-92, -24)
          ctx.quadraticCurveTo(-30, -48 + wave1, 0, -14)
          ctx.quadraticCurveTo(35, 22 - wave1, 92, -20)
          ctx.stroke()

          ctx.strokeStyle = '#a9bcf0'
          ctx.lineWidth = 2.4
          ctx.beginPath()
          ctx.moveTo(-86, 20)
          ctx.quadraticCurveTo(-25, -12 - wave1, 0, 22)
          ctx.quadraticCurveTo(35, 48 + wave1, 86, 16)
          ctx.stroke()
          ctx.restore()
        }

        // RED ZONE MASCOT SHIELD EMBLEM (x=300, y=310)
        const shieldFloatY = 308 + Math.sin(t * 2.2) * 5 - splitAmt * 8
        const shieldScale = 0.96 + splitAmt * 0.08
        ctx.save()
        ctx.translate(300, shieldFloatY)
        ctx.scale(shieldScale, shieldScale)

        // Shield Backing
        ctx.fillStyle = '#240002'
        ctx.fill(shieldOuterPath)

        // Clipped Mascot Artwork inside Shield (preserving exact natural aspect ratio — xMidYMin slice)
        if (mascotLoaded && mascotImg.naturalWidth > 0 && mascotImg.naturalHeight > 0) {
          ctx.save()
          ctx.clip(shieldInnerPath)
          const boxX = -130
          const boxY = -125
          const boxW = 260
          const boxH = 285
          const imgScale = Math.max(boxW / mascotImg.naturalWidth, boxH / mascotImg.naturalHeight)
          const drawW = mascotImg.naturalWidth * imgScale
          const drawH = mascotImg.naturalHeight * imgScale
          const drawX = boxX + (boxW - drawW) / 2
          const drawY = boxY
          ctx.drawImage(mascotImg, drawX, drawY, drawW, drawH)
          ctx.restore()
        }

        // Glowing Shield Borders
        ctx.strokeStyle = 'rgba(255, 26, 26, 0.32)'
        ctx.lineWidth = 12
        ctx.stroke(shieldOuterPath)

        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 5.5
        ctx.stroke(shieldOuterPath)

        ctx.strokeStyle = '#bdc9e7'
        ctx.lineWidth = 3
        ctx.stroke(shieldInnerPath)
        ctx.restore()

        // 3D DUALSENSE CONTROLLER HALVES (LEFT & RIGHT)
        const dx = 28 + splitAmt * 98
        const dy = splitAmt * 12 + Math.sin(t * 2.2) * 4
        const rotRad = ((6 + splitAmt * 21 + Math.cos(t * 1.8) * 1.4) * Math.PI) / 180
        const perspX = 1 - splitAmt * 0.05

        // LEFT HALF
        ctx.save()
        ctx.translate(300 - dx, 365 + dy)
        ctx.rotate(-rotRad)
        ctx.scale(perspX, 1)

        // Exposed Internal Circuitry Core
        ctx.fillStyle = '#170409'
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 1.5
        ctx.fillRect(-18, -58, 18, 96)
        ctx.strokeRect(-18, -58, 18, 96)

        // L1/L2 Bumper
        ctx.fillStyle = '#18050a'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 1.8
        ctx.fill(leftBumperPath)
        ctx.stroke(leftBumperPath)

        // White Sculpted Shell
        const shellGradL = ctx.createLinearGradient(-150, -70, 0, 160)
        shellGradL.addColorStop(0, '#ffffff')
        shellGradL.addColorStop(0.55, '#dce5f7')
        shellGradL.addColorStop(1, '#8c9bb8')
        ctx.fillStyle = shellGradL
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.fill(leftShellPath)
        ctx.stroke(leftShellPath)

        // Lower Obsidian Grip
        ctx.fillStyle = '#120307'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 1.1
        ctx.fill(leftGripPath)
        ctx.stroke(leftGripPath)

        // Left Touchpad Half + Red Lightbar Edge
        ctx.fillStyle = '#19050b'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 1.8
        ctx.fill(leftTouchpadPath)
        ctx.stroke(leftTouchpadPath)
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 3.5
        ctx.beginPath()
        ctx.moveTo(-59, -62)
        ctx.lineTo(-47, -4)
        ctx.stroke()

        // D-Pad
        ctx.save()
        ctx.translate(-96, -14)
        ctx.fillStyle = '#180409'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 1.5
        drawRoundedRect(ctx, -22, -7.5, 44, 15, 3.5)
        ctx.fill()
        ctx.stroke()
        drawRoundedRect(ctx, -7.5, -22, 15, 44, 3.5)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        // Left Analog Stick
        ctx.save()
        ctx.translate(-46, 20)
        ctx.fillStyle = '#090104'
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.arc(0, 0, 19, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(0, 0, 12, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
        ctx.restore()

        // RIGHT HALF
        ctx.save()
        ctx.translate(300 + dx, 365 + dy)
        ctx.rotate(rotRad)
        ctx.scale(perspX, 1)

        ctx.fillStyle = '#170409'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 1.5
        ctx.fillRect(0, -58, 18, 96)
        ctx.strokeRect(0, -58, 18, 96)

        ctx.fillStyle = '#18050a'
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 1.8
        ctx.fill(rightBumperPath)
        ctx.stroke(rightBumperPath)

        const shellGradR = ctx.createLinearGradient(0, -70, 150, 160)
        shellGradR.addColorStop(0, '#ffffff')
        shellGradR.addColorStop(0.55, '#dce5f7')
        shellGradR.addColorStop(1, '#8c9bb8')
        ctx.fillStyle = shellGradR
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.fill(rightShellPath)
        ctx.stroke(rightShellPath)

        ctx.fillStyle = '#120307'
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 1.1
        ctx.fill(rightGripPath)
        ctx.stroke(rightGripPath)

        ctx.fillStyle = '#19050b'
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 1.8
        ctx.fill(rightTouchpadPath)
        ctx.stroke(rightTouchpadPath)
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 3.5
        ctx.beginPath()
        ctx.moveTo(59, -62)
        ctx.lineTo(47, -4)
        ctx.stroke()

        // Action Buttons (Triangle, Circle, Cross, Square)
        ctx.save()
        ctx.translate(96, -14)
        const btnOffsets = [
          { x: 0, y: -17, c: '#a9bcf0' },
          { x: 17, y: 0, c: '#ff1a1a' },
          { x: 0, y: 17, c: '#a9bcf0' },
          { x: -17, y: 0, c: '#ff4d4d' },
        ]
        for (let b = 0; b < 4; b++) {
          const bo = btnOffsets[b]
          ctx.fillStyle = '#140308'
          ctx.strokeStyle = bo.c
          ctx.lineWidth = 1.8
          ctx.beginPath()
          ctx.arc(bo.x, bo.y, 7.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        }
        ctx.restore()

        // Right Analog Stick
        ctx.save()
        ctx.translate(46, 20)
        ctx.fillStyle = '#090104'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.arc(0, 0, 19, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(0, 0, 12, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
        ctx.restore()
      }

      // =====================================================================
      // 2. BOUNDARY 1->2 & STAGE 2 QR PORTAL (y: 890..1620)
      // =====================================================================
      const portalFloatY = 1345 + Math.sin(t * 2.1) * 4

      if (visBot > 880 && visTop < 1720) {
        // 3D Collector Vortex Ring at y = 935
        ctx.save()
        ctx.translate(300, 935)
        ctx.scale(1, 0.3)
        ctx.fillStyle = '#120206'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 3.5
        ctx.beginPath()
        ctx.arc(0, 0, 142, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        ctx.rotate(accumPhase * 1.4)
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 5.5
        ctx.setLineDash([30, 18])
        ctx.beginPath()
        ctx.arc(0, 0, 96, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Vertical Plasma Feed Conduit (y: 955 -> 1180)
        ctx.save()
        ctx.fillStyle = 'rgba(255, 26, 26, 0.3)'
        ctx.fillRect(288, 955, 24, 225)
        ctx.fillStyle = '#ff1a1a'
        ctx.fillRect(295, 955, 10, 225)
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 3
        ctx.setLineDash([20, 14])
        ctx.lineDashOffset = -accumPhase * 180
        ctx.beginPath()
        ctx.moveTo(300, 955)
        ctx.lineTo(300, 1180)
        ctx.stroke()
        ctx.restore()

        const approved = p > 0.72 || (p > 0.32 && Math.sin(t * 1.35) > 0.1)

        // Volumetric Portal Glow
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(
          approved ? greenGlow : redGlow,
          300 - 230,
          portalFloatY - 230,
          460,
          460,
        )
        ctx.restore()

        // Outer Rotating Portal Telemetry Rings
        ctx.save()
        ctx.translate(300, portalFloatY)
        ctx.rotate(accumPhase * 0.4)
        ctx.strokeStyle = approved ? 'rgba(74, 222, 128, 0.6)' : 'rgba(255, 26, 26, 0.6)'
        ctx.lineWidth = 2
        ctx.setLineDash([48, 18, 12, 18])
        ctx.beginPath()
        ctx.arc(0, 0, 190, 0, Math.PI * 2)
        ctx.stroke()

        ctx.rotate(-accumPhase * 0.75)
        ctx.strokeStyle = 'rgba(169, 188, 240, 0.55)'
        ctx.lineWidth = 1.6
        ctx.setLineDash([32, 16])
        ctx.beginPath()
        ctx.arc(0, 0, 166, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Octagonal Holographic QR Sign-In Portal Frame
        ctx.save()
        ctx.translate(300, portalFloatY)

        ctx.fillStyle = '#110206'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 2.4
        ctx.beginPath()
        ctx.moveTo(-136, -166)
        ctx.lineTo(136, -166)
        ctx.lineTo(156, -146)
        ctx.lineTo(156, 146)
        ctx.lineTo(136, 166)
        ctx.lineTo(-136, 166)
        ctx.lineTo(-156, 146)
        ctx.lineTo(-156, -146)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Portal Header Bar
        ctx.fillStyle = '#1a0409'
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 1.2
        drawRoundedRect(ctx, -132, -148, 264, 30, 5)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#ff1a1a'
        ctx.beginPath()
        ctx.arc(-114, -133, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#a9bcf0'
        ctx.beginPath()
        ctx.arc(-100, -133, 4, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('PSN QR SIGN-IN', 0, -129)

        // QR Matrix Vault Box
        ctx.fillStyle = '#050002'
        ctx.strokeStyle = approved ? '#4ade80' : '#ff1a1a'
        ctx.lineWidth = 2
        drawRoundedRect(ctx, -94, -104, 188, 188, 10)
        ctx.fill()
        ctx.stroke()

        // Sweeping Laser Scan Coordinate
        const scanNorm = Math.sin(accumPhase * 2.8) * 0.5 + 0.5
        const scanLocalY = -82 + scanNorm * 144

        // QR Finder Patterns & Data Modules (centered at y = -10)
        ctx.save()
        ctx.translate(0, -10)

        const drawFinder = (fx: number, fy: number) => {
          ctx.strokeStyle = approved ? '#4ade80' : '#ff1a1a'
          ctx.lineWidth = 5
          drawRoundedRect(ctx, fx, fy, 42, 42, 4)
          ctx.stroke()
          ctx.fillStyle = '#a9bcf0'
          ctx.fillRect(fx + 11, fy + 11, 20, 20)
        }
        drawFinder(-78, -78)
        drawFinder(36, -78)
        drawFinder(-78, 36)

        for (let i = 0; i < QR_MODULES.length; i++) {
          const m = QR_MODULES[i]
          const dist = Math.abs(m.y - (scanLocalY + 10))
          const isLit = dist < 16
          ctx.fillStyle = isLit
            ? '#ffffff'
            : m.isIce
              ? '#a9bcf0'
              : 'rgba(226, 232, 248, 0.85)'
          ctx.fillRect(m.x - 3.6, m.y - 3.6, 7.2, 7.2)
        }

        // Center Red Zone Triangle Emblem inside QR
        ctx.fillStyle = '#140307'
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 2
        drawRoundedRect(ctx, -14, -14, 28, 28, 5)
        ctx.fill()
        ctx.stroke()
        drawPSSymbol(ctx, 0, 7, '#ffffff', 2)
        ctx.restore()

        // Status Pill
        ctx.fillStyle = approved ? '#062414' : '#140206'
        ctx.strokeStyle = approved ? '#4ade80' : '#ff1a1a'
        ctx.lineWidth = 1.8
        drawRoundedRect(ctx, -120, 106, 240, 30, 15)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = approved ? '#4ade80' : '#ff1a1a'
        ctx.beginPath()
        ctx.arc(-100, 121, 4.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = approved ? '#86efac' : '#dce6ff'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(
          approved ? 'QR APPROVED · SESSION LOCKED' : 'SCANNING CONSOLE QR...',
          6,
          125,
        )

        // Bottom 3D Plasma Turbine Nozzle (y: +166..+220)
        ctx.fillStyle = '#1b060c'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(-52, 174)
        ctx.lineTo(52, 174)
        ctx.lineTo(35, 218)
        ctx.lineTo(-35, 218)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // Sweeping Laser Scan Line across QR Box
        ctx.strokeStyle = approved ? '#4ade80' : '#ff1a1a'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(-94, scanLocalY)
        ctx.lineTo(94, scanLocalY)
        ctx.stroke()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(-92, scanLocalY)
        ctx.lineTo(92, scanLocalY)
        ctx.stroke()
        ctx.restore()

        // 3D Smartphone Scanner & Volumetric Laser Beam Cone
        const px = 428 + Math.sin(t * 1.8) * 4
        const py = portalFloatY + 28 + Math.cos(t * 2.2) * 4
        const scanWorldY = portalFloatY + scanLocalY

        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        const coneGrad = ctx.createLinearGradient(px - 24, py - 24, 210, portalFloatY)
        coneGrad.addColorStop(0, approved ? 'rgba(74, 222, 128, 0.5)' : 'rgba(255, 26, 26, 0.55)')
        coneGrad.addColorStop(1, 'rgba(255, 26, 26, 0.02)')
        ctx.fillStyle = coneGrad
        ctx.beginPath()
        ctx.moveTo(px - 22, py - 24)
        ctx.lineTo(212, Math.max(portalFloatY - 92, scanWorldY - 48))
        ctx.lineTo(212, Math.min(portalFloatY + 72, scanWorldY + 48))
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        // Smartphone Body
        ctx.save()
        ctx.translate(px, py)
        ctx.rotate((-12 * Math.PI) / 180)
        ctx.fillStyle = '#0c0205'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 2.4
        drawRoundedRect(ctx, -50, -98, 100, 192, 16)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#060103'
        ctx.strokeStyle = approved ? '#4ade80' : '#ff1a1a'
        ctx.lineWidth = 1.3
        drawRoundedRect(ctx, -43, -88, 86, 172, 12)
        ctx.fill()
        ctx.stroke()

        ctx.strokeStyle = approved ? '#4ade80' : '#ff1a1a'
        ctx.lineWidth = 2
        ctx.strokeRect(-26, -50, 52, 52)

        ctx.fillStyle = approved ? '#22c55e' : '#ff1a1a'
        drawRoundedRect(ctx, -30, 44, 60, 18, 9)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 8px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(approved ? 'APPROVED' : 'APPROVE', 0, 56)
        ctx.restore()
      }

      // =====================================================================
      // 3. STAGE 3 (y: 1555..2580): 3D DOUBLE-HELIX, TROPHY & PS5 CONSOLE
      // =====================================================================
      if (visBot > 1520) {
        const phaseShift = accumPhase * 3.2 + p * 8.0
        const startY = portalFloatY + 218
        const endY = 2215
        const spanY = endY - startY
        const turns = 4.0 * Math.PI
        const steps = 48

        const getHelixPt = (u: number, offsetRad: number) => {
          const y = startY + u * spanY
          const pinchTop = smoothstep(0.0, 0.14, u)
          const pinchBot = 1 - smoothstep(0.86, 1.0, u) * 0.72
          const env = Math.sin(u * Math.PI)
          const amp = 4 + (14 + env * 72) * pinchTop * pinchBot
          const theta = u * turns - phaseShift + offsetRad
          return {
            x: 300 + Math.sin(theta) * amp,
            y,
            z: Math.cos(theta),
          }
        }

        // Precompute points for this frame in a compact array (zero DOM string allocation!)
        const redPts: Array<{ x: number; y: number; z: number }> = []
        const icePts: Array<{ x: number; y: number; z: number }> = []
        for (let i = 0; i <= steps; i++) {
          const u = i / steps
          redPts.push(getHelixPt(u, 0))
          icePts.push(getHelixPt(u, Math.PI))
        }

        // 1. Back Layer of Crimson Strand
        ctx.save()
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#990000'
        ctx.lineWidth = 17
        ctx.beginPath()
        for (let i = 0; i <= steps; i++) {
          const pt = redPts[i]
          if (i === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        }
        ctx.stroke()

        // 2. Full Ice-Blue 3D Conduit Strand
        ctx.strokeStyle = 'rgba(4, 0, 2, 0.55)'
        ctx.lineWidth = 24
        ctx.beginPath()
        for (let i = 0; i <= steps; i++) {
          const pt = icePts[i]
          if (i === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        }
        ctx.stroke()

        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 16
        ctx.stroke()

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        ctx.stroke()

        // 3. Front-Crossing Arches of Crimson Strand (where z >= 0)
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 18
        ctx.beginPath()
        let inFront = false
        for (let i = 0; i <= steps; i++) {
          const pt = redPts[i]
          if (pt.z >= 0) {
            if (!inFront) {
              ctx.moveTo(pt.x, pt.y)
              inFront = true
            } else {
              ctx.lineTo(pt.x, pt.y)
            }
          } else {
            inFront = false
          }
        }
        ctx.stroke()
        ctx.strokeStyle = '#ffd6d6'
        ctx.lineWidth = 4
        ctx.stroke()
        ctx.restore()

        // Arena Base Glow & Shockwaves (y = 2535)
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(redGlow, 300 - 250, 2380 - 220, 500, 440)
        ctx.drawImage(iceGlow, 300 - 210, 2535 - 120, 420, 240)
        ctx.restore()

        for (let i = 0; i < 3; i++) {
          const waveP = (accumPhase * 0.45 + i * 0.33) % 1
          const rx = 55 + waveP * 180
          const ry = rx * 0.32
          const op = (1 - waveP) * smoothstep(0.0, 0.2, waveP) * 0.7
          ctx.save()
          ctx.translate(300, 2535)
          ctx.strokeStyle = i % 2 === 0 ? '#ff1a1a' : '#a9bcf0'
          ctx.globalAlpha = op
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }

        // Floating Gold/Platinum Trophy (x = 300, y = 2130)
        const ty = 2130 + Math.sin(t * 2.6) * 6
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.drawImage(goldGlow, 300 - 64, ty - 64, 128, 128)
        ctx.restore()

        ctx.save()
        ctx.translate(300, ty)
        ctx.fillStyle = '#f59e0b'
        ctx.strokeStyle = '#fef08a'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(-22, -24)
        ctx.lineTo(22, -24)
        ctx.lineTo(15, 12)
        ctx.quadraticCurveTo(0, 24, -15, 12)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.fillRect(-5, 16, 10, 14)
        ctx.fillStyle = '#160308'
        ctx.strokeStyle = '#a9bcf0'
        drawRoundedRect(ctx, -18, 30, 36, 9, 3)
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        // SCULPTED STANDING PS5 CONSOLE TOWER (x = 300, y = 2380)
        ctx.save()
        ctx.translate(300, 2380)

        // Base Pedestal
        ctx.fillStyle = '#120206'
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 2.4
        ctx.beginPath()
        ctx.ellipse(0, 154, 144, 30, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        // Left & Right White Faceplates
        const wingGrad = ctx.createLinearGradient(-80, -170, 80, 150)
        wingGrad.addColorStop(0, '#ffffff')
        wingGrad.addColorStop(0.6, '#dce5f7')
        wingGrad.addColorStop(1, '#8c9bb8')
        ctx.fillStyle = wingGrad
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.fill(ps5LeftWing)
        ctx.stroke(ps5LeftWing)
        ctx.fill(ps5RightWing)
        ctx.stroke(ps5RightWing)

        // Center Glossy Obsidian Core
        ctx.fillStyle = '#0d0205'
        ctx.strokeStyle = '#2a0c14'
        ctx.lineWidth = 1.5
        ctx.fill(ps5CenterCore)
        ctx.stroke(ps5CenterCore)

        // Dual Breathing Neon LED Strips (Crimson Left, Ice-Blue Right)
        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(-43, -150)
        ctx.lineTo(-35, 140)
        ctx.stroke()

        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(43, -150)
        ctx.lineTo(35, 140)
        ctx.stroke()

        // Center Power Emblem
        ctx.fillStyle = '#160307'
        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, -28, 14, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        drawPSSymbol(ctx, 0, 6.5, '#ff1a1a', 2)
        ctx.restore()
      }

      ctx.restore()
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active, scrollRef])

  return (
    <div className="pointer-events-none relative flex h-full w-full items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-full w-full select-none"
      />
    </div>
  )
}
