import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
    return this.http.get<Product[]>(this.API_URL).pipe(
      tap(products => console.log('Products fetched:', products.length)),
      catchError(this.handleError)
    );
  }

  /**
   * Obtenir un produit par ID
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`).pipe(
      tap(product => console.log('Product fetched:', product)),
      catchError(this.handleError)
    );
  }

  /**
   * Créer un nouveau produit
   */
  createProduct(product: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product).pipe(
      tap(newProduct => console.log('Product created:', newProduct)),
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour un produit
   */
  updateProduct(id: number, product: ProductUpdateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, product).pipe(
      tap(updatedProduct => console.log('Product updated:', updatedProduct)),
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer un produit
   */
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => console.log('Product deleted:', id)),
      catchError(this.handleError)
    );
  }

  /**
   * Rechercher des produits par nom
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.getAllProducts().pipe(
      tap(products => {
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase())
        );
        console.log('Search results:', filtered.length);
      })
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