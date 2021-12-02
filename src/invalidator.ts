declare let webkitRequestAnimationFrame: typeof requestAnimationFrame
declare let webkitCancelAnimationFrame: typeof cancelAnimationFrame

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

export abstract class Invalidator<T> {
  private _requested = 0
  private _disposed = false

  public invalidate(target: T) {
    if (!this._disposed && !this._requested) {
      this._requested = raf(() => this.doRender(target))
    }
  }

  private doRender(target: T) {
    this._requested = 0
    this.render(target)
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

  public abstract render(target: T): void
}
