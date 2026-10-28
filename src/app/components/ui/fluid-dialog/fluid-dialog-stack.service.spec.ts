import { TestBed } from '@angular/core/testing';
import { FluidDialogStack } from './fluid-dialog-stack.service';

describe('nested dialog scroll ownership', () => {
  let stack: FluidDialogStack;
  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'auto';
    stack = TestBed.inject(FluidDialogStack);
  });

  afterEach(() => {
    for (const id of stack.layers()) stack.release(id);
    document.body.style.overflow = originalOverflow;
  });

  it('keeps the editor locked when its confirmation closes and restores scrolling last', () => {
    const editor = stack.acquire();
    const confirmation = stack.acquire();
    stack.release(confirmation);
    expect(stack.layers()).toEqual([editor]);
    expect(document.body.style.overflow).toBe('hidden');
    stack.release(editor);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('also handles parent cleanup before child cleanup', () => {
    const editor = stack.acquire();
    const confirmation = stack.acquire();
    stack.release(editor);
    expect(stack.layers()).toEqual([confirmation]);
    expect(document.body.style.overflow).toBe('hidden');
    stack.release(confirmation);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('ignores duplicate cleanup while a later dialog still owns the lock', () => {
    const first = stack.acquire();
    stack.release(first);
    const second = stack.acquire();
    stack.release(first);
    expect(document.body.style.overflow).toBe('hidden');
    expect(stack.layers()).toEqual([second]);
  });

  it('prevents native Escape for both nested levels, including the second close', () => {
    const closeEditor = vi.fn();
    const closeConfirmation = vi.fn();
    stack.acquire(closeEditor);
    const confirmation = stack.acquire(closeConfirmation);
    const first = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(first);
    expect(first.defaultPrevented).toBe(true);
    expect(closeConfirmation).toHaveBeenCalledTimes(1);
    expect(closeEditor).not.toHaveBeenCalled();

    // The confirmation stays on top until its animation completes.
    expect(stack.layers().at(-1)).toBe(confirmation);
    stack.release(confirmation);
    const second = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(second);
    expect(second.defaultPrevented).toBe(true);
    expect(closeEditor).toHaveBeenCalledTimes(1);
  });

  it('consumes a held Escape without sending repeats to the newly exposed editor', () => {
    const closeEditor = vi.fn();
    stack.acquire(closeEditor);
    const repeat = new KeyboardEvent('keydown', { key: 'Escape', repeat: true, cancelable: true });
    document.dispatchEvent(repeat);
    expect(repeat.defaultPrevented).toBe(true);
    expect(closeEditor).not.toHaveBeenCalled();
  });

  it('leaves other keys and Escape outside the dialog stack alone', () => {
    const close = vi.fn();
    const id = stack.acquire(close);
    const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    document.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(false);
    expect(close).not.toHaveBeenCalled();
    stack.release(id);
    const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    document.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(false);
  });
});
