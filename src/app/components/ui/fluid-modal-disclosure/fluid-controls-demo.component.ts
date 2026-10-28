import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FluidDialogComponent } from '../fluid-dialog/fluid-dialog.component';

type ListingFilter = 'all' | 'available' | 'reserved' | 'paused';

@Component({
  selector: 'app-fluid-controls-demo',
  standalone: true,
  imports: [FluidDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-3xl border border-emerald-950/60 bg-[#0c1410] p-5 text-left sm:p-6">
      <header class="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-white">Mis publicaciones</h2>
          <p class="mt-1 text-xs text-slate-400">Filtrá el estado y ajustá la vista.</p>
        </div>
        <button #gear type="button" id="settings-menu-trigger" aria-label="Opciones de la lista"
          aria-haspopup="menu" [attr.aria-expanded]="settings.isOpen()" aria-controls="listing-settings-menu"
          (click)="settings.openFrom(gear)" (keydown.arrowdown)="$event.preventDefault(); settings.openFrom(gear)"
          class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-400">
          <span data-morph="settings-icon" class="material-symbols-rounded text-xl">settings</span>
        </button>
      </header>

      <span id="listing-filter-label" class="text-xs font-semibold text-slate-300">Estado de publicación</span>
      <button #selectTrigger type="button" id="listing-filter-trigger" role="combobox"
        aria-labelledby="listing-filter-label listing-filter-value" aria-haspopup="dialog"
        [attr.aria-expanded]="filterDialog.isOpen()" aria-controls="listing-state-options"
        (click)="filterDialog.openFrom(selectTrigger)"
        (keydown.arrowdown)="$event.preventDefault(); filterDialog.openFrom(selectTrigger)"
        (keydown.arrowup)="$event.preventDefault(); filterDialog.openFrom(selectTrigger)"
        class="mt-2 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-left hover:border-emerald-500/50 focus-visible:outline-2 focus-visible:outline-emerald-400">
        <span class="flex min-w-0 items-center gap-3">
          <span data-morph="filter-icon" class="material-symbols-rounded text-xl text-emerald-400">filter_list</span>
          <span id="listing-filter-value" class="truncate text-sm font-semibold text-white">{{ filterLabel() }}</span>
        </span>
        <span class="material-symbols-rounded text-xl text-slate-400">expand_more</span>
      </button>

      <div class="mt-5 flex items-center justify-between text-xs text-slate-400">
        <span>{{ visibleListings().length }} publicaciones</span>
        <span>{{ priceOrder() ? 'Menor precio primero' : 'Orden original' }}</span>
      </div>
      <ul class="mt-3 divide-y divide-slate-800 border-y border-slate-800">
        @for (listing of visibleListings(); track listing.id) {
          <li [class.py-2]="compact()" [class.py-4]="!compact()" class="flex items-center justify-between gap-4">
            <div class="min-w-0">
              <h3 class="truncate text-sm font-semibold text-white">{{ listing.title }}</h3>
              @if (!compact()) { <p class="mt-1 text-xs text-slate-400">{{ stateLabel(listing.state) }}</p> }
            </div>
            <span class="shrink-0 text-xs font-semibold tabular-nums text-emerald-300">{{ formatPrice(listing.price) }}</span>
          </li>
        }
      </ul>
      <p role="status" aria-live="polite" class="mt-4 min-h-5 text-xs leading-relaxed text-slate-400">{{ feedback() }}</p>
    </section>

    <app-fluid-dialog #filterDialog label="Seleccionar estado de publicación" origin="control" placement="trigger" backdrop="none" [width]="340" (opened)="focusFilter()">
      <header class="flex items-center gap-2 pb-4 pr-10 text-sm font-bold text-white">
        <span data-morph="filter-icon" class="material-symbols-rounded text-xl text-emerald-400">filter_list</span>
        Estado de publicación
      </header>
      <div #options id="listing-state-options" role="listbox" aria-label="Estado de publicación" (keydown)="moveFocus($event)" class="space-y-1">
        @for (option of filterOptions; track option.value) {
          <button type="button" role="option" [attr.aria-selected]="filter() === option.value"
            [tabIndex]="filter() === option.value ? 0 : -1" [disabled]="filterDialog.isAnimating()"
            (click)="selectFilter(option.value)"
            [class.bg-emerald-500/15]="filter() === option.value"
            class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-400">
            <span>{{ option.label }}</span>
            @if (filter() === option.value) { <span class="material-symbols-rounded text-lg text-emerald-400">check</span> }
          </button>
        }
      </div>
    </app-fluid-dialog>

    <app-fluid-dialog #settings label="Opciones de la lista" origin="control" placement="trigger" backdrop="none" [width]="350" (opened)="focusSettings()">
      <header class="flex items-center gap-2 border-b border-slate-800 pb-4 pr-10 text-sm font-bold text-white">
        <span data-morph="settings-icon" class="material-symbols-rounded text-xl text-emerald-400">settings</span>
        Opciones de la lista
      </header>
      <div #settingsOptions id="listing-settings-menu" role="menu" aria-label="Opciones de la lista" (keydown)="moveFocus($event)" class="mt-3 space-y-1">
        <button type="button" role="menuitem" tabindex="-1" [disabled]="settings.isAnimating()" (click)="changeSetting('price')"
          class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-400">
          <span class="material-symbols-rounded text-xl text-emerald-400">sort</span>
          <span class="flex-1"><span class="block text-sm font-semibold text-white">{{ priceOrder() ? 'Volver al orden original' : 'Ordenar por precio' }}</span><span class="mt-1 block text-xs text-slate-400">{{ priceOrder() ? 'Desactivar el orden por precio' : 'De menor a mayor' }}</span></span>
        </button>
        <button type="button" role="menuitem" tabindex="-1" [disabled]="settings.isAnimating()" (click)="changeSetting('compact')"
          class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-400">
          <span class="material-symbols-rounded text-xl text-emerald-400">{{ compact() ? 'view_agenda' : 'density_small' }}</span>
          <span class="flex-1"><span class="block text-sm font-semibold text-white">{{ compact() ? 'Vista detallada' : 'Vista compacta' }}</span><span class="mt-1 block text-xs text-slate-400">{{ compact() ? 'Mostrar estado y más espacio' : 'Mostrar más filas en menos espacio' }}</span></span>
        </button>
        <button type="button" role="menuitem" tabindex="-1" [disabled]="settings.isAnimating()" (click)="changeSetting('reset')"
          class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-400">
          <span class="material-symbols-rounded text-xl text-slate-400">restart_alt</span>
          <span class="flex-1"><span class="block text-sm font-semibold text-white">Restablecer vista</span><span class="mt-1 block text-xs text-slate-400">Quitar filtros y ajustes</span></span>
        </button>
      </div>
    </app-fluid-dialog>
  `,
})
export class FluidControlsDemoComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly filterDialog = viewChild.required<FluidDialogComponent>('filterDialog');
  private readonly settings = viewChild.required<FluidDialogComponent>('settings');
  private readonly options = viewChild.required<ElementRef<HTMLElement>>('options');
  private readonly settingsOptions = viewChild.required<ElementRef<HTMLElement>>('settingsOptions');
  readonly filter = signal<ListingFilter>('all');
  readonly compact = signal(false);
  readonly priceOrder = signal(false);
  readonly feedback = signal('Los ajustes se aplican a esta lista durante la sesión.');
  readonly filterOptions: readonly { value: ListingFilter; label: string }[] = [
    { value: 'all', label: 'Todas las publicaciones' },
    { value: 'available', label: 'Disponibles' },
    { value: 'reserved', label: 'Reservadas' },
    { value: 'paused', label: 'Pausadas' },
  ];
  private readonly listings: readonly { id: number; title: string; price: number; state: ListingFilter }[] = [
    { id: 1, title: 'Semipiso en Palermo', price: 145000, state: 'available' },
    { id: 2, title: 'Loft en San Telmo', price: 98000, state: 'reserved' },
    { id: 3, title: 'Casa en Olivos', price: 265000, state: 'available' },
    { id: 4, title: 'Estudio en Belgrano', price: 76000, state: 'paused' },
  ];
  readonly filterLabel = computed(() => this.filterOptions.find(option => option.value === this.filter())?.label ?? 'Todas las publicaciones');
  readonly visibleListings = computed(() => {
    const listings = this.listings.filter(item => this.filter() === 'all' || item.state === this.filter());
    return this.priceOrder() ? listings.sort((a, b) => a.price - b.price) : listings;
  });

  selectFilter(value: ListingFilter): void {
    if (this.filterDialog().isAnimating()) return;
    this.filter.set(value);
    this.feedback.set('Filtro aplicado: ' + this.filterLabel() + '.');
    this.cdr.detectChanges();
    this.filterDialog().close();
  }

  changeSetting(setting: 'price' | 'compact' | 'reset'): void {
    if (this.settings().isAnimating()) return;
    if (setting === 'price') {
      this.priceOrder.update(value => !value);
      this.feedback.set(this.priceOrder() ? 'Publicaciones ordenadas de menor a mayor precio.' : 'Orden original restaurado.');
    } else if (setting === 'compact') {
      this.compact.update(value => !value);
      this.feedback.set(this.compact() ? 'Vista compacta activada.' : 'Vista detallada activada.');
    } else {
      this.filter.set('all');
      this.priceOrder.set(false);
      this.compact.set(false);
      this.feedback.set('Vista restablecida. Se muestran todas las publicaciones.');
    }
    this.cdr.detectChanges();
    this.settings().close();
  }

  focusFilter(): void {
    this.cdr.detectChanges();
    this.options().nativeElement.querySelector<HTMLElement>('[aria-selected="true"]')?.focus({ preventScroll: true });
  }

  focusSettings(): void {
    this.cdr.detectChanges();
    this.settingsOptions().nativeElement.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
  }

  moveFocus(event: KeyboardEvent): void {
    if (!(event.currentTarget instanceof HTMLElement)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    const current = buttons.findIndex(button => button === document.activeElement);
    let next: number;
    if (event.key === 'ArrowDown') next = (current + 1) % buttons.length;
    else if (event.key === 'ArrowUp') next = (current - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    buttons[next]?.focus();
  }

  stateLabel(state: ListingFilter): string {
    return state === 'available' ? 'Disponible' : state === 'reserved' ? 'Reservada' : 'Pausada';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  }
}
