// src/app/services/google-places.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface PlaceDetails {
  name: string;
  address: string;
  photoUrl: string;
}

@Injectable({ providedIn: 'root' })
export class GooglePlacesService {
  private key = environment.googleMapsApiKey;

  constructor(private http: HttpClient) {}

  getDetails(placeId: string): Observable<PlaceDetails> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json`
      + `?place_id=${placeId}&key=${this.key}&fields=name,formatted_address,photo`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const result = res.result;
        let photoUrl = '';
        if (result.photos && result.photos.length) {
          const ref = result.photos[0].photo_reference;
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo`
            + `?maxwidth=400&photoreference=${ref}&key=${this.key}`;
        }
        return {
          name: result.name,
          address: result.formatted_address,
          photoUrl
        } as PlaceDetails;
      })
    );
  }
}
