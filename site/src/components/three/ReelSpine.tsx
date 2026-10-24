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
 * Pre-renders the Stage 1 Mascot Shield into an offscreen sprite once.
 */
function bakeShieldSprite(mascotImg?: HTMLImageElement): HTMLCanvasElement {
  const w = 280
  const h = 320
  const dpr = 1.5
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return c

  ctx.scale(dpr, dpr)
  ctx.translate(w / 2, 145)

  const shieldOuterPath = new Path2D(
    'M 0 -130 L 118 -86 L 118 22 C 118 92 66 138 0 160 C -66 138 -118 92 -118 22 L -118 -86 Z',
  )
  const shieldInnerPath = new Path2D(
    'M 0 -118 L 106 -78 L 106 20 C 106 82 58 124 0 144 C -58 124 -106 82 -106 20 L -106 -78 Z',
  )

  ctx.fillStyle = '#240002'
  ctx.fill(shieldOuterPath)

  if (mascotImg && mascotImg.naturalWidth > 0 && mascotImg.naturalHeight > 0) {
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

  ctx.strokeStyle = 'rgba(255, 26, 26, 0.32)'
  ctx.lineWidth = 12
  ctx.stroke(shieldOuterPath)

  ctx.strokeStyle = '#ff1a1a'
  ctx.lineWidth = 5.5
  ctx.stroke(shieldOuterPath)

  ctx.strokeStyle = '#bdc9e7'
  ctx.lineWidth = 3
  ctx.stroke(shieldInnerPath)

  return c
}

/**
 * Pre-renders the Left & Right DualSense Controller Halves into offscreen sprites once
 * so the 60-120fps render loop only performs a single GPU drawImage call per half.
 */
function bakeDualSenseHalf(side: 'left' | 'right'): HTMLCanvasElement {
  const w = 200
  const h = 280
  const dpr = 1.5
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')
  if (!ctx) return c

  ctx.scale(dpr, dpr)
  if (side === 'left') {
    ctx.translate(180, 100)
    const leftShellPath = new Path2D(
      'M 0 -68 L -82 -68 Q -138 -66 -152 -8 Q -170 58 -140 138 Q -126 170 -96 158 Q -72 146 -58 86 L -42 40 L 0 40 Z',
    )
    const leftGripPath = new Path2D(
      'M -140 68 Q -130 142 -98 156 Q -74 146 -60 86 L -42 40 L 0 40 L 0 10 L -68 16 Q -114 22 -140 68 Z',
    )
    const leftBumperPath = new Path2D('M -114 -68 Q -74 -94 -26 -76 L -20 -54 L -108 -44 Z')
    const leftTouchpadPath = new Path2D('M 0 -64 L -56 -64 L -44 -6 L 0 -6 Z')

    const shellGradL = ctx.createLinearGradient(-150, -70, 0, 160)
    shellGradL.addColorStop(0, '#ffffff')
    shellGradL.addColorStop(0.55, '#dce5f7')
    shellGradL.addColorStop(1, '#8c9bb8')

    ctx.fillStyle = '#170409'
    ctx.strokeStyle = '#ff1a1a'
    ctx.lineWidth = 1.5
    ctx.fillRect(-18, -58, 18, 96)
    ctx.strokeRect(-18, -58, 18, 96)

    ctx.fillStyle = '#18050a'
    ctx.strokeStyle = '#a9bcf0'
    ctx.lineWidth = 1.8
    ctx.fill(leftBumperPath)
    ctx.stroke(leftBumperPath)

    ctx.fillStyle = shellGradL
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.fill(leftShellPath)
    ctx.stroke(leftShellPath)

    ctx.fillStyle = '#120307'
    ctx.strokeStyle = '#a9bcf0'
    ctx.lineWidth = 1.1
    ctx.fill(leftGripPath)
    ctx.stroke(leftGripPath)

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
  } else {
    ctx.translate(20, 100)
    const rightShellPath = new Path2D(
      'M 0 -68 L 82 -68 Q 138 -66 152 -8 Q 170 58 140 138 Q 126 170 96 158 Q 72 146 58 86 L 42 40 L 0 40 Z',
    )
    const rightGripPath = new Path2D(
      'M 140 68 Q 130 142 98 156 Q 74 146 60 86 L 42 40 L 0 40 L 0 10 L 68 16 Q 114 22 140 68 Z',
    )
    const rightBumperPath = new Path2D('M 114 -68 Q 74 -94 26 -76 L 20 -54 L 108 -44 Z')
    const rightTouchpadPath = new Path2D('M 0 -64 L 56 -64 L 44 -6 L 0 -6 Z')

    const shellGradR = ctx.createLinearGradient(0, -70, 150, 160)
    shellGradR.addColorStop(0, '#ffffff')
    shellGradR.addColorStop(0.55, '#dce5f7')
    shellGradR.addColorStop(1, '#8c9bb8')

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
  }

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

    // Pre-render all complex assemblies into GPU-backed offscreen sprites once!
    const redGlow = createGlowSprite('rgba(255, 35, 35, 0.70)', 'rgba(229, 0, 0, 0.20)', 128)
    const iceGlow = createGlowSprite('rgba(195, 215, 255, 0.65)', 'rgba(169, 188, 240, 0.18)', 128)
    const greenGlow = createGlowSprite('rgba(74, 222, 128, 0.65)', 'rgba(34, 197, 94, 0.18)', 128)
    const goldGlow = createGlowSprite('rgba(255, 230, 128, 0.70)', 'rgba(212, 154, 26, 0.20)', 96)

    const leftHalfSprite = bakeDualSenseHalf('left')
    const rightHalfSprite = bakeDualSenseHalf('right')
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

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      isMobile = window.innerWidth < 1024
      dpr = Math.min(window.devicePixelRatio || 1, 1.35)
      viewW = Math.max(1, Math.min(rect.width, 520))
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

      const p = curP

      const logicalW = isMobile ? 510 : 540
      const logicalH = isMobile ? 640 : 820
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
      // 1. STAGE 1 (y: 120..935): MASCOT SHIELD + 3D SPLITTING DUALSENSE
      // =====================================================================
      if (visTop < 960) {
        ctx.drawImage(redGlow, 300 - 220, 340 - 220, 440, 440)

        // Orbital Telemetry Rings around Stage 1 (solid strokes, zero setLineDash CPU overhead)
        ctx.strokeStyle = 'rgba(255, 26, 26, 0.30)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(300, 340, 174, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = 'rgba(169, 188, 240, 0.24)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(300, 340, 198, 0, Math.PI * 2)
        ctx.stroke()

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
          const lane = ((i % 5) - 2) * 38
          const spiral = Math.sin(phase * Math.PI * 3 + t * 2.4 + i * 1.4) * 18
          const sx = 300 + (lane + spiral) * env * (0.7 + splitAmt * 0.45)
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

        // RED ZONE MASCOT SHIELD EMBLEM (single GPU sprite blit)
        const shieldFloatY = 308 + Math.sin(t * 2.2) * 5 - splitAmt * 8
        const shieldScale = 0.96 + splitAmt * 0.08
        ctx.save()
        ctx.translate(300, shieldFloatY)
        ctx.scale(shieldScale, shieldScale)
        ctx.drawImage(shieldSprite, -140, -145, 280, 320)
        ctx.restore()

        // 3D DUALSENSE CONTROLLER HALVES (2 GPU sprite blits!)
        const dx = 28 + splitAmt * 98
        const dy = splitAmt * 12 + Math.sin(t * 2.2) * 4
        const rotRad = ((6 + splitAmt * 21 + Math.cos(t * 1.8) * 1.4) * Math.PI) / 180
        const perspX = 1 - splitAmt * 0.05

        ctx.save()
        ctx.translate(300 - dx, 365 + dy)
        ctx.rotate(-rotRad)
        ctx.scale(perspX, 1)
        ctx.drawImage(leftHalfSprite, -180, -100, 200, 280)
        ctx.restore()

        ctx.save()
        ctx.translate(300 + dx, 365 + dy)
        ctx.rotate(rotRad)
        ctx.scale(perspX, 1)
        ctx.drawImage(rightHalfSprite, -20, -100, 200, 280)
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
      window.removeEventListener('resize', resize)
    }
  }, [active, scrollRef])

  return (
    <div className="pointer-events-none relative mx-auto flex h-full w-full max-w-[520px] items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-full w-full select-none"
      />
    </div>
  )
}
