import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  OnDestroy, inject, input, output, signal, viewChild,
} from '@angular/core';
import gsap from 'gsap';
import { FluidMotion } from './fluid-motion';
import { FluidDialogStack } from './fluid-dialog-stack.service';
import { modalPosition, triggerRadius } from './morph-geometry';

@Component({
  selector: 'app-fluid-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <dialog #dialog [attr.aria-label]="label()" [class.clear-backdrop]="backdrop() === 'none'" (cancel)="cancel($event)" (click)="backdropClick($event)">
        @if (showClose()) {
          <button type="button" class="fluid-dialog-close" aria-label="Cerrar diálogo" (click)="close()">
            <span class="material-symbols-rounded">close</span>
          </button>
        }
        <div #body class="fluid-dialog-body">
          <ng-content />
        </div>
      </dialog>
    }
  `,
  styles: `
    :host { display: contents; }
    dialog {
      position: fixed; inset: auto; margin: 0; padding: 24px; box-sizing: border-box;
      max-width: none; max-height: none; border: 1px solid rgb(16 185 129 / 25%);
      border-radius: 32px; background: #0c1410; color: #e2e8f0;
      box-shadow: 0 24px 80px rgb(0 0 0 / 45%);
      scrollbar-width: thin; scrollbar-color: #334155 #0c1410;
    }
    dialog::backdrop {
      background: rgb(0 0 0 / calc(var(--fluid-backdrop, 0) * 0.65));
      backdrop-filter: blur(calc(var(--fluid-backdrop, 0) * 6px));
    }
    dialog.clear-backdrop::backdrop { background: transparent; backdrop-filter: none; }
    .fluid-dialog-close {
      position: absolute; top: 16px; right: 16px; z-index: 20;
      display: grid; place-items: center; width: 36px; height: 36px;
      border: 1px solid #334155; border-radius: 50%; background: #1e293b;
      color: #cbd5e1; cursor: pointer;
    }
    .fluid-dialog-close:focus-visible { outline: 2px solid #34d399; outline-offset: 3px; }
  `,
})
export class FluidDialogComponent implements OnDestroy {
  readonly label = input.required<string>();
  readonly width = input(520);
  readonly origin = input<'control' | 'surface'>('surface');
  readonly backdrop = input<'dim' | 'none'>('dim');
  readonly showClose = input(true);
  readonly placement = input<'center' | 'bottom-right' | 'trigger' | 'below'>('center');
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly isOpen = signal(false);
  readonly isAnimating = signal(false);

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly stack = inject(FluidDialogStack);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');
  private readonly motion = new FluidMotion();
  private timeline?: gsap.core.Timeline;
  private layer?: symbol;
  private trigger?: HTMLElement;
  private triggerStyle: string | null = null;
  private sourceRadius = 0;
  private sourceBorder = 'transparent';

  openFrom(trigger: HTMLElement): void {
    if (this.isOpen() || !trigger.isConnected) return;
    this.trigger = trigger;
    this.triggerStyle = trigger.getAttribute('style');
    this.layer = this.stack.acquire(() => this.close());
    trigger.style.transition = 'none';
    trigger.style.scale = '1';
    trigger.style.pointerEvents = 'none';
    const first = trigger.getBoundingClientRect();
    const style = getComputedStyle(trigger);
    this.sourceRadius = triggerRadius(style.borderRadius, first.height);
    this.sourceBorder = parseFloat(style.borderTopWidth) > 0
      ? 'rgba(16, 185, 129, 0.25)' : 'transparent';
    this.isOpen.set(true);
    this.isAnimating.set(true);
    this.cdr.detectChanges();
    const card = this.dialog()?.nativeElement;
    const body = this.body()?.nativeElement;
    if (!card || !body) { this.dispose(); return; }
    const width = Math.min(this.width(), window.innerWidth - 32);
    gsap.set(card, { visibility: 'hidden', width, height: 'auto', left: 0, top: 0, overflowY: 'auto' });
    card.style.maxHeight = (window.innerHeight - 40) + 'px';
    card.showModal();
    const height = card.offsetHeight;
    body.style.width = (card.clientWidth - 48) + 'px';
    card.style.maxHeight = 'none';
    const position = modalPosition({ width, height, viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight, originLeft: first.left, originTop: first.top,
      originHeight: first.height }, this.placement());
    gsap.set(card, { ...position, height });
    const last = card.getBoundingClientRect();
    const duration = this.duration();
    const close = card.querySelector<HTMLButtonElement>('.fluid-dialog-close');
    const tl = gsap.timeline({ onComplete: () => {
      this.motion.clear();
      card.style.overflowY = 'auto';
      this.isAnimating.set(false);
      close?.focus({ preventScroll: true });
      this.opened.emit();
    } });
    this.timeline = tl;
    this.motion.shared(tl, trigger, card, card, first, last, duration);
    this.motion.departure(tl, trigger, card, first, duration);
    trigger.style.opacity = '0';
    gsap.set(card, { left: first.left, top: first.top, width: first.width, height: first.height,
      borderRadius: this.sourceRadius, borderColor: this.sourceBorder,
      overflow: 'hidden', visibility: 'visible', '--fluid-backdrop': 0 });
    this.motion.press(tl, card, duration);
    this.motion.travel(tl, card, first, position, duration);
    tl.to(card, { width, height, borderRadius: 32,
      borderColor: 'rgba(16, 185, 129, 0.25)', '--fluid-backdrop': 1,
      duration, ease: 'stepbroEase' }, 0);
    const reveal = this.origin() === 'control' ? 0.25 : 0.4;
    this.motion.reveal(tl, body, duration, reveal);
    if (close) this.motion.reveal(tl, close, duration, reveal);
  }

  close(): void {
    if (!this.isOpen() || this.isAnimating() || this.stack.layers().at(-1) !== this.layer) return;
    const card = this.dialog()?.nativeElement;
    const body = this.body()?.nativeElement;
    const trigger = this.trigger;
    if (!card || !body || !trigger) return;
    this.isAnimating.set(true);
    card.scrollTop = 0;
    card.style.overflow = 'hidden';
    const first = card.getBoundingClientRect();
    const last = trigger.getBoundingClientRect();
    const duration = this.duration() * 0.9;
    const tl = gsap.timeline({ onComplete: () => {
      this.dispose();
      this.cdr.detectChanges();
      if (trigger.isConnected) trigger.focus({ preventScroll: true });
      this.closed.emit();
    } });
    this.timeline = tl;
    this.motion.shared(tl, card, trigger, card, first, last, duration);
    this.motion.landing(tl, trigger, card, last, duration);
    this.motion.press(tl, card, duration);
    const close = card.querySelector<HTMLButtonElement>('.fluid-dialog-close');
    if (close) this.motion.conceal(tl, close, duration);
    this.motion.conceal(tl, body, duration);
    this.motion.travel(tl, card, first, last, duration);
    tl.to(card, { width: last.width, height: last.height,
      borderRadius: this.sourceRadius, borderColor: this.sourceBorder, '--fluid-backdrop': 0,
      duration, ease: 'stepbroEase' }, 0);
  }

  cancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  backdropClick(event: MouseEvent): void {
    const card = this.dialog()?.nativeElement;
    if (event.target !== card || !card) return;
    const rect = card.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.close();
  }

  private duration(): number {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0
      : this.origin() === 'control' ? 0.38 : 0.42;
  }

  private dispose(): void {
    this.motion.clear();
    this.dialog()?.nativeElement.close();
    if (this.trigger) {
      if (this.triggerStyle === null) this.trigger.removeAttribute('style');
      else this.trigger.setAttribute('style', this.triggerStyle);
    }
    if (this.layer) this.stack.release(this.layer);
    this.layer = undefined;
    this.trigger = undefined;
    this.isOpen.set(false);
    this.isAnimating.set(false);
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
    this.dispose();
  }
}
