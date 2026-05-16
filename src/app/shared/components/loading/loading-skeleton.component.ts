import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="containerClass">
      <ng-container [ngSwitch]="type">
        
        <!-- Card Skeleton -->
        <div *ngSwitchCase="'card'" class="premium-card p-6 animate-pulse">
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-12 h-12 bg-gray-200 dark:bg-dark-700 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/2"></div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded"></div>
            <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-4/6"></div>
          </div>
        </div>

        <!-- Table Skeleton -->
        <div *ngSwitchCase="'table'" class="table-premium animate-pulse">
          <div class="table-header">
            <div class="flex space-x-4">
              <div class="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
              <div class="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
              <div class="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
              <div class="h-4 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
            </div>
          </div>
          <div class="divide-y divide-gray-200 dark:divide-dark-700">
            <div *ngFor="let item of [1,2,3,4,5]" class="table-cell">
              <div class="flex space-x-4">
                <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart Skeleton -->
        <div *ngSwitchCase="'chart'" class="premium-card p-6 animate-pulse">
          <div class="h-6 bg-gray-200 dark:bg-dark-700 rounded w-1/3 mb-6"></div>
          <div class="h-64 bg-gray-200 dark:bg-dark-700 rounded"></div>
        </div>

        <!-- List Skeleton -->
        <div *ngSwitchCase="'list'" class="space-y-4 animate-pulse">
          <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-4 p-4 premium-card">
            <div class="w-10 h-10 bg-gray-200 dark:bg-dark-700 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/2"></div>
            </div>
            <div class="h-8 bg-gray-200 dark:bg-dark-700 rounded w-20"></div>
          </div>
        </div>

        <!-- Stats Skeleton -->
        <div *ngSwitchCase="'stats'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          <div *ngFor="let item of [1,2,3,4]" class="stat-card">
            <div class="h-8 bg-gray-200 dark:bg-dark-700 rounded w-16 mx-auto mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded w-24 mx-auto"></div>
          </div>
        </div>

        <!-- Text Skeleton -->
        <div *ngSwitchCase="'text'" class="space-y-3 animate-pulse">
          <div *ngFor="let line of textLines" 
               class="h-4 bg-gray-200 dark:bg-dark-700 rounded"
               [style.width]="line + '%'">
          </div>
        </div>

        <!-- Custom Skeleton -->
        <div *ngSwitchDefault class="animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-dark-700 rounded" [style.width]="width" [style.height]="height"></div>
        </div>

      </ng-container>
    </div>
  `
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'table' | 'chart' | 'list' | 'stats' | 'text' | 'custom' = 'custom';
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() lines: number = 3;
  @Input() containerClass: string = '';

  get textLines(): number[] {
    const widths = [];
    for (let i = 0; i < this.lines; i++) {
      // Generate random widths between 60% and 100%
      widths.push(Math.floor(Math.random() * 40) + 60);
    }
    return widths;
  }
}