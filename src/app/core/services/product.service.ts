import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Product, ProductCreateRequest, ProductUpdateRequest } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Mapper centralisé: _id → id
   */
  private mapProduct(p: any): Product {
    return {
      ...p,
      id: p._id || p.id,  // ✅ Support _id ET id
      _id: p._id          // ✅ Garde aussi _id
    };
  }

  /**
   * Obtenir tous les produits
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map(products => products.map(p => this.mapProduct(p))),
      tap(products => console.log('✅ Products fetched:', products.length)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir un produit par ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(p => this.mapProduct(p)),
      tap(product => console.log('✅ Product fetched:', product)),
      catchError(this.handleError)
    );
  }

  /**
   * Créer un nouveau produit
   */
  createProduct(product: ProductCreateRequest): Observable<Product> {
    console.log('📤 Creating product:', product);
    return this.http.post<any>(this.API_URL, product).pipe(
      map(p => this.mapProduct(p)),
      tap(created => console.log('✅ Product created:', created)),
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour un produit
   */
  updateProduct(id: string, product: ProductUpdateRequest): Observable<Product> {
    console.log('📤 Updating product:', id, product);
    return this.http.put<any>(`${this.API_URL}/${id}`, product).pipe(
      map(p => this.mapProduct(p)),
      tap(updated => console.log('✅ Product updated:', updated)),
      catchError(this.handleError)
    );
  }

  /**
 * Supprimer un produit
 */
deleteProduct(id: string): Observable<void> {
  return this.http.delete(`${this.API_URL}/${id}`, { 
    responseType: 'text' as 'json'  // ✅ Accepte du texte au lieu de JSON
  }).pipe(
    map(() => undefined),  // ✅ Convertit en void
    tap(() => console.log('✅ Product deleted:', id)),
    catchError(this.handleError)
  );
}

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('❌ An error occurred:', error);
    
    let errorMessage = 'Server error';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
  
}