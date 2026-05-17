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
      <section class="relative py-24 px-6 text-center overflow-hidden">
        <div class="max-w-5xl mx-auto animate-fade-in-up">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-8">
            <span class="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
            <span class="text-xs font-semibold text-primary-700 tracking-wide uppercase">Next-Gen Parking Platform</span>
          </div>

          <h1 class="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-none">
            Smart Parking Made <span class="gradient-text">Effortless</span>
          </h1>

          <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Find, book, and pay for parking spots instantly. Join thousands of drivers who save time and money with ParkEase.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a routerLink="/register" class="btn-primary w-full sm:w-auto text-base py-4 px-8 shadow-lg shadow-primary-500/20">
              Get Started Free
            </a>
            <a routerLink="/login" class="btn-secondary w-full sm:w-auto text-base py-4 px-8">
              Sign In
            </a>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 pt-12 border-t border-gray-100">
            <div>
              <div class="text-4xl font-extrabold text-gray-900">10k+</div>
              <div class="text-sm font-medium text-gray-500 mt-1">Active Drivers</div>
            </div>
            <div>
              <div class="text-4xl font-extrabold text-gray-900">500+</div>
              <div class="text-sm font-medium text-gray-500 mt-1">Parking Lots</div>
            </div>
            <div class="col-span-2 md:col-span-1">
              <div class="text-4xl font-extrabold text-gray-900">99.9%</div>
              <div class="text-sm font-medium text-gray-500 mt-1">Platform Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-24 bg-white border-y border-gray-100">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">Why Choose ParkEase?</h2>
            <p class="text-lg text-gray-500">Everything you need for a seamless parking experience.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="card hover:-translate-y-1 transition-all duration-300">
              <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl mb-6">🔍</div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Find Parking Instantly</h3>
              <p class="text-gray-600 leading-relaxed">Search and discover available parking spots near your destination in real-time.</p>
            </div>

            <div class="card hover:-translate-y-1 transition-all duration-300">
              <div class="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center text-2xl mb-6">📱</div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Book & Pay Online</h3>
              <p class="text-gray-600 leading-relaxed">Reserve your spot and pay securely through our platform. No cash needed.</p>
            </div>

            <div class="card hover:-translate-y-1 transition-all duration-300">
              <div class="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-2xl mb-6">💰</div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">Save Time & Money</h3>
              <p class="text-gray-600 leading-relaxed">Compare prices and avoid parking fines. Get the best deals in your area.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 bg-gradient-to-r from-primary-600 to-indigo-700 text-white relative overflow-hidden">
        <div class="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 class="text-3xl lg:text-5xl font-extrabold mb-6 tracking-tight">Ready to Transform Your Parking Experience?</h2>
          <p class="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of satisfied users who never worry about parking again.</p>
          <a routerLink="/register" class="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-xl text-base font-bold hover:bg-gray-50 transition-all shadow-xl hover:scale-105 duration-200">
            Start Your Free Account
          </a>
        </div>
      </section>
    </div>
  `
})
export class LandingComponent {}