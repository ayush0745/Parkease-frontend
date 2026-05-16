import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  registerVehicle(vehicle: any): Observable<any> {
    return this.http.post(this.apiUrl, vehicle);
  }

  addVehicle(vehicle: any): Observable<any> {
    return this.registerVehicle(vehicle);
  }

  getVehicle(vehicleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${vehicleId}`);
  }

  getMyVehicles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner/me`);
  }

  getVehiclesByOwner(ownerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner/${ownerId}`);
  }

  getAllVehicles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  getByLicensePlate(plate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/plate/${plate}`);
  }

  getVehicleType(plate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/plate/${plate}/type`);
  }

  isEVVehicle(plate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/plate/${plate}/ev`);
  }

  getByVehicleType(vehicleType: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/type/${vehicleType}`);
  }

  getEVVehicles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ev`);
  }

  updateVehicle(vehicleId: number, vehicle: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${vehicleId}`, vehicle);
  }

  deleteVehicle(vehicleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${vehicleId}`);
  }
}