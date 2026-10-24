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
    ctx.beginPath()
    ctx.moveTo(0, -size)
    ctx.lineTo(size * 0.92, size * 0.7)
    ctx.lineTo(-size * 0.92, size * 0.7)
    ctx.closePath()
    ctx.stroke()
  } else if (kind === 1) {
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.82, 0, Math.PI * 2)
    ctx.stroke()
  } else if (kind === 2) {
    const s = size * 0.7
    ctx.beginPath()
    ctx.moveTo(-s, -s)
    ctx.lineTo(s, s)
    ctx.moveTo(s, -s)
    ctx.lineTo(-s, s)
    ctx.stroke()
  } else {
    const s = size * 0.72
    ctx.strokeRect(-s, -s, s * 2, s * 2)
  }
}

/**
 * Renders the Striped Holographic Circle satellite from commit d7a8f3fe.
 */
function drawStripedCircle(ctx: CanvasRenderingContext2D, radius: number, angle: number) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.clip()

  ctx.fillStyle = '#140003'
  ctx.fill()

  ctx.save()
  ctx.rotate(angle)
  ctx.strokeStyle = 'rgba(229, 0, 0, 0.65)'
  ctx.lineWidth = 3.5
  for (let x = -radius * 1.6; x <= radius * 1.6; x += 7) {
    ctx.beginPath()
    ctx.moveTo(x, -radius * 1.6)
    ctx.lineTo(x, radius * 1.6)
    ctx.stroke()
  }
  ctx.restore()

  ctx.strokeStyle = '#a9bcf0'
  ctx.lineWidth = 2.4
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255, 26, 26, 0.55)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(0, 0, radius - 3, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

/**
 * Pre-renders the 3D Mascot Shield Plate with rich depth, glossy glass sheen,
 * and dual crimson/ice-blue neon rims from commit d7a8f3fe.
 */
function bakeShieldSprite(mascotImg?: HTMLImageElement): HTMLCanvasElement {
  const w = 380
  const h = 440
  const dpr = 1.5
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return c

  ctx.scale(dpr, dpr)
  ctx.translate(w / 2, 220)

  // Exact shield paths from commit d7a8f3fe normalized to center (0, 0)
  const shieldOuterPath = new Path2D(
    'M 0 -210 L 180 -150 L 180 10 C 180 110 100 180 0 210 C -100 180 -180 110 -180 10 L -180 -150 Z',
  )
  const shieldInnerPath = new Path2D(
    'M 0 -194 L 166 -138 L 166 10 C 166 100 92 164 0 192 C -92 164 -166 100 -166 10 L -166 -138 Z',
  )

  // 1. Deep crimson metallic base fill
  const baseGrad = ctx.createLinearGradient(0, -210, 0, 210)
  baseGrad.addColorStop(0, '#2e0005')
  baseGrad.addColorStop(0.5, '#160002')
  baseGrad.addColorStop(1, '#080001')
  ctx.fillStyle = baseGrad
  ctx.fill(shieldOuterPath)

  // 2. Mascot image clipped inside inner shield with glass reflection and vignette
  if (mascotImg && mascotImg.naturalWidth > 0 && mascotImg.naturalHeight > 0) {
    ctx.save()
    ctx.clip(shieldInnerPath)

    const boxX = -180
    const boxY = -190
    const boxW = 360
    const boxH = 400
    const imgScale = Math.max(boxW / mascotImg.naturalWidth, boxH / mascotImg.naturalHeight)
    const drawW = mascotImg.naturalWidth * imgScale
    const drawH = mascotImg.naturalHeight * imgScale
    const drawX = boxX + (boxW - drawW) / 2
    const drawY = boxY
    ctx.drawImage(mascotImg, drawX, drawY, drawW, drawH)

    // Inner 3D cavity vignette (creates recessed depth behind the metallic frame)
    const innerVignette = ctx.createLinearGradient(0, -194, 0, 192)
    innerVignette.addColorStop(0, 'rgba(10, 0, 2, 0.55)')
    innerVignette.addColorStop(0.2, 'rgba(0, 0, 0, 0)')
    innerVignette.addColorStop(0.8, 'rgba(0, 0, 0, 0)')
    innerVignette.addColorStop(1, 'rgba(20, 0, 3, 0.75)')
    ctx.fillStyle = innerVignette
    ctx.fill(shieldInnerPath)

    // 3D Glass diagonal specular reflection sheen
    ctx.beginPath()
    ctx.moveTo(-180, -190)
    ctx.lineTo(80, -190)
    ctx.lineTo(-40, 120)
    ctx.lineTo(-180, 50)
    ctx.closePath()
    const glassGrad = ctx.createLinearGradient(-150, -180, 60, 80)
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)')
    glassGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.08)')
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = glassGrad
    ctx.fill()

    ctx.restore()
  }

  // 3. Outer Crimson 3D Armor Rim
  ctx.strokeStyle = 'rgba(255, 26, 26, 0.28)'
  ctx.lineWidth = 18
  ctx.stroke(shieldOuterPath)

  const rimGrad = ctx.createLinearGradient(0, -210, 0, 210)
  rimGrad.addColorStop(0, '#ff4d4d')
  rimGrad.addColorStop(0.3, '#ff1a1a')
  rimGrad.addColorStop(0.7, '#c20002')
  rimGrad.addColorStop(1, '#660001')
  ctx.strokeStyle = rimGrad
  ctx.lineWidth = 9
  ctx.stroke(shieldOuterPath)

  // Top metallic crest specular highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(-100, -177)
  ctx.lineTo(0, -210)
  ctx.lineTo(100, -177)
  ctx.stroke()

  // 4. Inner Ice-Blue Bevel Rim (stroke="#bdc9e7" strokeWidth="7" from commit d7a8f3fe)
  ctx.strokeStyle = 'rgba(189, 201, 231, 0.35)'
  ctx.lineWidth = 10
  ctx.stroke(shieldInnerPath)

  ctx.strokeStyle = '#bdc9e7'
  ctx.lineWidth = 5.5
  ctx.stroke(shieldInnerPath)

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.moveTo(-80, -164)
  ctx.lineTo(0, -194)
  ctx.lineTo(80, -164)
  ctx.stroke()

  return c
}

