import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  processPayment(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/process`, request);
  }

  getPayment(paymentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${paymentId}`);
  }

  getByBooking(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/booking/${bookingId}`);
  }

  getMyPayments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/me`);
  }

  refundPayment(paymentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${paymentId}/refund`, {});
  }

  downloadReceipt(paymentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${paymentId}/receipt`, { responseType: 'blob' });
  }

  getTotalRevenue(start: string, end: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue?start=${start}&end=${end}`);
  }

  getPaymentHistory(): Observable<any> {
    return this.getMyPayments();
  }

  requestRefund(paymentId: number): Observable<any> {
    return this.refundPayment(paymentId);
  }
}