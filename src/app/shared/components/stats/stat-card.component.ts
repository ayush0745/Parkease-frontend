import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card group cursor-pointer" [ngClass]="cardClass">
      <!-- Icon -->
      <div class="flex items-center justify-between mb-4">
        <div 
          class="flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110"
          [ngClass]="iconBgClass"
        >
          <svg class="w-6 h-6" [ngClass]="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="iconPath"></path>
          </svg>
        </div>
        
        <!-- Trend Indicator -->
        <div *ngIf="trend" class="flex items-center space-x-1">
          <svg 
            class="w-4 h-4" 
            [ngClass]="trend > 0 ? 'text-accent-500' : 'text-red-500'"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              [attr.d]="trend > 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'"
            ></path>
          </svg>
          <span 
            class="text-xs font-semibold"
            [ngClass]="trend > 0 ? 'text-accent-500' : 'text-red-500'"
          >
            {{ Math.abs(trend) }}%
          </span>
        </div>
      </div>

      <!-- Value -->
      <div class="mb-2">
        <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          {{ prefix }}{{ animatedValue }}{{ suffix }}
        </div>
        <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ label }}
        </div>
      </div>

      <!-- Description -->
      <div *ngIf="description" class="text-xs text-gray-500 dark:text-gray-500">
        {{ description }}
      </div>

      <!-- Progress Bar -->
      <div *ngIf="progress !== undefined" class="mt-4">
        <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{{ progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
          <div 
            class="h-2 rounded-full transition-all duration-1000 ease-out"
            [ngClass]="progressBarClass"
            [style.width]="animatedProgress + '%'"
          ></div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-2xl">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    </div>
  `
})
export class StatCardComponent implements OnInit, OnDestroy {
  @Input() label: string = '';
  @Input() value: number | string = 0;
  @Input() prefix: string = '';
  @Input() suffix: string = '';
  @Input() icon: string = 'chart';
  @Input() color: 'primary' | 'accent' | 'success' | 'warning' | 'error' = 'primary';
  @Input() trend?: number; // Percentage change
  @Input() description?: string;
  @Input() progress?: number; // 0-100
  @Input() loading: boolean = false;
  @Input() animate: boolean = true;

  animatedValue: number | string = 0;
  animatedProgress: number = 0;
  private animationFrame?: number;

  // Make Math available in template
  Math = Math;

  ngOnInit() {
    if (this.animate && typeof this.value === 'number') {
      this.animateValue(0, this.value, 1500);
    } else {
      this.animatedValue = this.value;
    }

    if (this.progress !== undefined) {
      this.animateProgress(0, this.progress, 1000);
    }
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  get cardClass(): string {
    return 'relative overflow-hidden';
  }

  get iconBgClass(): string {
    const baseClass = 'transition-all duration-300';
    switch (this.color) {
      case 'primary':
        return `${baseClass} bg-primary-100 dark:bg-primary-900/20 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30`;
      case 'accent':
        return `${baseClass} bg-accent-100 dark:bg-accent-900/20 group-hover:bg-accent-200 dark:group-hover:bg-accent-900/30`;
      case 'success':
        return `${baseClass} bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-900/30`;
      case 'warning':
        return `${baseClass} bg-yellow-100 dark:bg-yellow-900/20 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/30`;
      case 'error':
        return `${baseClass} bg-red-100 dark:bg-red-900/20 group-hover:bg-red-200 dark:group-hover:bg-red-900/30`;
      default:
        return `${baseClass} bg-gray-100 dark:bg-gray-800`;
    }
  }

  get iconClass(): string {
    switch (this.color) {
      case 'primary':
        return 'text-primary-600 dark:text-primary-400';
      case 'accent':
        return 'text-accent-600 dark:text-accent-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  get progressBarClass(): string {
    switch (this.color) {
      case 'primary':
        return 'bg-gradient-to-r from-primary-500 to-primary-600';
      case 'accent':
        return 'bg-gradient-to-r from-accent-500 to-accent-600';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  }

  get iconPath(): string {
    const icons: { [key: string]: string } = {
      chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197v1a3 3 0 01-3 3h-3a3 3 0 01-3-3v-1m6 0a3 3 0 003-3V9a3 3 0 00-3-3h-3a3 3 0 00-3 3v9a3 3 0 003 3z',
      car: 'M19 7l-.867-12.142A2 2 0 0016.138 4H7.862a2 2 0 00-1.995 1.858L5 7m14 0v5a2 2 0 01-2 2v0a2 2 0 01-2-2v-5m4 0H5m0 0v5a2 2 0 002 2v0a2 2 0 002-2V7',
      money: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      parking: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      booking: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      trend: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
    };
    return icons[this.icon] || icons['chart'];
  }

  private animateValue(start: number, end: number, duration: number) {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.animatedValue = Math.floor(start + (end - start) * easeOut);
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animatedValue = end;
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  private animateProgress(start: number, end: number, duration: number) {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.animatedProgress = start + (end - start) * easeOut;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animatedProgress = end;
      }
    };
    
    requestAnimationFrame(animate);
  }
}