import { Invalidator } from './invalidator'

export abstract class CanvasInvalidator extends Invalidator<HTMLCanvasElement> {
  public render(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const invalidate = () => this.invalidate(canvas)
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      this.onDraw(ctx, invalidate)
    }
  }

  protected abstract onDraw(ctx: CanvasRenderingContext2D, invalidate: () => void): void
}
