import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col" style="background: linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f0f9ff 100%);">

      <!-- ── Navbar ──────────────────────────────── -->
      <header style="background: rgba(255,255,255,0.82); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(148,163,184,0.12); position: sticky; top:0; z-index:40;">
        <div class="max-w-6xl mx-auto px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">

            <!-- Logo -->
            <a routerLink="/" class="flex items-center gap-2.5 no-underline group">
              <div style="width:36px; height:36px; background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow: 0 4px 12px rgba(79,70,229,0.3); transition: transform 200ms, box-shadow 200ms;" class="group-hover:scale-105">
                <span style="color:white; font-size:18px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif; letter-spacing:-1px;">P</span>
              </div>
              <span style="font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:1.2rem; background: linear-gradient(135deg, #4f46e5, #6366f1); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; letter-spacing:-0.03em;">ParkEase</span>
            </a>

            <!-- Nav Links -->
            <nav class="flex items-center gap-2">
              <a routerLink="/login"
                 style="padding: 0.5rem 1rem; font-size:0.875rem; font-weight:500; color:#475569; border-radius:8px; transition: all 200ms; text-decoration:none;"
                 onmouseover="this.style.background='#eef2ff'; this.style.color='#4f46e5';"
                 onmouseout="this.style.background='transparent'; this.style.color='#475569';">
                Sign in
              </a>
              <a routerLink="/register" class="btn-primary" style="padding: 0.5rem 1.25rem; font-size:0.875rem;">
                Get Started
              </a>
            </nav>

          </div>
        </div>
      </header>

      <!-- ── Main Content ─────────────────────────── -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- ── Footer ──────────────────────────────── -->
      <footer style="background: rgba(255,255,255,0.7); border-top: 1px solid rgba(148,163,184,0.12); padding: 1.75rem 0;">
        <div class="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span style="font-size:0.8rem; color:#94a3b8;">© 2025 ParkEase. All rights reserved.</span>
          <div class="flex items-center gap-4">
            <span style="font-size:0.8rem; color:#94a3b8;">Smart Parking, Simplified.</span>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class GuestLayoutComponent {}