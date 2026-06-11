import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5293/api/Auth';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

getCurrentUser(): any {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

  getCurrentUserId(): number {
    const user = this.getCurrentUser();
    return user ? user.id : 1;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }
}