/**
 * Pre-renders the 3D Extrusion Backing for the shield, providing physical depth
 * when viewed from angles or when tilted.
 */
function bakeShieldExtrusionSprite(): HTMLCanvasElement {
  const w = 380
  const h = 440
  const dpr = 1.5
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return c

  ctx.scale(dpr, dpr)
  ctx.translate(w / 2, 220)

  const shieldOuterPath = new Path2D(
    'M 0 -210 L 180 -150 L 180 10 C 180 110 100 180 0 210 C -100 180 -180 110 -180 10 L -180 -150 Z',
  )

  ctx.fillStyle = '#0a0002'
  ctx.fill(shieldOuterPath)

  ctx.strokeStyle = '#550005'
  ctx.lineWidth = 8
  ctx.stroke(shieldOuterPath)

  return c
}

/**
 * Pre-renders the Stage 2 Octagonal QR Portal & 15x15 QR matrix into an offscreen sprite.
 */
function bakeQRPortalSprite(approved: boolean): HTMLCanvasElement {
  const w = 340
  const h = 410
  const dpr = 1.5
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return c

  ctx.scale(dpr, dpr)
  ctx.translate(w / 2, 180)

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

  ctx.fillStyle = '#050002'
  ctx.strokeStyle = approved ? '#4ade80' : '#ff1a1a'
  ctx.lineWidth = 2
  drawRoundedRect(ctx, -94, -104, 188, 188, 10)
  ctx.fill()
  ctx.stroke()

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
    ctx.fillStyle = m.isIce ? '#a9bcf0' : 'rgba(226, 232, 248, 0.88)'
    ctx.fillRect(m.x - 3.6, m.y - 3.6, 7.2, 7.2)
  }

  ctx.fillStyle = '#140307'
  ctx.strokeStyle = '#ff1a1a'
  ctx.lineWidth = 2
  drawRoundedRect(ctx, -14, -14, 28, 28, 5)
  ctx.fill()
  ctx.stroke()
  drawPSSymbol(ctx, 0, 7, '#ffffff', 2)
  ctx.restore()

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
  ctx.fillText(approved ? 'QR APPROVED · SESSION LOCKED' : 'SCANNING CONSOLE QR...', 6, 125)

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

  return c
}

