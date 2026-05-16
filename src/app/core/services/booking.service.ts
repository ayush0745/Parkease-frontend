import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(request: any): Observable<any> {
    // Validate request before sending
    console.log('Booking service received:', request);
    
    if (!request) {
      return throwError(() => new Error('Booking request is null or undefined'));
    }
    
    if (!request.spotId) {
      return throwError(() => new Error('Missing spotId in booking request'));
    }
    
    if (!request.vehicleId) {
      return throwError(() => new Error('Missing vehicleId in booking request'));
    }
    
    if (!request.startTime) {
      return throwError(() => new Error('Missing startTime in booking request'));
    }
    
    if (!request.endTime) {
      return throwError(() => new Error('Missing endTime in booking request'));
    }
    
    return this.http.post(this.apiUrl, request);
  }

  getBooking(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${bookingId}`);
  }

  getMyBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/me`);
  }

  getLotBookings(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lot/${lotId}`);
  }

  getActiveBookings(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lot/${lotId}/active`);
  }

  getBookingHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/history`);
  }

  checkIn(bookingId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${bookingId}/check-in`, {});
  }

  checkOut(bookingId: number, paymentMode = 'CASH'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${bookingId}/check-out?paymentMode=${paymentMode}`, {});
  }

  extendBooking(bookingId: number, request: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${bookingId}/extend`, request);
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${bookingId}/cancel`, {});
  }

  calculateFare(spotId: number, start: string, end: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/calculate?spotId=${spotId}&start=${start}&end=${end}`);
  }
}