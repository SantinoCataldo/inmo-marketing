import gsap from 'gsap';
import { FluidMotion } from './fluid-motion';

describe('fluid motion layers', () => {
  it('blurs new content while connected elements stay sharp, then removes the temporary layers', () => {
    const trigger = document.createElement('button');
    const shell = document.createElement('div');
    const body = document.createElement('div');
    trigger.innerHTML = '<span data-morph="title">Editar</span>';
    body.innerHTML = '<h2 data-morph="title">Editar publicación</h2><input aria-label="Nombre" />';
    shell.append(body);
    document.body.append(trigger, shell);
    const motion = new FluidMotion();
    const timeline = gsap.timeline({ paused: true });
    try {
      motion.shared(timeline, trigger, body, shell, trigger.getBoundingClientRect(), shell.getBoundingClientRect(), 1);
      motion.reveal(timeline, body, 1);
      timeline.progress(0.5);
      expect(parseFloat(body.style.filter.slice(5))).toBeGreaterThan(0);
      const snapshots = shell.querySelectorAll<HTMLElement>('[aria-hidden="true"]');
      expect(snapshots.length).toBe(2);
      for (const snapshot of snapshots) {
        expect(snapshot.parentElement).toBe(shell);
        expect(['none', '']).toContain(snapshot.style.filter);
      }
      expect(body.querySelector<HTMLElement>('[data-morph]')?.style.visibility).toBe('hidden');
      timeline.progress(1);
      motion.clear();
      expect(body.style.filter).toBe('');
      expect(body.style.opacity).toBe('1');
      expect(shell.querySelectorAll('[aria-hidden="true"]').length).toBe(0);
      expect(body.querySelector<HTMLElement>('[data-morph]')?.style.visibility).toBe('');
      expect(trigger.querySelector<HTMLElement>('[data-morph]')?.style.visibility).toBe('');
    } finally {
      timeline.kill();
      motion.clear();
      trigger.remove();
      shell.remove();
    }
  });

  it('lands immediately with sharp content when motion duration is zero', () => {
    const shell = document.createElement('div');
    const body = document.createElement('div');
    shell.append(body);
    document.body.append(shell);
    const motion = new FluidMotion();
    const timeline = gsap.timeline({ paused: true });
    try {
      motion.travel(timeline, shell, { left: 400, top: 700 }, { left: 16, top: 20 }, 0);
      motion.reveal(timeline, body, 0);
      timeline.progress(1);
      expect(shell.style.left).toBe('16px');
      expect(shell.style.top).toBe('20px');
      expect(body.style.filter).toBe('');
      expect(body.style.opacity).toBe('1');
    } finally {
      timeline.kill();
      shell.remove();
    }
  });
});
