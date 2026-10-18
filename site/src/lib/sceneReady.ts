// The preloader waits for the hero WebGL scene to finish its first frames
// (chunk download + shader compile) so that work never stalls the hero intro.
let done = false
let resolve: () => void = () => {}
const ready = new Promise<void>((r) => { resolve = r })

export function markSceneReady() {
  if (done) return
  done = true
  resolve()
}

export function waitSceneReady(timeoutMs: number) {
  return Promise.race([ready, new Promise<void>((r) => setTimeout(r, timeoutMs))])
}
