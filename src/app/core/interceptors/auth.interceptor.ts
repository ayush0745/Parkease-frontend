import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('parkease_token');
  const userStr = localStorage.getItem('parkease_user');

  if (token) {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) headers['X-User-Id'] = String(user.id);
        if (user.role) headers['X-User-Role'] = user.role;
      } catch {}
    }

    return next(req.clone({ setHeaders: headers }));
  }

  return next(req);
};
