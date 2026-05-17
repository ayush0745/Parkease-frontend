import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, forkJoin, merge, scan, map as rxMap } from 'rxjs';
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

  fetchProfile(): Observable<any> {
    const token = this.getToken();
    if (!token) return new Observable();

    const request = this.http.get<any>(`${this.apiUrl}/profile`);
    request.subscribe({
      next: (profile) => {
        const user = this.currentUserValue;
        if (user) {
          const updatedUser = { ...user, fullName: profile.fullName };
          localStorage.setItem('parkease_user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      }
    });
    return request;
  }

  updateProfile(data: { fullName: string, email: string, phone?: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data).pipe(
      tap((profile: any) => {
        const user = this.currentUserValue;
        if (user) {
          const updatedUser = { ...user, fullName: profile.fullName, email: profile.email };
          localStorage.setItem('parkease_user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/password`, data, { responseType: 'text' });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email }, { responseType: 'text' });
  }

  resetPassword(data: { token: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data, { responseType: 'text' });
  }

  googleLogin(credential: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/oauth/google`, { credential }
    ).pipe(
      tap(response => {
        localStorage.setItem('parkease_token', response.accessToken);
        localStorage.setItem('parkease_user', JSON.stringify({
          id: response.userId,
          email: response.email,
          role: response.role,
          fullName: response.fullName || response.email
        }));
        this.currentUserSubject.next({
          id: response.userId,
          email: response.email,
          role: response.role as any,
          fullName: response.fullName || response.email
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
      // Fetch each role and combine them incrementally for better perceived performance
      const roles = ['DRIVER', 'MANAGER', 'ADMIN'];
      const requests = roles.map(r => 
        this.http.get<any[]>(`${this.apiUrl}/admin/users?role=${r}`)
      );
      
      return merge(...requests).pipe(
        scan((acc, curr) => [...acc, ...curr], [] as any[])
      );
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
