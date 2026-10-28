import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { morphArc, snapshotPath } from './morph-geometry';

gsap.registerPlugin(CustomEase);
CustomEase.create('stepbroEase', '0.22, 1, 0.36, 1');

export class FluidMotion {
  private snapshots: HTMLElement[] = [];
  private hiddenShared: HTMLElement[] = [];

  travel(tl: gsap.core.Timeline, element: HTMLElement,
    from: { left: number; top: number }, to: { left: number; top: number }, duration: number): void {
    const playhead = { progress: 0 };
    tl.to(playhead, { progress: 1, duration, ease: 'stepbroEase', onUpdate: () => {
      gsap.set(element, morphArc(from, to, playhead.progress));
    } }, 0);
  }

  reveal(tl: gsap.core.Timeline, content: HTMLElement, duration: number, delay = 0.25): void {
    gsap.set(content, { opacity: 0, filter: duration ? 'blur(6px)' : 'blur(0px)' });
    tl.to(content, { opacity: 1, filter: 'blur(0px)', duration: duration * (1 - delay),
      ease: 'power2.out', clearProps: 'filter' }, duration * delay);
  }

  conceal(tl: gsap.core.Timeline, content: HTMLElement, duration: number): void {
    tl.to(content, { opacity: 0, filter: duration ? 'blur(5px)' : 'blur(0px)',
      duration: duration * 0.4, ease: 'power2.in' }, 0);
  }

  clear(): void {
    for (const snapshot of this.snapshots) snapshot.remove();
    for (const element of this.hiddenShared) element.style.removeProperty('visibility');
    this.snapshots = [];
    this.hiddenShared = [];
  }

  private snapshot(element: HTMLElement, rect: DOMRect): HTMLElement {
    const copy = element.cloneNode(true);
    if (!(copy instanceof HTMLElement)) throw new Error('Invalid shared element');
    const originals = [element, ...element.querySelectorAll<HTMLElement>('*')];
    const copies = [copy, ...copy.querySelectorAll<HTMLElement>('*')];
    originals.forEach((original, index) => {
      const clone = copies[index];
      const style = getComputedStyle(original);
      for (const property of Array.from(style)) clone.style.setProperty(property, style.getPropertyValue(property));
      clone.removeAttribute('id');
      clone.removeAttribute('data-morph');
    });
    gsap.set(copy, { position: 'absolute', margin: 0, left: 0, top: 0,
      width: rect.width, height: rect.height, minWidth: 0, maxWidth: 'none',
      transform: 'none', transition: 'none', animation: 'none', scale: 1, visibility: 'visible', opacity: 1,
      transformOrigin: 'top left', pointerEvents: 'none', zIndex: 15 });
    copy.setAttribute('aria-hidden', 'true');
    copy.inert = true;
    this.snapshots.push(copy);
    return copy;
  }

  shared(tl: gsap.core.Timeline, from: HTMLElement, to: HTMLElement,
    shell: HTMLElement, first: DOMRect, last: DOMRect, duration: number): void {
    from.querySelectorAll<HTMLElement>('[data-morph]').forEach(source => {
      const key = source.dataset['morph'];
      const target = to.querySelector<HTMLElement>('[data-morph="' + key + '"]');
      if (!target) return;
      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const outgoing = this.snapshot(source, sourceRect);
      const incoming = this.snapshot(target, targetRect);
      const icon = key?.endsWith('icon');
      const sourceFont = icon ? sourceRect.width : parseFloat(getComputedStyle(source).fontSize);
      const targetFont = icon ? targetRect.width : parseFloat(getComputedStyle(target).fontSize);
      const path = snapshotPath(sourceRect, targetRect, first, last, sourceFont, targetFont);
      shell.append(outgoing, incoming);
      source.style.visibility = 'hidden';
      target.style.visibility = 'hidden';
      this.hiddenShared.push(source, target);
      gsap.set(outgoing, { ...path.from, scale: 1 });
      gsap.set(incoming, { ...path.from, scale: 1 / path.scale, opacity: 0 });
      this.travel(tl, outgoing, path.from, path.to, duration);
      this.travel(tl, incoming, path.from, path.to, duration);
      tl.to(outgoing, { scale: path.scale, duration, ease: 'stepbroEase' }, 0);
      tl.to(incoming, { scale: 1, duration, ease: 'stepbroEase' }, 0);
      tl.to(outgoing, { opacity: 0, duration: duration * 0.55 }, duration * 0.2);
      tl.to(incoming, { opacity: 1, duration: duration * 0.55 }, duration * 0.2);
    });
  }

  press(tl: gsap.core.Timeline, card: HTMLElement, duration: number): void {
    gsap.set(card, { transformOrigin: 'center center' });
    tl.to(card, { scale: 0.97, duration: duration * 0.22, ease: 'power2.out' }, 0);
    tl.to(card, { scale: 1, duration: duration * 0.78, ease: 'back.out(1.2)' }, duration * 0.22);
  }

  departure(tl: gsap.core.Timeline, trigger: HTMLElement,
    card: HTMLElement, source: DOMRect, duration: number): void {
    const departure = this.snapshot(trigger, source);
    departure.dataset['morphDeparture'] = '';
    card.append(departure);
    gsap.set(departure, { left: -1, top: -1, zIndex: 14 });
    this.conceal(tl, departure, duration);
  }

  landing(tl: gsap.core.Timeline, trigger: HTMLElement,
    card: HTMLElement, target: DOMRect, duration: number): void {
    // Capture after shared hides its targets: this layer supplies every
    // remaining detail, while the shared text and icons continue flying above it.
    const landing = this.snapshot(trigger, target);
    landing.dataset['morphLanding'] = '';
    card.append(landing);
    gsap.set(landing, { left: -1, top: -1, zIndex: 14 });
    this.reveal(tl, landing, duration, 0.3);
  }

}
