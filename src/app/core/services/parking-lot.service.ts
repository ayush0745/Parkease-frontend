import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ParkingLot, Spot } from '../models/parking-lot.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParkingLotService {
  private lotApiUrl = `${environment.apiUrl}/lots`;
  private spotApiUrl = `${environment.apiUrl}/spots`;

  constructor(private http: HttpClient) {}

  // ================= LOT APIs =================
  /** Full-text search: GET /lots/search?q= */
  searchLots(query: string): Observable<ParkingLot[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ParkingLot[]>(`${this.lotApiUrl}/search`, { params });
  }

  /** GPS proximity search: GET /lots/nearby?latitude=&longitude=&radiusKm= */
  getNearbyLots(latitude: number, longitude: number, radiusKm = 3): Observable<ParkingLot[]> {
    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('radiusKm', radiusKm);
    return this.http.get<ParkingLot[]>(`${this.lotApiUrl}/nearby`, { params });
  }

  /** City search: GET /lots/city/{city} */
  getLotsByCity(city: string): Observable<any> {
    return this.http.get(`${this.lotApiUrl}/city/${encodeURIComponent(city)}`);
  }

  /** Get lots (paginated) */
  getLots(): Observable<any> {
    return this.http.get<any>(`${this.lotApiUrl}/search?q=`);
  }

  getLotById(id: string | number): Observable<ParkingLot> {
    return this.http.get<ParkingLot>(`${this.lotApiUrl}/${id}`);
  }

  getManagerLots(managerId: number): Observable<any> {
    return this.http.get(`${this.lotApiUrl}/manager/${managerId}`);
  }

  createLot(lot: ParkingLot): Observable<ParkingLot> {
    return this.http.post<ParkingLot>(this.lotApiUrl, lot);
  }

  updateLot(id: string, lot: Partial<ParkingLot>): Observable<ParkingLot> {
    return this.http.put<ParkingLot>(`${this.lotApiUrl}/${id}`, lot);
  }

  toggleLotStatus(id: string, isOpen: boolean): Observable<ParkingLot> {
    return this.http.patch<ParkingLot>(`${this.lotApiUrl}/${id}/open?open=${isOpen}`, {});
  }

  // ================= ADMIN APIs =================
  getPendingLots(): Observable<any> {
    return this.http.get(`${this.lotApiUrl}/admin/pending`);
  }

  approveLot(id: string): Observable<any> {
    return this.http.patch(`${this.lotApiUrl}/${id}/approve`, {});
  }

  rejectLot(id: string, reason: string): Observable<any> {
    return this.http.patch(`${this.lotApiUrl}/${id}/reject?reason=${encodeURIComponent(reason)}`, {});
  }

  // ================= SPOT APIs =================
  getSpotsByLotId(lotId: string): Observable<Spot[]> {
    return this.http.get<Spot[]>(`${this.spotApiUrl}/lot/${lotId}`);
  }

  addSpot(spot: Spot): Observable<Spot> {
    return this.http.post<Spot>(this.spotApiUrl, spot);
  }

  addSpotsBulk(request: any): Observable<any> {
    return this.http.post<any>(`${this.spotApiUrl}/bulk`, request);
  }

  updateSpot(id: string, spot: Spot): Observable<Spot> {
    return this.http.put<Spot>(`${this.spotApiUrl}/${id}`, spot);
  }

  reserveSpot(id: string): Observable<Spot> {
    return this.http.patch<Spot>(`${this.spotApiUrl}/${id}/reserve`, {});
  }

  releaseSpot(id: string): Observable<Spot> {
    return this.http.patch<Spot>(`${this.spotApiUrl}/${id}/release`, {});
  }

  getAvailableCount(lotId: string): Observable<number> {
    return this.http.get<number>(`${this.spotApiUrl}/lot/${lotId}/count/available`);
  }

  getAvailableSpots(lotId: string): Observable<Spot[]> {
    return this.http.get<Spot[]>(`${this.spotApiUrl}/lot/${lotId}/available`);
  }

  getMyLots(): Observable<any> {
    return this.http.get(`${this.lotApiUrl}/manager/me`);
  }

  deleteLot(lotId: number): Observable<any> {
    return this.http.delete(`${this.lotApiUrl}/${lotId}`);
  }

  deleteSpot(id: string): Observable<void> {
    return this.http.delete<void>(`${this.spotApiUrl}/${id}`);
  }
}
