import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);

  private apiUrl = 'http://127.0.0.1:8000/api/login_check';

  login(credentials: any) {
    return this.http.post<{ token: string }>(this.apiUrl, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  getDecodedToken(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  isAdmin(): boolean {
    const tokenData = this.getDecodedToken();
    if (tokenData && tokenData.roles) {
      return tokenData.roles.includes('ROLE_ADMIN');
    }
    return false;
  }
  getUserFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        
        return {
          email: decoded.username || decoded.sub,
          roles: decoded.roles,

          nom: (decoded.username || decoded.sub).split('@')[0],
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  changePassword(data: any) {

    return this.http.post('http://127.0.0.1:8000/api/change-password', data);
  }
}
