const raf = typeof requestAnimationFrame !== 'undefined'
  ? requestAnimationFrame
  : typeof webkitRequestAnimationFrame !== 'undefined'
  ? webkitRequestAnimationFrame
  : () => 1

const caf = typeof cancelAnimationFrame !== 'undefined'
  ? cancelAnimationFrame
  : typeof webkitCancelAnimationFrame !== 'undefined'
  ? webkitCancelAnimationFrame
  : () => {}

export abstract class Invalidator {
  private _requested = 0
  private _disposed = false

  public invalidate(canvas?: HTMLCanvasElement) {
    if (!this._disposed) {
      const ctx = canvas?.getContext('2d')
      if (ctx && !this._requested) {
        this._requested = raf(() => this.draw(ctx))
      }
    }
  }

  public dispose() {
    if (!this._disposed) {
      this._disposed = true
      if (this._requested) {
        caf(this._requested)
        this._requested = 0
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (!this._disposed) {
      const invalidate = () => this.invalidate(ctx.canvas)
      this._requested = 0
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      this.onDraw(ctx, invalidate)
    }
  }

  protected abstract onDraw(ctx: CanvasRenderingContext2D, invalidate: () => void): void
}
