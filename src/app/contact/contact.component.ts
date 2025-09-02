import { Component, AfterViewInit, ViewChild, ElementRef, inject, NgZone, PLATFORM_ID, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
// Import FormBuilder and FormGroup for reactive forms
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environments';

// This tells TypeScript that the 'google' object will exist at runtime.
declare const google: any;

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

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private fb = inject(FormBuilder); // Inject FormBuilder
  private renderer = inject(Renderer2);

  private mapsScriptId = 'google-maps-script';
  private scriptLoaded = false;

  contactForm: FormGroup; // Property to hold our form

  // Listeners for cleaning up later
  private pickupListener!: () => void;
  private dropoffListener!: () => void;

  constructor() {
    // Initialize the form in the constructor, matching your HTML order
    this.contactForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      pickupAddress: ['', Validators.required],
      dropoffAddress: ['', Validators.required],
      collectionDate: ['', Validators.required],
      collectionTime: ['', Validators.required],
      dropoffDate: ['', Validators.required],
      dropoffTime: ['', Validators.required],
      enquiryType: ['swb', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Set up listeners to load the script on the first focus
      this.pickupListener = this.renderer.listen(this.pickupAddressElement.nativeElement, 'focus', () => this.loadMapsAndInit());
      this.dropoffListener = this.renderer.listen(this.dropoffAddressElement.nativeElement, 'focus', () => this.loadMapsAndInit());
    }
  }

  // --- Form submission handler ---
  onSubmit() {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;

      // Format the dates
      const collectionDateFormatted = this.formatDate(formValue.collectionDate);
      const dropoffDateFormatted = this.formatDate(formValue.dropoffDate);

      // Log the formatted data to the console
      console.log('Form Submitted!', {
        ...formValue,
        collectionDate: collectionDateFormatted,
        dropoffDate: dropoffDateFormatted
      });

    } else {
      console.log('Form is invalid');
    }
  }

  // --- Date formatting helper ---
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  // --- Existing Maps logic ---
  private loadMapsAndInit(): void {
    if (this.scriptLoaded) return;
    this.loadGoogleMaps().then(() => {
      this.scriptLoaded = true;
      this.ngZone.run(() => this.initializeAutocomplete());
      this.pickupListener();
      this.dropoffListener();
    }).catch(err => console.error('Error loading Google Maps script:', err));
  }

  private loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById(this.mapsScriptId) || (window.google && window.google.maps)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = this.mapsScriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  private initializeAutocomplete(): void {
    if (this.pickupAddressElement && this.dropoffAddressElement) {
      const options = { componentRestrictions: { country: "uk" }, fields: ["address_components", "geometry", "icon", "name"], strictBounds: false };
      new google.maps.places.Autocomplete(this.pickupAddressElement.nativeElement, options);
      new google.maps.places.Autocomplete(this.dropoffAddressElement.nativeElement, options);
    }
  }

  ngOnDestroy(): void {
    if (this.pickupListener) this.pickupListener();
    if (this.dropoffListener) this.dropoffListener();
  }
}
