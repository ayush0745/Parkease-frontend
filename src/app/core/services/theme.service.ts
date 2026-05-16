import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'parkease-theme';
  
  // Reactive theme signal
  theme = signal<Theme>(this.getStoredTheme());
  
  // Computed dark mode state
  isDarkMode = signal(false);

  constructor() {
    // Effect to apply theme changes
    effect(() => {
      this.applyTheme(this.theme());
    });

    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
          if (this.theme() === 'system') {
            this.applyTheme('system');
          }
        });
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    const currentTheme = this.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const isDark = this.shouldUseDarkMode(theme);
    
    this.isDarkMode.set(isDark);
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  private shouldUseDarkMode(theme: Theme): boolean {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // System theme
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return false;
  }

  getThemeIcon(): string {
    const theme = this.theme();
    switch (theme) {
      case 'light': return 'sun';
      case 'dark': return 'moon';
      case 'system': return 'monitor';
      default: return 'monitor';
    }
  }

  getNextTheme(): Theme {
    const current = this.theme();
    switch (current) {
      case 'light': return 'dark';
      case 'dark': return 'system';
      case 'system': return 'light';
      default: return 'light';
    }
  }
}