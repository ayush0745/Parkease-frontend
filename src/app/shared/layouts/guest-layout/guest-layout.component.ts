import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <!-- Header -->
      <header class="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <a routerLink="/" class="text-2xl font-bold text-blue-600">
                🅿️ ParkEase
              </a>
            </div>
            <nav class="flex items-center space-x-4">
              <a routerLink="/login" class="text-gray-600 hover:text-blue-600 font-medium">Sign In</a>
              <a routerLink="/register" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main>
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white/80 backdrop-blur-sm border-t border-white/20 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="text-center text-gray-600">
            <p>&copy; 2024 ParkEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class GuestLayoutComponent {}