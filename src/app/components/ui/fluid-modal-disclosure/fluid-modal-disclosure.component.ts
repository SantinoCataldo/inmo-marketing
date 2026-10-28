import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';
import gsap from 'gsap';
import { modalPosition, triggerRadius } from '../fluid-dialog/morph-geometry';
import { FluidMotion } from '../fluid-dialog/fluid-motion';
import { NestedModalDemoComponent } from './nested-modal-demo.component';
import { FluidControlsDemoComponent } from './fluid-controls-demo.component';
import { FluidTaskDemoComponent } from './fluid-task-demo.component';

export type AlternativeType = 'chatMockup' | 'propertyCard' | 'authPill' | 'kpiStat' | 'aiCapsule' | 'swapLayout' | 'calendarBooking' | 'calendarHeader' | 'listEditor' | 'rowEditor' | 'nestedEditor' | 'fluidControls' | 'fluidTask';
export type AuthModalMode = 'register' | 'login';

export interface AuthSubmitEvent {
  mode: AuthModalMode;
  email: string;
  password?: string;
}

interface EditableListing {
  id: number;
  title: string;
  address: string;
  price: number;
  status: 'Disponible' | 'Reservada' | 'Pausada';
  description: string;
}

export interface AlternativeItem {
  id: AlternativeType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-fluid-modal-disclosure',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkTrapFocus, NestedModalDemoComponent, FluidControlsDemoComponent, FluidTaskDemoComponent],
  templateUrl: './fluid-modal-disclosure.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    #modal-card { scrollbar-width: thin; scrollbar-color: #334155 #0c1410; }
  `]
})
export class FluidModalDisclosureComponent implements OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly heroTag = input<string>('InmoMarketing');
  readonly heroTitle = input<string>('sb\nMoney');
  readonly heroSubtitle = input<string>('Tu dinero, claro y simple en un lugar bonito.');

  readonly authSubmitted = output<AuthSubmitEvent>();

  readonly alternatives: AlternativeItem[] = [
    { id: 'chatMockup', label: '1. Chat Mockup', icon: 'chat' },
    { id: 'propertyCard', label: '2. Ficha Inmueble', icon: 'home' },
    { id: 'authPill', label: '3. Botón Auth', icon: 'badge' },
    { id: 'kpiStat', label: '4. Métrica KPI', icon: 'analytics' },
    { id: 'aiCapsule', label: '5. Cápsula IA', icon: 'auto_awesome' },
    { id: 'swapLayout', label: '6. Swap Posición', icon: 'swap_horiz' },
    { id: 'calendarBooking', label: '7. Calendario Dispar', icon: 'calendar_month' },
    { id: 'calendarHeader', label: '8. Cabecera Fecha', icon: 'today' },
    { id: 'listEditor', label: '9. Lista · Editor', icon: 'edit_square' },
    { id: 'rowEditor', label: '10. Fila · Posición', icon: 'open_in_new' },
    { id: 'nestedEditor', label: '11. Modales anidados', icon: 'layers' },
    { id: 'fluidControls', label: '12. Select · Opciones', icon: 'tune' },
    { id: 'fluidTask', label: '13. Añadir tarea', icon: 'add_task' }
  ];

  readonly editorItems = signal<EditableListing[]>([
    { id: 1, title: 'Semipiso en Palermo', address: 'Av. del Libertador 2800', price: 145000, status: 'Disponible', description: 'Tres ambientes con balcón, cochera y vistas abiertas.' },
    { id: 2, title: 'Loft en San Telmo', address: 'Defensa 840', price: 98000, status: 'Reservada', description: 'Planta abierta, techos altos y patio compartido.' },
    { id: 3, title: 'Casa en Olivos', address: 'Ricardo Gutiérrez 1200', price: 265000, status: 'Disponible', description: 'Casa de cuatro ambientes con jardín y parrilla.' },
    { id: 4, title: 'Estudio en Belgrano', address: 'Ciudad de la Paz 1900', price: 76000, status: 'Pausada', description: 'Monoambiente luminoso, cercano al subte.' },
    { id: 5, title: 'Dúplex en Caballito', address: 'Hidalgo 620', price: 182000, status: 'Disponible', description: 'Dos plantas, terraza propia y escritorio.' },
    { id: 6, title: 'Departamento en Núñez', address: 'Crisólogo Larralde 2100', price: 119000, status: 'Disponible', description: 'Dos ambientes con balcón al contrafrente.' },
  ]);
  readonly editingId = signal<number | null>(null);
  editorDraft: Omit<EditableListing, 'id'> = {
    title: '', address: '', price: 0, status: 'Disponible', description: '',
  };

  readonly rowEditorPlacement = signal<'bottom-right' | 'trigger'>('bottom-right');

  openEditor(item: EditableListing, trigger: HTMLElement, variant: 'listEditor' | 'rowEditor' = 'listEditor'): void {
    if (this.isOpen() || this.isAnimating()) return;
    this.editingId.set(item.id);
    const { id, ...draft } = item;
    this.editorDraft = { ...draft };
    this.openAlternative(variant, trigger);
  }

  saveEditor(): void {
    const title = this.editorDraft.title.trim();
    const address = this.editorDraft.address.trim();
    if (!title || !address || !Number.isFinite(this.editorDraft.price) || this.editorDraft.price <= 0) return;
    this.editorItems.update(items => items.map(item => item.id === this.editingId()
      ? { ...item, ...this.editorDraft, title, address } : item));
    this.close();
  }

  readonly activeTab = signal<AlternativeType>('chatMockup');
  readonly activeModalVariant = signal<AlternativeType>('chatMockup');
  readonly isOpen = signal<boolean>(false);
  readonly isAnimating = signal<boolean>(false);

  // Alternative 2: Property Card state
  readonly propertyPrice = signal<number>(145000);
  readonly propertyLeadSent = signal<boolean>(false);
  propertyLeadName = '';
  propertyLeadPhone = '';

  // Alternative 3: Auth state
  readonly authMode = signal<AuthModalMode>('register');
  readonly isProcessing = signal<boolean>(false);
  readonly isDone = signal<boolean>(false);
  email = '';
  password = '';
  confirmPassword = '';

  // Alternative 5: AI Copy Studio state
  readonly aiTone = signal<'Persuasivo' | 'Elegante' | 'Urgencia'>('Persuasivo');
  readonly aiCopied = signal<boolean>(false);

  // Alternative 6: Swap Layout state
  readonly swapActivePortals = signal<number>(3);
  readonly portalZonaprop = signal<boolean>(true);
  readonly portalArgenprop = signal<boolean>(true);
  readonly portalMercadoLibre = signal<boolean>(true);

  // Alternative 7: Calendar Booking state
  readonly selectedDay = signal<number>(29);
  readonly selectedMonth = signal<'Octubre' | 'Noviembre'>('Octubre');
  readonly selectedYear = signal<number>(2026);
  readonly selectedTime = signal<string>('15:30');
  readonly bookingConfirmed = signal<boolean>(false);

  readonly octoberDays = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly novemberDays = Array.from({ length: 30 }, (_, i) => i + 1);

  @ViewChild('backdrop') backdropRef?: ElementRef<HTMLElement>;
  @ViewChild('modalCard') modalCardRef?: ElementRef<HTMLElement>;

  private activeTriggerEl?: HTMLElement;
  private activeInitialRadius = 32;
  private activeInitialBg = '#0c1410';
  private activeInitialBorderColor = 'rgba(16, 185, 129, 0.25)';

  private timeline?: gsap.core.Timeline;
  private previousOverflow = '';
  private readonly motion = new FluidMotion();

  onEscape(): void {
    if (this.isOpen() && !this.isAnimating() && !this.isProcessing()) this.close();
  }

  ngOnDestroy(): void {
    this.timeline?.kill();
    this.motion.clear();
    if (this.activeTriggerEl) this.restoreTrigger();
  }

  private restoreTrigger(): void {
    this.activeTriggerEl?.style.removeProperty('opacity');
    this.activeTriggerEl?.style.removeProperty('pointer-events');
    this.activeTriggerEl?.style.removeProperty('scale');
    this.activeTriggerEl?.style.removeProperty('transition');
    if (this.activeTriggerEl) gsap.set(this.activeTriggerEl, { clearProps: 'transform' });
    document.body.style.overflow = this.previousOverflow;
  }

  setAlternative(tab: AlternativeType): void {
    if (this.isOpen() || this.isAnimating()) return;

    this.activeTab.set(tab);
  }

  openAlternative(variant: AlternativeType, triggerEl: HTMLElement, mode?: AuthModalMode): void {
    if (this.isOpen() || this.isAnimating()) return;

    this.activeModalVariant.set(variant);
    this.activeTriggerEl = triggerEl;
    this.isAnimating.set(true);
    this.previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (variant === 'authPill' && mode) {
      this.authMode.set(mode);
      this.isDone.set(false);
      this.isProcessing.set(false);
    }

    // Remove the hover scale before measuring both the card and its children.
    triggerEl.style.transition = 'none';
    triggerEl.style.scale = '1';
    triggerEl.style.pointerEvents = 'none';
    gsap.set(triggerEl, { scale: 1 });
    const first = triggerEl.getBoundingClientRect();
    const sourceStyle = getComputedStyle(triggerEl);
    this.activeInitialRadius = triggerRadius(sourceStyle.borderRadius, first.height);
    this.activeInitialBg = variant === 'authPill'
      ? (mode === 'register' ? '#00e676' : '#0f172a') : '#0c1410';
    this.activeInitialBorderColor = variant === 'authPill'
      ? (mode === 'register' ? 'transparent' : 'rgba(51, 65, 85, 0.8)')
      : 'rgba(16, 185, 129, 0.25)';
    if (sourceStyle.borderTopStyle === 'none' || parseFloat(sourceStyle.borderTopWidth) === 0) {
      this.activeInitialBorderColor = 'transparent';
    }
    triggerEl.style.opacity = '0';
    this.isOpen.set(true);
    this.cdr.detectChanges();

    const card = this.modalCardRef?.nativeElement;
    const backdrop = this.backdropRef?.nativeElement;
    const content = card?.querySelector<HTMLElement>('.modal-content');
    if (!card || !backdrop || !content) {
      this.restoreTrigger();
      this.isOpen.set(false);
      this.isAnimating.set(false);
      return;
    }

    const width = Math.min(window.innerWidth - 32, variant === 'listEditor' ? 820 : variant === 'rowEditor' ? 520 : 440);
    const placement = variant === 'rowEditor' ? this.rowEditorPlacement() : 'center';
    const availableHeight = window.innerHeight - 40;
    // Keep Last's layout throughout the flight; only the shell changes its bounds.
    content.style.width = 'auto';
    gsap.set(card, { width, height: 'auto',
      overflowY: 'auto', top: 0, left: 0, visibility: 'hidden' });
    card.style.maxHeight = availableHeight + 'px';
    const height = card.offsetHeight;
    content.style.width = (card.clientWidth - 48) + 'px';
    card.style.maxHeight = 'none';
    const { left, top } = modalPosition({ width, height,
      viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
      originLeft: first.left, originTop: first.top,
    }, placement);
    gsap.set(card, { top, left, height });
    const last = card.getBoundingClientRect();
    const compact = card.querySelector<HTMLElement>('.modal-compact-view');
    const close = card.querySelector<HTMLElement>('#btn-modal-close');
    if (compact) gsap.set(compact, { width: first.width - 2, opacity: 1, y: 0 });
    gsap.set(backdrop, { opacity: 0 });


    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.4;
    const tl = gsap.timeline({ onComplete: () => {
      this.motion.clear();
      this.isAnimating.set(false);
      card.style.overflowY = 'auto';
      close?.focus({ preventScroll: true });
    } });
    this.timeline = tl;
    this.motion.shared(tl, triggerEl, card, card, first, last, duration);
    gsap.set(card, {
      top: first.top, left: first.left, width: first.width, height: first.height,
      borderRadius: this.activeInitialRadius, backgroundColor: this.activeInitialBg,
      borderColor: this.activeInitialBorderColor, overflow: 'hidden', visibility: 'visible', zIndex: 60
    });
    this.motion.press(tl, card, duration);
    this.motion.travel(tl, card, first, { left, top }, duration);
    this.motion.reveal(tl, content, duration, 0.3);
    tl.to(backdrop, { opacity: 1, duration }, 0);
    tl.to(card, { width, height, borderRadius: 32,
      backgroundColor: '#0c1410', borderColor: 'rgba(16, 185, 129, 0.25)',
      duration, ease: 'stepbroEase' }, 0);
    if (compact) tl.to(compact, { opacity: 0, y: -6, duration: duration * 0.3,
      onComplete: () => { compact.style.visibility = 'hidden'; } }, 0);
    if (close) this.motion.reveal(tl, close, duration, 0.5);
  }

  close(): void {
    if (!this.isOpen() || this.isAnimating()) return;
    const trigger = this.activeTriggerEl;
    const card = this.modalCardRef?.nativeElement;
    if (!trigger || !card) return;

    this.isAnimating.set(true);
    this.cdr.detectChanges();
    card.style.overflow = 'hidden';
    card.scrollTop = 0;
    const swapHeader = card.querySelector<HTMLElement>('.swap-title-target')?.parentElement;
    if (swapHeader) swapHeader.style.borderBottomColor = 'transparent';
    const source = card.getBoundingClientRect();
    const target = trigger.getBoundingClientRect();
    const content = card.querySelector<HTMLElement>('.modal-content');
    const close = card.querySelector<HTMLElement>('#btn-modal-close');
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.35;
    const tl = gsap.timeline({ onComplete: () => {
      this.motion.clear();
      this.restoreTrigger();
      gsap.set(trigger, { clearProps: 'transform' });
      this.isOpen.set(false);
      this.isAnimating.set(false);
      this.isProcessing.set(false);
      this.isDone.set(false);
      this.activeTriggerEl = undefined;
      this.cdr.detectChanges();
      trigger.focus({ preventScroll: true });
    } });
    this.timeline = tl;
    if (close) this.motion.conceal(tl, close, duration);
    this.motion.shared(tl, card, trigger, card, source, target, duration);
    this.motion.landing(tl, trigger, card, target, duration);
    this.motion.press(tl, card, duration);
    if (content) this.motion.conceal(tl, content, duration);
    this.motion.travel(tl, card, source, target, duration);
    tl.to(card, { width: target.width, height: target.height,
      borderRadius: this.activeInitialRadius, backgroundColor: this.activeInitialBg,
      borderColor: this.activeInitialBorderColor, duration, ease: 'stepbroEase' }, 0);
    if (this.backdropRef) tl.to(this.backdropRef.nativeElement, { opacity: 0, duration }, 0);
  }

  // --- Alternative 2 methods ---
  selectPrice(price: number): void {

    this.propertyPrice.set(price);
  }

  submitPropertyLead(): void {

    this.propertyLeadSent.set(true);
    setTimeout(() => {
      this.close();
      this.propertyLeadSent.set(false);
    }, 900);
  }

  // --- Alternative 3 methods ---
  toggleAuthMode(): void {

    this.authMode.update((m) => (m === 'register' ? 'login' : 'register'));
  }

  async handleSubmit(): Promise<void> {
    if (this.isProcessing() || this.isDone()) return;

    this.isProcessing.set(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    this.isProcessing.set(false);
    this.isDone.set(true);


    this.authSubmitted.emit({
      mode: this.authMode(),
      email: this.email,
      password: this.password
    });

    setTimeout(() => {
      this.close();
    }, 700);
  }

  // --- Alternative 5 methods ---
  setAiTone(tone: 'Persuasivo' | 'Elegante' | 'Urgencia'): void {

    this.aiTone.set(tone);
  }

  get currentAiCopy(): string {
    const tone = this.aiTone();
    if (tone === 'Persuasivo') {
      return '🏡 ¿Buscás tu próximo hogar en Palermo Chico? Este semipiso de 3 ambientes combina vistas abiertas, cochera cubierta y luminosidad total. Disponible para escriturar ya. Escribinos para coordinar una visita privada.';
    }
    if (tone === 'Elegante') {
      return '✨ Distinción sobre Av. Del Libertador. Residencia de 85 m² concebida con materiales nobles, suite principal y entorno arbolado privilegiado. Agendá un recorrido exclusivo con nuestro equipo.';
    }
    return '⚡ Oportunidad única en Palermo Chico: precio ajustado para cierre inmediato. 3 ambientes con cochera fija en ubicación premium. No dejes pasar esta reserva hoy mismo.';
  }

  async copyAICopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.currentAiCopy);

      this.aiCopied.set(true);
      setTimeout(() => this.aiCopied.set(false), 2200);
    } catch {

    }
  }

  formatUSD(val: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  }

  // --- Alternative 6 methods ---
  togglePortal(portal: 'zonaprop' | 'argenprop' | 'ml'): void {

    if (portal === 'zonaprop') this.portalZonaprop.update(v => !v);
    if (portal === 'argenprop') this.portalArgenprop.update(v => !v);
    if (portal === 'ml') this.portalMercadoLibre.update(v => !v);

    let count = 0;
    if (this.portalZonaprop()) count++;
    if (this.portalArgenprop()) count++;
    if (this.portalMercadoLibre()) count++;
    this.swapActivePortals.set(count);
  }

  // --- Alternative 7: Calendar methods ---
  get currentDays(): number[] {
    return this.selectedMonth() === 'Octubre' ? this.octoberDays : this.novemberDays;
  }

  get monthStartOffset(): number[] {
    const count = this.selectedMonth() === 'Octubre' ? 3 : 6;
    return Array.from({ length: count }, (_, i) => i);
  }

  get formattedSelectedDate(): string {
    const day = this.selectedDay();
    const month = this.selectedMonth();
    return `${day} de ${month}, ${this.selectedYear()}`;
  }

  getDayName(day: number): string {
    const monthIndex = this.selectedMonth() === 'Octubre' ? 9 : 10;
    const date = new Date(this.selectedYear(), monthIndex, day);
    const dayName = new Intl.DateTimeFormat('es-AR', { weekday: 'long' }).format(date);
    return dayName.charAt(0).toUpperCase() + dayName.slice(1);
  }

  selectDay(day: number): void {

    this.selectedDay.set(day);
  }

  selectTime(time: string): void {

    this.selectedTime.set(time);
  }

  toggleMonth(direction: 'next' | 'prev'): void {

    if (this.selectedMonth() === 'Octubre') {
      this.selectedMonth.set('Noviembre');
      if (this.selectedDay() > 30) this.selectedDay.set(30);
    } else {
      this.selectedMonth.set('Octubre');
    }
  }

  confirmBooking(): void {

    this.bookingConfirmed.set(true);
    setTimeout(() => {
      this.close();
      setTimeout(() => this.bookingConfirmed.set(false), 400);
    }, 600);
  }
}
