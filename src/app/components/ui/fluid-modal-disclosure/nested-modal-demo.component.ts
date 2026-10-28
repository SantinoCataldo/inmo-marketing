import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FluidDialogComponent } from '../fluid-dialog/fluid-dialog.component';

@Component({
  selector: 'app-nested-modal-demo',
  standalone: true,
  imports: [FormsModule, FluidDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="text-left">
      <p class="mb-4 text-xs leading-relaxed text-slate-400">Tarjeta → editor → confirmación. Escape vuelve un nivel por vez.</p>
      @if (!deleted()) {
        <div #launcher id="nested-editor-trigger" role="button" tabindex="0"
          (click)="openEditor(launcher)" (keydown.enter)="openEditor(launcher)"
          (keydown.space)="$event.preventDefault(); openEditor(launcher)"
          class="cursor-pointer rounded-3xl border border-emerald-500/25 bg-[#0c1410] p-6 focus-visible:outline-2 focus-visible:outline-emerald-400">
          <div class="flex items-start justify-between gap-4">
            <span data-morph="nested-icon" class="material-symbols-rounded text-3xl text-emerald-400">home</span>
            <span class="text-xs font-semibold text-emerald-400">Editar publicación ↗</span>
          </div>
          <h2 data-morph="nested-title" class="mt-5 text-xl font-bold text-white">{{ title() }}</h2>
          <p class="mt-2 text-sm text-slate-400">Av. del Libertador 2800 · US$ 145.000</p>
          <div class="mt-5 border-t border-slate-800 pt-4 text-xs text-slate-400">Abrí el editor y probá el botón de eliminar.</div>
        </div>
      } @else {
        <div class="rounded-3xl border border-slate-800 bg-[#0c1410] p-6">
          <p role="status" class="text-sm text-slate-200">Publicación eliminada en esta demostración.</p>
          <button type="button" (click)="restore()" class="mt-4 cursor-pointer rounded-xl border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-400">Restaurar y probar otra vez</button>
        </div>
      }
    </section>

    <app-fluid-dialog #editor label="Editar publicación · caso 11" [width]="680" origin="surface" (closed)="editorClosed()">
      <header class="border-b border-slate-800 pb-5 pr-10">
        <span data-morph="nested-icon" class="material-symbols-rounded text-3xl text-emerald-400">home</span>
        <p class="mt-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">Primer nivel · editor</p>
        <h2 data-morph="nested-title" class="mt-2 text-2xl font-bold text-white">{{ title() }}</h2>
      </header>
      <form #form="ngForm" (ngSubmit)="form.valid && save()" class="mt-5 space-y-5">
        <label class="block text-sm text-slate-300">Título de la publicación
          <input name="nestedTitle" [(ngModel)]="draftTitle" required maxlength="90"
            class="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none" />
        </label>
        <label class="block text-sm text-slate-300">Notas
          <textarea name="nestedNotes" [(ngModel)]="draftNotes" rows="3"
            class="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"></textarea>
        </label>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
          <button #deleteButton id="nested-delete-trigger" type="button" [disabled]="editor.isAnimating()"
            (click)="confirmation.openFrom(deleteButton)"
            class="flex cursor-pointer items-center gap-2 rounded-xl border border-red-400/30 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-40">
            <span data-morph="delete-icon" class="material-symbols-rounded text-xl">delete</span>Eliminar
          </button>
          <div class="flex gap-2">
            <button type="button" (click)="editor.close()" class="cursor-pointer rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300">Cancelar</button>
            <button type="submit" [disabled]="form.invalid || editor.isAnimating()" class="cursor-pointer rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">Guardar</button>
          </div>
        </div>
      </form>
    </app-fluid-dialog>

    <app-fluid-dialog #confirmation label="Confirmar eliminación · caso 11" [width]="420" origin="control" (closed)="confirmationClosed()">
      <div class="pr-8">
        <span data-morph="delete-icon" class="material-symbols-rounded text-3xl text-red-300">delete</span>
        <p class="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Segundo nivel · confirmación</p>
        <h2 class="mt-2 text-2xl font-bold text-white">¿Eliminar esta publicación?</h2>
      </div>
      <p class="mt-4 text-sm leading-relaxed text-slate-300">Se eliminará «{{ title() }}» de esta demostración. Tus cambios del editor se conservan si volvés.</p>
      <div class="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" (click)="confirmation.close()" class="cursor-pointer rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200">Volver al editor</button>
        <button type="button" [disabled]="confirmation.isAnimating()" (click)="confirmDeletion()" class="cursor-pointer rounded-xl bg-red-400 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">Sí, eliminar</button>
      </div>
    </app-fluid-dialog>
  `,
})
export class NestedModalDemoComponent {
  private readonly editor = viewChild.required<FluidDialogComponent>('editor');
  private readonly confirmation = viewChild.required<FluidDialogComponent>('confirmation');
  private readonly cdr = inject(ChangeDetectorRef);
  readonly title = signal('Semipiso en Palermo');
  readonly deleted = signal(false);
  draftTitle = '';
  draftNotes = '';
  private notes = 'Tres ambientes con balcón y cochera.';
  private pendingDelete = false;

  openEditor(trigger: HTMLElement): void {
    if (this.editor().isOpen()) return;
    this.draftTitle = this.title();
    this.draftNotes = this.notes;
    this.editor().openFrom(trigger);
  }

  save(): void {
    if (this.editor().isAnimating() || !this.draftTitle.trim()) return;
    this.title.set(this.draftTitle.trim());
    this.notes = this.draftNotes;
    this.cdr.detectChanges();
    this.editor().close();
  }

  confirmDeletion(): void {
    if (this.confirmation().isAnimating()) return;
    this.pendingDelete = true;
    this.confirmation().close();
  }

  confirmationClosed(): void {
    if (this.pendingDelete) this.editor().close();
  }

  editorClosed(): void {
    if (!this.pendingDelete) return;
    this.deleted.set(true);
    this.pendingDelete = false;
  }

  restore(): void {
    this.deleted.set(false);
  }
}
