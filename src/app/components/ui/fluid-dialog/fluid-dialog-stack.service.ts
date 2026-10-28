import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FluidDialogStack {
  readonly layers = signal<readonly symbol[]>([]);
  private previousOverflow = '';
  private readonly escapeHandlers = new Map<symbol, () => void>();

  // Prevent the browser's close request before it can remove a native dialog
  // from the top layer while its return animation is still running.
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const top = this.layers().at(-1);
    if (event.key !== 'Escape' || !top) return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) this.escapeHandlers.get(top)?.();
  };

  acquire(onEscape?: () => void): symbol {
    if (this.layers().length === 0) {
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', this.onKeyDown, true);
    }
    const id = Symbol('fluid-dialog');
    if (onEscape) this.escapeHandlers.set(id, onEscape);
    this.layers.update(layers => [...layers, id]);
    return id;
  }

  release(id: symbol): void {
    if (!this.layers().includes(id)) return;
    this.escapeHandlers.delete(id);
    this.layers.update(layers => layers.filter(layer => layer !== id));
    if (this.layers().length === 0) {
      document.removeEventListener('keydown', this.onKeyDown, true);
      document.body.style.overflow = this.previousOverflow;
    }
  }
}
