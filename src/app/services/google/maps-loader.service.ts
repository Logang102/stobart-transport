import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environments';
@Injectable({
  providedIn: 'root'
})
export class MapsLoaderService {
  private scriptLoadingPromise?: Promise<void>;

  // Inject PLATFORM_ID to determine the current platform
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public load(): Promise<void> {
    // Only run this code if we are in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      if (this.scriptLoadingPromise) {
        return this.scriptLoadingPromise;
      }

      this.scriptLoadingPromise = new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);

        document.head.appendChild(script);
      });

      return this.scriptLoadingPromise;
    }

    // If not on a browser, return an empty resolved promise
    return Promise.resolve();
  }
}
