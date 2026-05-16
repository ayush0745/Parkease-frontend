import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  logOccupancy(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/occupancy`, data);
  }

  getAnalyticsLog(logId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${logId}`);
  }

  getAnalyticsByLot(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lots/${lotId}`);
  }

  getAnalyticsByRange(lotId: number, start: string, end: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/lots/${lotId}/range?start=${start}&end=${end}`);
  }

  getOccupancyRate(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lots/${lotId}/occupancy-rate`);
  }

  getOccupancyByHour(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lots/${lotId}/by-hour`);
  }

  getPeakHours(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lots/${lotId}/peak-hours`);
  }

  getRevenue(lotId: number, start: string, end: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenue?lotId=${lotId}&start=${start}&end=${end}`);
  }

  getRevenueByDay(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/revenueByDay?lotId=${lotId}`);
  }

  getMostUsedSpotTypes(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/spotTypes?lotId=${lotId}`);
  }

  getAverageDuration(lotId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/avgDuration?lotId=${lotId}`);
  }

  getPlatformSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/platform-summary`);
  }

  getDailyReport(lotId: number, date?: string): Observable<any> {
    const params = date ? `?date=${date}` : '';
    return this.http.get(`${this.apiUrl}/lots/${lotId}/daily-report${params}`);
  }
}