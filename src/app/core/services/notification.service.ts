import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  sendNotification(notification: any): Observable<any> {
    return this.http.post(this.apiUrl, notification);
  }

  sendBulkNotifications(notifications: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, notifications);
  }

  getAllNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  getNotification(notificationId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${notificationId}`);
  }

  getByType(type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/type/${type}`);
  }

  getByRelatedId(relatedId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/related/${relatedId}`);
  }

  getByRecipient(recipientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipient/${recipientId}`);
  }

  getUnreadNotifications(recipientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipient/${recipientId}/unread`);
  }

  getUnreadCount(recipientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recipient/${recipientId}/unread/count`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${notificationId}/read`, {});
  }

  getMyNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/me`);
  }

  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.apiUrl}/user/me/read-all`, {});
  }

  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`);
  }
}