import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5293/api/users';

  constructor(private http: HttpClient) {}

  getUsers(currentUserId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?currentUserId=${currentUserId}`);
  }

  updateUser(id: number, data: any) {
  return this.http.put(`http://localhost:5293/api/Users/${id}`, data);
}

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  followUser(followingId: number, followerId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${followingId}/follow`, {
      followerId
    });
  }
}