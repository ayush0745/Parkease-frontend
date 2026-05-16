import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

declare var ApexCharts: any;

export interface ChartData {
  series: any[];
  categories?: string[];
  colors?: string[];
  title?: string;
  subtitle?: string;
}

@Component({
  selector: 'app-premium-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="premium-card p-6">
      <div *ngIf="title || subtitle" class="mb-6">
        <h3 *ngIf="title" class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {{ title }}
        </h3>
        <p *ngIf="subtitle" class="text-sm text-gray-600 dark:text-gray-400">
          {{ subtitle }}
        </p>
      </div>
      
      <div class="relative">
        <div 
          #chartContainer 
          [id]="chartId"
          class="w-full"
          [style.height]="height"
        ></div>
        
        <!-- Loading State -->
        <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl">
          <div class="flex flex-col items-center space-y-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">Loading chart...</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PremiumChartComponent implements OnInit, OnDestroy {
  @Input() type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'heatmap' = 'line';
  @Input() data: ChartData = { series: [] };
  @Input() height: string = '350px';
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() loading: boolean = false;

  private themeService = inject(ThemeService);
  private chart: any;
  chartId = `chart-${Math.random().toString(36).substr(2, 9)}`;

  ngOnInit() {
    this.loadApexCharts().then(() => {
      this.initChart();
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private async loadApexCharts() {
    if (typeof ApexCharts === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@latest';
      document.head.appendChild(script);
      
      return new Promise((resolve) => {
        script.onload = resolve;
      });
    }
    return Promise.resolve();
  }

  private initChart() {
    const isDark = this.themeService.isDarkMode();
    
    const options = {
      series: this.data.series,
      chart: {
        type: this.type,
        height: parseInt(this.height),
        fontFamily: 'Inter, system-ui, sans-serif',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: false,
            reset: true
          }
        },
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      colors: this.data.colors || this.getDefaultColors(),
      theme: {
        mode: isDark ? 'dark' : 'light',
        palette: 'palette1'
      },
      grid: {
        borderColor: isDark ? '#374151' : '#e5e7eb',
        strokeDashArray: 3,
        xaxis: {
          lines: { show: false }
        },
        yaxis: {
          lines: { show: true }
        }
      },
      xaxis: {
        categories: this.data.categories,
        labels: {
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '12px'
          }
        },
        axisBorder: {
          color: isDark ? '#374151' : '#e5e7eb'
        },
        axisTicks: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: isDark ? '#9ca3af' : '#6b7280',
            fontSize: '12px'
          }
        }
      },
      legend: {
        labels: {
          colors: isDark ? '#d1d5db' : '#374151'
        }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        style: {
          fontSize: '12px'
        }
      },
      ...this.getTypeSpecificOptions()
    };

    this.chart = new ApexCharts(document.querySelector(`#${this.chartId}`), options);
    this.chart.render();
  }

  private getDefaultColors(): string[] {
    return [
      '#3b82f6', // Primary blue
      '#10b981', // Accent green
      '#06b6d4', // Cyan
      '#8b5cf6', // Purple
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#84cc16', // Lime
      '#ec4899'  // Pink
    ];
  }

  private getTypeSpecificOptions(): any {
    switch (this.type) {
      case 'area':
        return {
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.1,
              stops: [0, 90, 100]
            }
          },
          stroke: {
            curve: 'smooth',
            width: 3
          }
        };
      
      case 'line':
        return {
          stroke: {
            curve: 'smooth',
            width: 3
          },
          markers: {
            size: 5,
            strokeWidth: 2,
            hover: {
              size: 7
            }
          }
        };
      
      case 'bar':
        return {
          plotOptions: {
            bar: {
              borderRadius: 8,
              columnWidth: '60%',
              distributed: false
            }
          }
        };
      
      case 'pie':
      case 'donut':
        return {
          plotOptions: {
            pie: {
              donut: {
                size: this.type === 'donut' ? '70%' : '0%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    fontSize: '16px',
                    fontWeight: 600
                  }
                }
              }
            }
          },
          dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`
          }
        };
      
      case 'radialBar':
        return {
          plotOptions: {
            radialBar: {
              hollow: {
                size: '70%'
              },
              dataLabels: {
                show: true,
                name: {
                  fontSize: '16px',
                  fontWeight: 600
                },
                value: {
                  fontSize: '24px',
                  fontWeight: 700,
                  formatter: (val: number) => `${val}%`
                }
              }
            }
          }
        };
      
      default:
        return {};
    }
  }

  updateChart(newData: ChartData) {
    this.data = newData;
    if (this.chart) {
      this.chart.updateSeries(newData.series);
      if (newData.categories) {
        this.chart.updateOptions({
          xaxis: { categories: newData.categories }
        });
      }
    }
  }
}