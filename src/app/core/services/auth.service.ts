import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveAuthData(response);
        this.fetchProfile(); // Get full name after login
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.saveAuthData(response, data.fullName); // Save name from request
      })
    );
  }

  private saveAuthData(response: AuthResponse, fullName?: string) {
    localStorage.setItem('parkease_token', response.accessToken);
    const userData = {
      id: response.userId,
      email: response.email,
      role: response.role,
      fullName: fullName || response.fullName // Use provided name or response if available
    };
    localStorage.setItem('parkease_user', JSON.stringify(userData));
    this.currentUserSubject.next(userData as any);
  }

  fetchProfile() {
    const token = this.getToken();
    if (!token) return;

    this.http.get<User>(`${this.apiUrl}/profile`).subscribe({
      next: (profile) => {
        const user = this.currentUserValue;
        if (user) {
          const updatedUser = { ...user, fullName: profile.fullName };
          localStorage.setItem('parkease_user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      }
    });
  }

  googleLogin(credential: string): Observable<AuthResponse> {
    // Decode the Google JWT to extract user info
    const payload = JSON.parse(atob(credential.split('.')[1]));
    const params = new URLSearchParams({
      subject: payload.sub,
      email: payload.email,
      fullName: payload.name || payload.email
    });
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/oauth/google?${params.toString()}`, {}
    ).pipe(
      tap(response => {
        localStorage.setItem('parkease_token', response.accessToken);
        localStorage.setItem('parkease_user', JSON.stringify({
          id: response.userId,
          email: response.email,
          role: response.role,
          fullName: payload.name
        }));
        this.currentUserSubject.next({
          id: response.userId,
          email: response.email,
          role: response.role as any,
          fullName: payload.name
        });
      })
    );
  }

  logout() {
    localStorage.removeItem('parkease_token');
    localStorage.removeItem('parkease_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('parkease_user');
    if (userStr) {
      try {
        this.currentUserSubject.next(JSON.parse(userStr));
      } catch {
        this.logout();
      }
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('parkease_token');
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  getToken(): string | null {
    return localStorage.getItem('parkease_token');
  }

  // Admin user management methods
  getUsersByRole(role?: string): Observable<any[]> {
    if (role) {
      return this.http.get<any[]>(`${this.apiUrl}/admin/users?role=${role}`);
    } else {
      // Get all users by fetching each role separately and combining
      return this.http.get<any[]>(`${this.apiUrl}/admin/users/drivers`);
    }
  }

  promoteToManager(userId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/users/${userId}/promote`, {});
  }

  demoteToDriver(userId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/users/${userId}/demote`, {});
  }

  setUserActive(userId: number, active: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/users/${userId}/active?active=${active}`, {});
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/${userId}`);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}`);
  }
}
