import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen">
      <!-- Hero Section -->
      <section class="relative py-20 px-4">
        <div class="max-w-7xl mx-auto text-center">
          <h1 class="text-5xl font-bold text-gray-900 mb-6">
            Smart Parking Made <span class="text-blue-600">Simple</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find, book, and pay for parking spots instantly. Join thousands of drivers who save time and money with ParkEase.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/register" class="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started Free
            </a>
            <a routerLink="/login" class="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors">
              Sign In
            </a>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose ParkEase?</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center p-6">
              <div class="text-4xl mb-4">🔍</div>
              <h3 class="text-xl font-semibold mb-3">Find Parking Instantly</h3>
              <p class="text-gray-600">Search and discover available parking spots near your destination in real-time.</p>
            </div>
            <div class="text-center p-6">
              <div class="text-4xl mb-4">📱</div>
              <h3 class="text-xl font-semibold mb-3">Book & Pay Online</h3>
              <p class="text-gray-600">Reserve your spot and pay securely through our platform. No cash needed.</p>
            </div>
            <div class="text-center p-6">
              <div class="text-4xl mb-4">💰</div>
              <h3 class="text-xl font-semibold mb-3">Save Time & Money</h3>
              <p class="text-gray-600">Compare prices and avoid parking fines. Get the best deals in your area.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 bg-blue-600">
        <div class="max-w-4xl mx-auto text-center px-4">
          <h2 class="text-3xl font-bold text-white mb-6">Ready to Transform Your Parking Experience?</h2>
          <p class="text-xl text-blue-100 mb-8">Join thousands of satisfied users who never worry about parking again.</p>
          <a routerLink="/register" class="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Your Free Account
          </a>
        </div>
      </section>
    </div>
  `
})
export class LandingComponent {}