/**
 * Pre-renders the Stage 3 Standing PS5 Console Tower into an offscreen sprite.
 */
function bakePS5TowerSprite(): HTMLCanvasElement {
  const w = 320
  const h = 380
  const dpr = 1.5
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return c

  ctx.scale(dpr, dpr)
  ctx.translate(w / 2, 185)

  const ps5LeftWing = new Path2D(
    'M -70 -170 Q -48 -146 -44 -90 L -40 146 L -78 140 Q -90 10 -70 -170 Z',
  )
  const ps5RightWing = new Path2D(
    'M 70 -170 Q 48 -146 44 -90 L 40 146 L 82 140 Q 94 45 78 -40 Q 73 -110 70 -170 Z',
  )
  const ps5CenterCore = new Path2D('M -43 -154 Q 0 -138 43 -154 L 36 148 L -36 148 Z')

  const wingGrad = ctx.createLinearGradient(-80, -170, 80, 150)
  wingGrad.addColorStop(0, '#ffffff')
  wingGrad.addColorStop(0.6, '#dce5f7')
  wingGrad.addColorStop(1, '#8c9bb8')

  ctx.fillStyle = '#120206'
  ctx.strokeStyle = '#ff1a1a'
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.ellipse(0, 154, 144, 30, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = wingGrad
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1.5
  ctx.fill(ps5LeftWing)
  ctx.stroke(ps5LeftWing)
  ctx.fill(ps5RightWing)
  ctx.stroke(ps5RightWing)

  ctx.fillStyle = '#0d0205'
  ctx.strokeStyle = '#2a0c14'
  ctx.lineWidth = 1.5
  ctx.fill(ps5CenterCore)
  ctx.stroke(ps5CenterCore)

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

  ctx.fillStyle = '#160307'
  ctx.strokeStyle = '#a9bcf0'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, -28, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  drawPSSymbol(ctx, 0, 6.5, '#ff1a1a', 2)

  return c
}

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
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Pre-render volumetric glow sprites
    const redGlow = createGlowSprite('rgba(255, 35, 35, 0.75)', 'rgba(229, 0, 0, 0.22)', 140)
    const iceGlow = createGlowSprite('rgba(195, 215, 255, 0.65)', 'rgba(169, 188, 240, 0.18)', 128)
    const greenGlow = createGlowSprite('rgba(74, 222, 128, 0.65)', 'rgba(34, 197, 94, 0.18)', 128)
    const goldGlow = createGlowSprite('rgba(255, 230, 128, 0.70)', 'rgba(212, 154, 26, 0.20)', 96)

    // Pre-baked sprites (Stage 1 3D Shield, Stage 2 QR Portal, Stage 3 PS5 Tower)
    const shieldExtrusionSprite = bakeShieldExtrusionSprite()
    const qrPortalScanSprite = bakeQRPortalSprite(false)
    const qrPortalApprovedSprite = bakeQRPortalSprite(true)
    const ps5TowerSprite = bakePS5TowerSprite()

    let shieldSprite = bakeShieldSprite()
    const mascotImg = new Image()
    mascotImg.src = '/brand/mascot.webp'
    mascotImg.onload = () => {
      shieldSprite = bakeShieldSprite(mascotImg)
    }

    // Pre-allocated helix point buffers (32 segments for sub-millisecond rendering)
    const steps = 32
    const redPts = Array.from({ length: steps + 1 }, () => ({ x: 0, y: 0, z: 0 }))
    const icePts = Array.from({ length: steps + 1 }, () => ({ x: 0, y: 0, z: 0 }))

    let viewW = 500
    let viewH = 750
    let dpr = 1
    let isMobile = window.innerWidth < 1024

    // 3D Pointer & Gyro Tracking for authentic perspective tilt
    let mouseX = 0
    let mouseY = 0
    let smoothMx = 0
    let smoothMy = 0

    const onPointerMove = (e: globalThis.PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = clamp(((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1, -1, 1)
      mouseY = clamp(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1, -1, 1)
    }

    const onPointerLeave = () => {
      mouseX = 0
      mouseY = 0
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      isMobile = window.innerWidth < 1024
      dpr = Math.min(window.devicePixelRatio || 1, 1.35)
      viewW = Math.max(1, Math.min(rect.width, 540))
      viewH = Math.max(1, rect.height)
      canvas.width = Math.round(viewW * dpr)
      canvas.height = Math.round(viewH * dpr)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

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

      // Critically-damped 2nd-order spring for silky stage transitions
      const omega = 3.85
      const accel = (rawP - curP) * (omega * omega) - 2 * omega * velP
      velP += accel * dt
      curP = clamp(curP + velP * dt, 0, 1)

      const instVel = Math.abs(velP)
      scrollEnergy = clamp(scrollEnergy * Math.exp(-4.5 * dt) + instVel * 0.4, 0, 2.0)
      accumPhase += dt * (1 + scrollEnergy * 1.6)

      // Smooth pointer spring interpolation for 3D tilt
      smoothMx += (mouseX - smoothMx) * 0.08
      smoothMy += (mouseY - smoothMy) * 0.08

      const tiltY = smoothMx * 0.16 + Math.sin(t * 1.5) * 0.03
      const tiltX = -smoothMy * 0.12 + Math.cos(t * 1.2) * 0.025
      const parallaxX = smoothMx * 18
      const parallaxY = smoothMy * 12

      const p = curP

      const logicalW = isMobile ? 510 : 540
      const logicalH = isMobile ? 560 : 760
      const scale = Math.min(viewW / logicalW, viewH / logicalH)

      const targetWorldY =
        p <= 0.5
          ? 355 + (p / 0.5) * (1345 - 355)
          : 1345 + ((p - 0.5) / 0.5) * (2285 - 1345)

      const horizSway = clamp(velP * -22, -16, 16)

      ctx.save()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, viewW, viewH)

      ctx.translate(viewW / 2 + horizSway * scale, viewH / 2)
      ctx.scale(scale, scale)
      ctx.translate(-300, -targetWorldY)

      const visTop = targetWorldY - (viewH / scale) * 0.62
      const visBot = targetWorldY + (viewH / scale) * 0.62

      // =====================================================================
      // 1. STAGE 1 (y: 120..935): 3D MASCOT SHIELD & ORBITAL EMBLEMS
      //    (DualSense controller halves removed; 3D Emblem with full perspective)
      // =====================================================================
      if (visTop < 960) {
        // Red volumetric aura backdrop
        ctx.drawImage(redGlow, 300 - 250, 330 - 250, 500, 500)

        // 3D Orbital Halo Rings around Stage 1 (from commit d7a8f3fe's HeroScene)
        ctx.save()
        ctx.translate(300 + parallaxX * 0.35, 330 + parallaxY * 0.35)
        ctx.rotate(-0.16)
        ctx.scale(1, 0.38)

        ctx.rotate(t * 0.22)
        ctx.strokeStyle = 'rgba(255, 26, 26, 0.45)'
        ctx.lineWidth = 2.2
        ctx.beginPath()
        ctx.arc(0, 0, 230, 0, Math.PI * 2)
        ctx.stroke()

        ctx.rotate(-t * 0.42)
        ctx.strokeStyle = 'rgba(169, 188, 240, 0.42)'
        ctx.lineWidth = 1.8
        ctx.beginPath()
        ctx.arc(0, 0, 260, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        const scrollSplit = smoothstep(0.0, 0.35, p)
        const idleBreath = Math.sin(t * 1.85) * 0.5 + 0.5
        const splitAmt = clamp(
          Math.max(0.22 + idleBreath * 0.45, scrollSplit) + scrollEnergy * 0.12,
          0,
          1.15,
        )

        // Cascading Stream of PlayStation Symbols & Blu-Ray Discs
        const shardCount = 10
        for (let i = 0; i < shardCount; i++) {
          const speed = 0.26 + (i % 3) * 0.045
          const phase = (i / shardCount + accumPhase * speed + p * 1.1) % 1
          const fall = phase * phase * 0.35 + phase * 0.65
          const sy = 415 + fall * 520
          if (sy < visTop - 40 || sy > visBot + 40) continue

          const env = Math.sin(phase * Math.PI) * Math.pow(1 - phase, 0.6)
          const lane = ((i % 5) - 2) * 44
          const spiral = Math.sin(phase * Math.PI * 3 + t * 2.4 + i * 1.4) * 20
          const sx = 300 + (lane + spiral) * env * (0.8 + splitAmt * 0.4)
          const rot = accumPhase * (1.4 + (i % 4) * 0.45) + i * 0.8
          const baseSc = (0.76 + (i % 3) * 0.15) * (0.45 + Math.sin(phase * Math.PI) * 0.65)
          const op = Math.min(1, Math.sin(phase * Math.PI) * 1.75)

          ctx.save()
          ctx.translate(sx, sy)
          ctx.rotate(rot)
          ctx.scale(baseSc, baseSc)
          ctx.globalAlpha = op

          const kind = i % 5
          if (kind < 4) {
            drawPSSymbol(ctx, kind, 13, kind % 2 === 0 ? '#ff1a1a' : '#a9bcf0', 3.0)
          } else {
            ctx.fillStyle = '#a9bcf0'
            ctx.beginPath()
            ctx.arc(0, 0, 14, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = '#050001'
            ctx.beginPath()
            ctx.arc(0, 0, 4, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.restore()
        }

        // RED ZONE 3D MASCOT SHIELD EMBLEM (Substantial 3D scale & bevel depth)
        const shieldFloatY = 325 + Math.sin(t * 2.2) * 6 - p * 30
        const shieldScale = 0.98 + Math.sin(t * 1.8) * 0.02

        ctx.save()
        ctx.translate(300 + parallaxX, shieldFloatY + parallaxY)

        // 3D Extrusion thickness slices (drawing 4 depth layers behind to create physical slab depth)
        for (let d = 4; d >= 1; d--) {
          const depthOffset = d * 3.2
          const ox = -tiltY * depthOffset
          const oy = -tiltX * depthOffset + d * 1.2
          ctx.drawImage(shieldExtrusionSprite, -190 + ox, -220 + oy, 380, 440)
        }

        // Main 3D Shield Face with simulated perspective transform
        ctx.save()
        ctx.scale(shieldScale * (1 - Math.abs(tiltY) * 0.08), shieldScale * (1 - Math.abs(tiltX) * 0.06))
        ctx.rotate(tiltY * 0.45)
        ctx.transform(1, tiltY * 0.1, 0, 1, 0, 0)
        ctx.drawImage(shieldSprite, -190, -220, 380, 440)
        ctx.restore()

        // 3D Floating Satellites from commit d7a8f3fe (orbiting around the shield in 3D foreground)
        // 1. Red Neon Triangle (Top-Left)
        ctx.save()
        const triX = -170 + tiltY * 34
        const triY = -125 + tiltX * 28 + Math.sin(t * 2.0) * 12
        ctx.translate(triX, triY)
        ctx.rotate(Math.sin(t * 1.4) * 0.18 + tiltY * 0.4)
        drawPSSymbol(ctx, 0, 22, '#ff1a1a', 4.0)
        ctx.restore()

        // 2. Striped Holographic Circle (Mid-Right)
        ctx.save()
        const cirX = 180 + tiltY * 38
        const cirY = -25 + tiltX * 30 + Math.cos(t * 1.8) * 10
        ctx.translate(cirX, cirY)
        drawStripedCircle(ctx, 24, -t * 0.3)
        ctx.restore()

        // 3. Ice-Blue 3D Spinning Square (Bottom-Left)
        ctx.save()
        const sqX = -155 + tiltY * 28
        const sqY = 145 + tiltX * 24
        ctx.translate(sqX, sqY)
        ctx.scale(Math.cos(t * 1.3), 1) // 3D coin spin!
        drawPSSymbol(ctx, 3, 20, '#bdc9e7', 3.5)
        ctx.restore()

        // 4. PlayStation Cross (Bottom-Right)
        ctx.save()
        const crossX = 165 + tiltY * 30
        const crossY = 135 + tiltX * 26 + Math.sin(t * 1.6 + 1) * 8
        ctx.translate(crossX, crossY)
        ctx.rotate(Math.PI / 4 + Math.sin(t * 0.9) * 0.15)
        drawPSSymbol(ctx, 2, 18, '#ff4d4d', 3.5)
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

        ctx.strokeStyle = '#ff1a1a'
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.arc(0, 0, 96, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Vertical Plasma Feed Conduit (y: 955 -> 1180)
        ctx.fillStyle = 'rgba(255, 26, 26, 0.28)'
        ctx.fillRect(288, 955, 24, 225)
        ctx.fillStyle = '#ff1a1a'
        ctx.fillRect(295, 955, 10, 225)

        const approved = p > 0.72 || (p > 0.32 && Math.sin(t * 1.35) > 0.1)

        ctx.drawImage(
          approved ? greenGlow : redGlow,
          300 - 210,
          portalFloatY - 210,
          420,
          420,
        )

        // Pre-baked Octagonal QR Portal Sprite (single GPU drawImage!)
        ctx.drawImage(
          approved ? qrPortalApprovedSprite : qrPortalScanSprite,
          300 - 170,
          portalFloatY - 180,
          340,
          410,
        )

        // Animated Horizontal Laser Scan Bar
        const scanNorm = Math.sin(accumPhase * 2.8) * 0.5 + 0.5
        const scanLocalY = -82 + scanNorm * 144
        const scanWorldY = portalFloatY + scanLocalY

        ctx.strokeStyle = approved ? '#4ade80' : '#ff1a1a'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(300 - 94, scanWorldY)
        ctx.lineTo(300 + 94, scanWorldY)
        ctx.stroke()

        // 3D Smartphone Scanner & Laser Beam Cone
        const px = 428 + Math.sin(t * 1.8) * 4
        const py = portalFloatY + 28 + Math.cos(t * 2.2) * 4

        ctx.fillStyle = approved ? 'rgba(74, 222, 128, 0.20)' : 'rgba(255, 26, 26, 0.22)'
        ctx.beginPath()
        ctx.moveTo(px - 22, py - 24)
        ctx.lineTo(212, Math.max(portalFloatY - 92, scanWorldY - 48))
        ctx.lineTo(212, Math.min(portalFloatY + 72, scanWorldY + 48))
        ctx.closePath()
        ctx.fill()

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

        for (let i = 0; i <= steps; i++) {
          const u = i / steps
          const y = startY + u * spanY
          const pinchTop = smoothstep(0.0, 0.14, u)
          const pinchBot = 1 - smoothstep(0.86, 1.0, u) * 0.72
          const env = Math.sin(u * Math.PI)
          const amp = 4 + (14 + env * 72) * pinchTop * pinchBot

          const thetaR = u * turns - phaseShift
          redPts[i].x = 300 + Math.sin(thetaR) * amp
          redPts[i].y = y
          redPts[i].z = Math.cos(thetaR)

          const thetaI = thetaR + Math.PI
          icePts[i].x = 300 + Math.sin(thetaI) * amp
          icePts[i].y = y
          icePts[i].z = Math.cos(thetaI)
        }

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

        ctx.strokeStyle = '#a9bcf0'
        ctx.lineWidth = 16
        ctx.beginPath()
        for (let i = 0; i <= steps; i++) {
          const pt = icePts[i]
          if (i === 0) ctx.moveTo(pt.x, pt.y)
          else ctx.lineTo(pt.x, pt.y)
        }
        ctx.stroke()

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 4
        ctx.stroke()

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
        ctx.restore()

        ctx.drawImage(redGlow, 300 - 210, 2380 - 180, 420, 360)
        ctx.drawImage(iceGlow, 300 - 170, 2535 - 100, 340, 200)

        // Floating Gold/Platinum Trophy (x = 300, y = 2130)
        const ty = 2130 + Math.sin(t * 2.6) * 6
        ctx.drawImage(goldGlow, 300 - 52, ty - 52, 104, 104)

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

        // Pre-baked Standing PS5 Console Tower Sprite (single GPU drawImage!)
        ctx.drawImage(ps5TowerSprite, 300 - 160, 2380 - 185, 320, 380)
      }

      ctx.restore()
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', resize)
    }
  }, [active, scrollRef])

  return (
    <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-[540px] items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-full w-full select-none"
      />
    </div>
  )
}
