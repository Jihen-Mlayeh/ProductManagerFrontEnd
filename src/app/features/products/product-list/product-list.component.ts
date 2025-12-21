// ===== AJOUTER CES PROPRIÉTÉS ET MÉTHODES À VOTRE product-list.component.ts =====
// GARDEZ TOUT VOTRE CODE EXISTANT, ajoutez juste ces éléments

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator'; // ⬅️ AJOUTER CET IMPORT
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  // ===== VOS PROPRIÉTÉS EXISTANTES (gardez-les) =====
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  searchQuery = '';

  // ===== NOUVELLES PROPRIÉTÉS À AJOUTER =====
  paginatedProducts: Product[] = [];      // Produits de la page actuelle
  statusFilter = 'all';                   // Filtre de statut
  sortBy = 'name-asc';                    // Option de tri
  viewMode: 'grid' | 'list' = 'grid';     // Mode d'affichage
  
  // Pagination
  pageSize = 12;                          // Produits par page
  pageIndex = 0;                          // Page actuelle
  pageSizeOptions = [6, 12, 24, 48];      // Options de pagination

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ===== MODIFIER VOTRE MÉTHODE loadProducts() =====
  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applyFiltersAndSort(); // ⬅️ Changer cette ligne
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load products', 'Error');
        this.loading = false;
      }
    });
  }

  // ===== MODIFIER VOTRE MÉTHODE onSearch() =====
  onSearch(): void {
    this.pageIndex = 0; // Reset à la première page
    this.applyFiltersAndSort();
  }

  // ===== GARDER VOTRE onClearSearch() =====
  onClearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  // ===== GARDER VOTRE onAddProduct() =====
  onAddProduct(): void {
    this.router.navigate(['/products/new']);
  }

 onDeleteProduct(id: string): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You won\'t be able to revert this!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastr.success('Product deleted successfully', 'Success');

          // 1️⃣ supprimer du tableau principal
          this.products = this.products.filter(p => p.id !== id);

          // 2️⃣ recalcul filtres + pagination
          this.applyFiltersAndSort();

          // 3️⃣ sécurité paginator (éviter page vide)
          if (this.pageIndex > 0 && this.paginatedProducts.length === 0) {
            this.pageIndex--;
            this.applyFiltersAndSort();
          }
        },
        error: () => {
          this.toastr.error('Failed to delete product', 'Error');
        }
      });
    }
  });
}

trackById(index: number, product: any): string {
  return product.id;
}


  applyFiltersAndSort(): void {
    let filtered = [...this.products];

    // Appliquer la recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query)
      );
    }

    // Appliquer le filtre de statut
    switch (this.statusFilter) {
      case 'active':
        filtered = filtered.filter(p => !this.isProductExpired(p));
        break;
      case 'expired':
        filtered = filtered.filter(p => this.isProductExpired(p));
        break;
      case 'premium':
        filtered = filtered.filter(p => p.price > 1000);
        break;
    }

    // Appliquer le tri
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
    this.updatePaginatedProducts();
  }

  // Trier les produits
  sortProducts(products: Product[]): Product[] {
    switch (this.sortBy) {
      case 'name-asc':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return products.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return products.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return products.sort((a, b) => b.price - a.price);
      case 'date-asc':
        return products.sort((a, b) => 
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
      case 'date-desc':
        return products.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      default:
        return products;
    }
  }

  // Gérer le changement de filtre
  onFilterChange(): void {
    this.pageIndex = 0;
    this.applyFiltersAndSort();
  }

  // Gérer le changement de tri
  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  // Gérer le changement de page
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedProducts();
  }

  // Mettre à jour les produits paginés
  updatePaginatedProducts(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  // Obtenir l'index de début
  getStartIndex(): number {
    return this.filteredProducts.length === 0 ? 0 : (this.pageIndex * this.pageSize) + 1;
  }

  // Obtenir l'index de fin
  getEndIndex(): number {
    const end = (this.pageIndex + 1) * this.pageSize;
    return Math.min(end, this.filteredProducts.length);
  }

  // Changer le mode d'affichage
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Compter les produits premium
  getPremiumCount(): number {
    return this.products.filter(p => p.price > 1000).length;
  }

  // Compter les produits expirés
  getExpiredCount(): number {
    return this.products.filter(p => this.isProductExpired(p)).length;
  }

  // Calculer la valeur totale
  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + p.price, 0);
  }

  // Vérifier si un produit est expiré
  isProductExpired(product: Product): boolean {
    if (!product.expirationDate) return false;
    return new Date(product.expirationDate) < new Date();
  }
}