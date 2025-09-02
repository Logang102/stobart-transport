import { Component, AfterViewInit, ViewChild, ElementRef, inject, NgZone, PLATFORM_ID, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environments';

// This tells TypeScript that the 'google' object will exist at runtime.
declare const google: any;

// --- Custom Validator Function ---
// This function checks if the drop-off date is after the collection date.
export function dateOrderValidator(control: AbstractControl): ValidationErrors | null {
  const collectionDate = control.get('collectionDate')?.value;
  const dropoffDate = control.get('dropoffDate')?.value;
  
  if (collectionDate && dropoffDate && new Date(dropoffDate) < new Date(collectionDate)) {
    return { dateOrder: true }; // Return an error if drop-off is before collection
  }
  
  return null; // No error
};


@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('pickupAddressInput') pickupAddressElement!: ElementRef;
  @ViewChild('dropoffAddressInput') dropoffAddressElement!: ElementRef;

  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private fb = inject(FormBuilder);
  private renderer = inject(Renderer2);

  private mapsScriptId = 'google-maps-script';
  private scriptLoaded = false;

  contactForm: FormGroup;

  private pickupListener!: () => void;
  private dropoffListener!: () => void;

  constructor() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^\\+?[0-9\\s]{10,15}$')]], // UK-friendly phone pattern
      pickupAddress: ['', Validators.required],
      dropoffAddress: ['', Validators.required],
      collectionDate: ['', Validators.required],
      collectionTime: ['', Validators.required],
      dropoffDate: ['', Validators.required],
      dropoffTime: ['', Validators.required],
      enquiryType: ['swb', Validators.required]
    }, { validators: dateOrderValidator }); // Add the custom validator to the whole form
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pickupListener = this.renderer.listen(this.pickupAddressElement.nativeElement, 'focus', () => this.loadMapsAndInit());
      this.dropoffListener = this.renderer.listen(this.dropoffAddressElement.nativeElement, 'focus', () => this.loadMapsAndInit());
    }
  }
  
  // Helper getter to easily access form controls in the template
  get f() { return this.contactForm.controls; }

  onSubmit() {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;
      const collectionDateFormatted = this.formatDate(formValue.collectionDate);
      const dropoffDateFormatted = this.formatDate(formValue.dropoffDate);

      console.log('Form Submitted!', {
        ...formValue,
        collectionDate: collectionDateFormatted,
        dropoffDate: dropoffDateFormatted
      });
      // Here you would typically send the data to your backend service
      // e.g., this.myApiService.sendQuote(this.contactForm.value).subscribe(...)
      alert('Quote request sent successfully!');
      this.contactForm.reset();

    } else {
      // Mark all fields as touched to display validation errors
      this.contactForm.markAllAsTouched();
      console.log('Form is invalid');
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  private loadMapsAndInit(): void {
    if (this.scriptLoaded) return;
    this.loadGoogleMaps().then(() => {
      this.scriptLoaded = true;
      this.ngZone.run(() => this.initializeAutocomplete());
      // Clean up listeners once the script is loaded
      if (this.pickupListener) this.pickupListener();
      if (this.dropoffListener) this.dropoffListener();
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
      
      const pickupAutocomplete = new google.maps.places.Autocomplete(this.pickupAddressElement.nativeElement, options);
      pickupAutocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
            this.contactForm.controls['pickupAddress'].setValue(this.pickupAddressElement.nativeElement.value);
        });
      });

      const dropoffAutocomplete = new google.maps.places.Autocomplete(this.dropoffAddressElement.nativeElement, options);
      dropoffAutocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
            this.contactForm.controls['dropoffAddress'].setValue(this.dropoffAddressElement.nativeElement.value);
        });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.pickupListener) this.pickupListener();
    if (this.dropoffListener) this.dropoffListener();
  }
}