import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="toggleDropdown()"
        class="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 group"
        [class.bg-white/20]="isDropdownOpen"
      >
        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors" 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <ng-container [ngSwitch]="themeService.getThemeIcon()">
            <!-- Sun Icon -->
            <g *ngSwitchCase="'sun'">
              <circle cx="12" cy="12" r="5"></circle>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
            </g>
            <!-- Moon Icon -->
            <path *ngSwitchCase="'moon'" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            <!-- Monitor Icon -->
            <g *ngSwitchCase="'monitor'">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </g>
          </ng-container>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div
        *ngIf="isDropdownOpen"
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-premium border border-gray-200 dark:border-dark-700 py-2 z-50 animate-scale-in"
        (clickOutside)="closeDropdown()"
      >
        <button
          *ngFor="let option of themeOptions"
          (click)="selectTheme(option.value)"
          class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          [class.bg-primary-50]="themeService.theme() === option.value"
          [class.text-primary-600]="themeService.theme() === option.value"
          [class.dark:bg-primary-900/20]="themeService.theme() === option.value"
          [class.dark:text-primary-400]="themeService.theme() === option.value"
        >
          <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <ng-container [ngSwitch]="option.icon">
              <!-- Sun Icon -->
              <g *ngSwitchCase="'sun'">
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
              </g>
              <!-- Moon Icon -->
              <path *ngSwitchCase="'moon'" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              <!-- Monitor Icon -->
              <g *ngSwitchCase="'monitor'">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </g>
            </ng-container>
          </svg>
          {{ option.label }}
          <svg
            *ngIf="themeService.theme() === option.value"
            class="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      </div>
    </div>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  isDropdownOpen = false;

  themeOptions = [
    { value: 'light' as const, label: 'Light', icon: 'sun' },
    { value: 'dark' as const, label: 'Dark', icon: 'moon' },
    { value: 'system' as const, label: 'System', icon: 'monitor' }
  ];

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  selectTheme(theme: 'light' | 'dark' | 'system'): void {
    this.themeService.setTheme(theme);
    this.closeDropdown();
  }
}