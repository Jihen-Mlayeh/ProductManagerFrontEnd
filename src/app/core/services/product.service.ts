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
   * Obtenir tous les produits
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      map(products =>
        products.map(p => ({
          ...p,
          id: p.id ?? p._id   // ✅ NORMALISATION ICI
        }))
      ),
      tap(products => console.log('Products fetched:', products.length)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir un produit par ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<any>(`${this.API_URL}/${id}`).pipe(
      map(p => ({
        ...p,
        id: p.id ?? p._id   // ✅ COHÉRENCE
      })),
      tap(product => console.log('Product fetched:', product)),
      catchError(this.handleError)
    );
  }

  /**
   * Créer un nouveau produit
   */
  createProduct(product: ProductCreateRequest): Observable<Product> {
    return this.http.post<any>(this.API_URL, product).pipe(
      map(p => ({
        ...p,
        id: p.id ?? p._id   // ✅ IMPORTANT POUR LE FRONT
      })),
      tap(newProduct => console.log('Product created:', newProduct)),
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour un produit
   */
  updateProduct(id: string, product: ProductUpdateRequest): Observable<Product> {
    return this.http.put<any>(`${this.API_URL}/${id}`, product).pipe(
      map(p => ({
        ...p,
        id: p.id ?? p._id
      })),
      tap(updatedProduct => console.log('Product updated:', updatedProduct)),
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer un produit
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => console.log('Product deleted:', id)),
      catchError(this.handleError)
    );
  }

  /**
   * Rechercher des produits par nom
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products =>
        products.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase())
        )
      ),
      tap(filtered => console.log('Search results:', filtered.length))
    );
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
