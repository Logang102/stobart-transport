import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMotorcycle, faCar, faVanShuttle, faTruck, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FontAwesomeModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  faMotorcycle = faMotorcycle;
  faCar = faCar;
  faVanShuttle = faVanShuttle;
  faTruck = faTruck;
  faCheck = faCheck;
}