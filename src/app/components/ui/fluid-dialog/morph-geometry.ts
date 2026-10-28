interface Bounds { left: number; top: number; }

export function morphArc(from: Bounds, to: Bounds, progress: number) {
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const distance = Math.hypot(dx, dy);
  const direction = Math.sign(dx || dy);
  const bend = distance < 8 ? 0 : Math.min(distance * 0.12, 32);
  const arc = 4 * progress * (1 - progress) * bend;
  return {
    left: from.left + dx * progress + (distance ? dy / distance * direction * arc : 0),
    top: from.top + dy * progress - (distance ? dx / distance * direction * arc : 0),
  };
}

export function triggerRadius(cssRadius: string, height: number): number {
  const radius = parseFloat(cssRadius);
  return Math.min(Number.isFinite(radius) ? radius : 32, height / 2);
}

interface ModalBounds {
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  originLeft: number;
  originTop: number;
  originHeight?: number;
}

export function modalPosition(bounds: ModalBounds, placement: 'center' | 'bottom-right' | 'trigger' | 'below') {
  const right = bounds.viewportWidth - bounds.width - 16;
  const bottom = bounds.viewportHeight - bounds.height - 20;
  const left = placement === 'bottom-right' ? right : placement === 'trigger' || placement === 'below'
    ? bounds.originLeft : (bounds.viewportWidth - bounds.width) / 2;
  const below = bounds.originTop + (bounds.originHeight ?? 0) + 8;
  const top = placement === 'below' ? (below <= bottom ? below : bounds.originTop - bounds.height - 8)
    : placement === 'bottom-right' ? bottom : placement === 'trigger'
    ? bounds.originTop : (bounds.viewportHeight - bounds.height) / 2;
  return {
    left: Math.max(16, Math.min(left, right)),
    top: Math.max(20, Math.min(top, bottom)),
  };
}

export function snapshotPath(source: Bounds, target: Bounds, first: Bounds, last: Bounds,
  sourceFont: number, targetFont: number) {
  return {
    from: { left: source.left - first.left - 1, top: source.top - first.top - 1 },
    to: { left: target.left - last.left - 1, top: target.top - last.top - 1 },
    scale: sourceFont > 0 && targetFont > 0 ? targetFont / sourceFont : 1,
  };
}
