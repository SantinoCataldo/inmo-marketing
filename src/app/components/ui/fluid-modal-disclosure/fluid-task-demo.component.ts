import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FluidDialogComponent } from '../fluid-dialog/fluid-dialog.component';

interface DemoTask {
  id: number;
  title: string;
  description: string;
  date: string;
  done: boolean;
}

@Component({
  selector: 'app-fluid-task-demo',
  standalone: true,
  imports: [FormsModule, FluidDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="text-left">
      <h2 class="text-xl font-bold text-white">Tareas de publicación</h2>
      <p class="mt-2 text-sm leading-relaxed text-slate-400">Un control que se convierte en formulario, conservando su título y volviendo al mismo lugar.</p>

      <div class="mt-6 mb-5 flex items-center gap-2" role="group" aria-label="Color de acento">
        @for (color of colors; track color.hex) {
          <button type="button" [attr.aria-label]="'Color ' + color.name" [attr.aria-pressed]="accent() === color.hex"
            (click)="accent.set(color.hex)" [style.background-color]="color.hex"
            [class.ring-2]="accent() === color.hex" [class.ring-white]="accent() === color.hex"
            class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full ring-offset-4 ring-offset-[#070d0a] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-white">
            @if (accent() === color.hex) { <span class="material-symbols-rounded text-lg text-slate-950">check</span> }
          </button>
        }
      </div>

      <button #addTask id="add-task-trigger" type="button" (click)="taskDialog.openFrom(addTask)"
        class="group flex min-h-14 w-full cursor-pointer items-center gap-2 rounded-full px-6 py-4 text-left text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800/70 focus-visible:outline-2 focus-visible:outline-emerald-400">
        <span data-morph="task-icon" class="material-symbols-rounded text-xl" [style.color]="accent()">add</span>
        <span data-morph="task-title" class="whitespace-nowrap">Añadir tarea</span>
      </button>

      <ul class="mt-3 space-y-2">
        @for (task of tasks(); track task.id) {
          <li class="task-row flex items-start gap-3 rounded-2xl border border-slate-800 bg-[#0c1410] p-4">
            <button type="button" (click)="toggleTask(task.id)" [attr.aria-label]="task.done ? 'Marcar pendiente: ' + task.title : 'Completar: ' + task.title"
              [attr.aria-pressed]="task.done" [style.color]="accent()"
              class="mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-current focus-visible:outline-2 focus-visible:outline-white">
              @if (task.done) { <span class="material-symbols-rounded text-base">check</span> }
            </button>
            <div class="min-w-0 flex-1">
              <p [class.line-through]="task.done" [class.text-slate-500]="task.done" class="break-words text-sm font-semibold text-slate-200">{{ task.title }}</p>
              @if (task.description) { <p class="mt-1 break-words text-xs leading-relaxed text-slate-400">{{ task.description }}</p> }
              @if (task.date) { <p class="mt-2 text-xs" [style.color]="accent()">{{ formatDate(task.date) }}</p> }
            </div>
          </li>
        }
      </ul>
      <p role="status" class="mt-4 min-h-5 text-xs text-slate-400">{{ feedback() }}</p>
    </section>

    <app-fluid-dialog #taskDialog label="Añadir tarea" origin="control" placement="trigger" backdrop="none"
      [width]="760" [showClose]="false" (opened)="focusName()" (closed)="afterClose()">
      <header class="mb-4 flex items-center gap-3">
        <button type="button" aria-label="Cancelar nueva tarea" (click)="taskDialog.close()"
          class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-white">
          <span data-morph="task-icon" class="material-symbols-rounded text-xl">close</span>
        </button>
        <h2 data-morph="task-title" class="whitespace-nowrap text-2xl font-semibold text-slate-200">Añadir tarea</h2>
      </header>
      <form (ngSubmit)="saveTask()">
        <input #nameField aria-label="Nombre de la tarea" name="taskName" [(ngModel)]="taskName" required maxlength="100"
          placeholder="Nombre de la tarea"
          class="w-full rounded-xl border border-transparent bg-slate-800/50 px-3 py-3 text-sm text-white placeholder-slate-500 focus:border-slate-600 focus:outline-none" />
        <textarea aria-label="Descripción de la tarea" name="taskDescription" [(ngModel)]="taskDescription" rows="3"
          placeholder="Descripción (opcional)"
          class="mt-2 w-full resize-none rounded-xl border border-transparent bg-transparent px-3 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-slate-700 focus:outline-none"></textarea>
        <footer class="mt-5 flex flex-wrap items-center justify-between gap-4">
          <label class="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300">
            <span class="material-symbols-rounded text-base">calendar_today</span>
            <span>Fecha</span>
            <input type="date" name="taskDate" aria-label="Fecha de la tarea" [(ngModel)]="taskDate" class="min-w-0 max-w-32 bg-transparent text-xs text-slate-300 [color-scheme:dark] focus:outline-2 focus:outline-emerald-400" />
          </label>
          <div class="ml-auto flex gap-2">
            <button type="button" (click)="taskDialog.close()" class="cursor-pointer rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800">Cancelar</button>
            <button type="submit" [disabled]="!taskName.trim() || taskDialog.isAnimating()" [style.background-color]="accent()"
              class="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
              <span class="material-symbols-rounded text-lg">add</span>Añadir tarea
            </button>
          </div>
        </footer>
      </form>
    </app-fluid-dialog>
  `,
  styles: `
    .task-row { animation: task-enter 220ms ease-out; }
    @keyframes task-enter { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: reduce) { .task-row { animation: none; } }
  `,
})
export class FluidTaskDemoComponent {
  private readonly dialog = viewChild.required<FluidDialogComponent>('taskDialog');
  private readonly nameField = viewChild.required<ElementRef<HTMLInputElement>>('nameField');
  readonly accent = signal('#22d3ee');
  readonly colors = [
    { name: 'verde', hex: '#34d399' }, { name: 'celeste', hex: '#22d3ee' },
    { name: 'azul', hex: '#60a5fa' }, { name: 'violeta', hex: '#a78bfa' },
    { name: 'ámbar', hex: '#fbbf24' },
  ];
  readonly tasks = signal<DemoTask[]>([]);
  readonly feedback = signal('Elegí un color y añadí una tarea para probar el recorrido completo.');
  taskName = '';
  taskDescription = '';
  taskDate = '';
  private nextId = 1;
  private pendingTask?: DemoTask;

  focusName(): void {
    this.nameField().nativeElement.focus({ preventScroll: true });
  }

  saveTask(): void {
    const title = this.taskName.trim();
    if (!title || this.dialog().isAnimating()) return;
    this.pendingTask = { id: this.nextId++, title, description: this.taskDescription.trim(), date: this.taskDate, done: false };
    this.dialog().close();
  }

  afterClose(): void {
    const task = this.pendingTask;
    if (!task) return;
    this.tasks.update(tasks => [...tasks, task]);
    this.feedback.set('Tarea añadida: ' + task.title + '.');
    this.pendingTask = undefined;
    this.taskName = '';
    this.taskDescription = '';
    this.taskDate = '';
  }

  toggleTask(id: number): void {
    this.tasks.update(tasks => tasks.map(task => task.id === id ? { ...task, done: !task.done } : task));
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(value + 'T12:00:00'));
  }
}
