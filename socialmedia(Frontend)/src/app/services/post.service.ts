import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

getPosts(currentUserId: number) {
  return this.http.get<any[]>(`${this.apiUrl}?currentUserId=${currentUserId}`);
}

createPost(data: FormData) {
  return this.http.post<any>(this.apiUrl, data);
}

  toggleLike(postId: number) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return this.http.post(`${this.apiUrl}/${postId}/like`, {
    userId: currentUser.id
  });
}

  addComment(postId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${postId}/comments`, data);
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${postId}`);
  }
  updatePost(postId: number, data: any) {
  return this.http.put<any>(`${this.apiUrl}/${postId}`, data);
}

}