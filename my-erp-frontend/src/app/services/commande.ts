import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommandeService {
  private apiUrl = 'http://127.0.0.1:8000/api/custom/commandes';

  constructor(private http: HttpClient) {}


  createCommande(data: any):Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
  validerCommande(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/valider`, {});
  }


  getCommandes(type:string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}?type=${type}`);
  }
}
