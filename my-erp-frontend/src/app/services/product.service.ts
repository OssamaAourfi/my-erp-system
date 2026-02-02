import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // 👇 HNA: T-2akked mn l-lien wach s7i7.
  // Ila knti khddam b API Platform ra ghaliban: '/api/produits'
  // Ila knti dayr controller personnel: '/api/custom/products'
  // Jarrb hadi dyal API Platform hiya l-lowla:
  private apiUrl = 'http://127.0.0.1:8000/api/produits';

  constructor(private http: HttpClient) {}

  // Jib ga3 les produits
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Jib produit wa7d (b l-ID) - nqdru n7tajuh mn b3d
  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
