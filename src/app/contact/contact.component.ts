import { Component, AfterViewInit, ViewChild, ElementRef, inject, NgZone, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MapsLoaderService } from '../services/google/maps-loader.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements AfterViewInit {
  @ViewChild('pickupAddressInput') pickupAddressElement!: ElementRef;
  @ViewChild('dropoffAddressInput') dropoffAddressElement!: ElementRef;

  private mapsLoader = inject(MapsLoaderService);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID); // Inject PLATFORM_ID

  ngAfterViewInit(): void {
    // Add the same check here
    if (isPlatformBrowser(this.platformId)) {
      this.mapsLoader.load().then(() => {
        this.ngZone.run(() => {
          this.initializeAutocomplete();
        });
      }).catch(err => console.error('Error loading Google Maps script:', err));
    }
  }

  private initializeAutocomplete(): void {
    if (this.pickupAddressElement && this.dropoffAddressElement) {
      const options = {
        componentRestrictions: { country: "uk" },
        fields: ["address_components", "geometry", "icon", "name"],
        strictBounds: false,
      };

      new google.maps.places.Autocomplete(this.pickupAddressElement.nativeElement, options);
      new google.maps.places.Autocomplete(this.dropoffAddressElement.nativeElement, options);
    }
  }
}
