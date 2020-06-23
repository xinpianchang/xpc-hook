export default abstract class Invalidator {
  private _requested = 0
  private _disposed = false

  public invalidate(canvas?: HTMLCanvasElement) {
    if (this._disposed) {
      return
    }
    const ctx = canvas?.getContext('2d')
    if (ctx && !this._requested) {
      this._requested = requestAnimationFrame(() => this.draw(ctx))
    }
  }

  public dispose() {
    if (this._disposed) {
      return
    }
    this._disposed = true
    if (this._requested) {
      cancelAnimationFrame(this._requested)
      this._requested = 0
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    if (this._disposed) {
      return
    }
    const invalidate = () => this.invalidate(ctx.canvas)
    this._requested = 0
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    this.onDraw(ctx, invalidate)
  }

  protected abstract onDraw(ctx: CanvasRenderingContext2D, invalidate: () => void): void
}
