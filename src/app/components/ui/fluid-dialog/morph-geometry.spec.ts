import { modalPosition, morphArc, snapshotPath, triggerRadius } from './morph-geometry';

describe('morph trajectory', () => {
  const from = { left: 20, top: 100 };
  const to = { left: 420, top: 300 };

  it('starts and lands exactly on the measured bounds', () => {
    expect(morphArc(from, to, 0)).toEqual(from);
    expect(morphArc(from, to, 1)).toEqual(to);
  });

  it('follows the same curve backwards when closing', () => {
    for (const progress of [0.1, 0.3, 0.5, 0.8]) {
      const opening = morphArc(from, to, progress);
      const closing = morphArc(to, from, 1 - progress);
      expect(closing.left).toBeCloseTo(opening.left);
      expect(closing.top).toBeCloseTo(opening.top);
    }
  });

  it('bends away from the straight line without a large detour', () => {
    const middle = morphArc(from, to, 0.5);
    const deviation = Math.hypot(middle.left - 220, middle.top - 200);
    expect(deviation).toBeGreaterThan(0);
    expect(deviation).toBeLessThanOrEqual(32);
  });

  it('does not drift for expansion in place or tiny position corrections', () => {
    expect(morphArc(from, from, 0.5)).toEqual(from);
    expect(morphArc(from, { left: 24, top: 102 }, 0.5)).toEqual({ left: 22, top: 101 });
  });
});

describe('trigger corners', () => {
  it('preserves square rows as the animation destination', () => {
    expect(triggerRadius('0px', 80)).toBe(0);
  });

  it('retains rounded cards and caps pill corners to half their height', () => {
    expect(triggerRadius('32px', 200)).toBe(32);
    expect(triggerRadius('9999px', 44)).toBe(22);
  });
});

describe('modal placement', () => {
  const bounds = { viewportWidth: 1200, viewportHeight: 900, width: 520, height: 600,
    originLeft: 100, originTop: 200 };

  it('pins the bottom-right mode to the viewport margins', () => {
    expect(modalPosition(bounds, 'bottom-right')).toEqual({ left: 664, top: 280 });
  });

  it('uses each row position instead of the screen center', () => {
    expect(modalPosition(bounds, 'trigger')).toEqual({ left: 100, top: 200 });
    expect(modalPosition({ ...bounds, originTop: 80 }, 'trigger')).toEqual({ left: 100, top: 80 });
  });

  it('keeps anchored panels inside the viewport near the bottom edge', () => {
    expect(modalPosition({ ...bounds, originLeft: 1100, originTop: 850 }, 'trigger'))
      .toEqual({ left: 664, top: 280 });
  });

  it('preserves centered placement for the earlier cases', () => {
    expect(modalPosition(bounds, 'center')).toEqual({ left: 340, top: 150 });
  });

  it('opens dropdowns below the control with a gap', () => {
    expect(modalPosition({ ...bounds, height: 240, originTop: 100, originHeight: 44 }, 'below'))
      .toEqual({ left: 100, top: 152 });
  });

  it('opens dropdowns above a control when there is no room below', () => {
    expect(modalPosition({ ...bounds, height: 240, originTop: 700, originHeight: 44 }, 'below'))
      .toEqual({ left: 100, top: 452 });
  });
});

describe('shared snapshots', () => {
  it('scales text uniformly by font size even when line counts differ', () => {
    const path = snapshotPath({ left: 100, top: 300 }, { left: 450, top: 100 },
      { left: 50, top: 270 }, { left: 200, top: 60 }, 16, 24);
    expect(path.scale).toBe(1.5);
    expect(path.from).toEqual({ left: 49, top: 29 });
    expect(path.to).toEqual({ left: 249, top: 39 });
  });

  it('lands on the updated trigger without reusing the opening coordinates', () => {
    const path = snapshotPath({ left: 450, top: 100 }, { left: 80, top: 200 },
      { left: 200, top: 60 }, { left: 40, top: 180 }, 24, 16);
    expect(path.to.left + 40 + 1).toBe(80);
    expect(path.to.top + 180 + 1).toBe(200);
    expect(path.scale).toBeCloseTo(2 / 3);
  });
});
