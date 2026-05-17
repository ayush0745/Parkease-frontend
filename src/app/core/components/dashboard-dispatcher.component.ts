import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-dispatcher',
  standalone: true,
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  `
})
export class DashboardDispatcherComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Redirect based on user role
        switch (user.role) {
          case 'DRIVER':
            this.router.navigate(['/driver/dashboard']);
            break;
          case 'MANAGER':
            this.router.navigate(['/manager/dashboard']);
            break;
          case 'ADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;
          default:
            this.router.navigate(['/login']);
        }
      } else if (!this.authService.getToken()) {
        // Only redirect to login if we definitely have no token
        this.router.navigate(['/login']);
      }
    });
  }
}