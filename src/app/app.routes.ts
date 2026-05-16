import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { GuestLayoutComponent } from './shared/layouts/guest-layout/guest-layout.component';
import { DashboardLayoutComponent } from './shared/layouts/dashboard-layout/dashboard-layout.component';

export const routes: Routes = [
  // Public Routes using Guest Layout
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./core/components/dashboard-dispatcher.component').then(m => m.DashboardDispatcherComponent),
        canActivate: [authGuard]
      },
      {
        path: 'lots',
        loadComponent: () => import('./core/components/dashboard-dispatcher.component').then(m => m.DashboardDispatcherComponent),
        canActivate: [authGuard]
      },
      {
        path: 'bookings',
        loadComponent: () => import('./core/components/dashboard-dispatcher.component').then(m => m.DashboardDispatcherComponent),
        canActivate: [authGuard]
      }
    ]
  },

  // Driver Routes
  {
    path: 'driver',
    component: DashboardLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'DRIVER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/driver/dashboard/driver-dashboard.component').then(m => m.DriverDashboardComponent)
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./features/driver/vehicles/vehicle-list.component').then(m => m.VehicleListComponent)
      },
      {
        path: 'search',
        loadComponent: () => import('./features/driver/search/parking-search.component').then(m => m.ParkingSearchComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/driver/bookings/booking-history.component').then(m => m.BookingHistoryComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/payments/payment-history.component').then(m => m.PaymentHistoryComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },

  // Manager Routes
  {
    path: 'manager',
    component: DashboardLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'MANAGER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/manager/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'lots',
        loadComponent: () => import('./features/manager/lots/lot-management.component').then(m => m.LotManagementComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/driver/bookings/booking-history.component').then(m => m.BookingHistoryComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/manager/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'approvals',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/' }
];
