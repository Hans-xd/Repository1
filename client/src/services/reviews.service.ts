// src/app/services/reviews.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Review {
  id: number;
  placeId: string;      // el place_id de Google Places
  rating: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private api = environment.reviewsApiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Review[]> {
    return this.http.get<Review[]>(this.api);
  }

  add(review: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(this.api, review);
  }
}
