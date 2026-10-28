import { Component } from '@angular/core';
import { AuthSubmitEvent, FluidModalDisclosureComponent } from '../../components/ui';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FluidModalDisclosureComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  onAuthSubmitted(event: AuthSubmitEvent): void {
    console.log('Auth enviado:', event);
  }
}
