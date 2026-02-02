import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.models';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/users';


  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }


  create(user: User): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }


  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
