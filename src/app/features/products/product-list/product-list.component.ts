import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  loading = false;
  searchQuery = '';
  statusFilter = 'all';
  sortBy = 'name-asc';
  viewMode: 'grid' | 'list' = 'grid';
  
  pageSize = 12;
  pageIndex = 0;
  pageSizeOptions = [6, 12, 24, 48];

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('📦 Products loaded:', products);
        this.products = products;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
        this.toastr.error('Failed to load products', 'Error');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.applyFiltersAndSort();
  }

  onClearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  onAddProduct(): void {
    this.router.navigate(['/products/new']);
  }

  onDeleteProduct(id: string): void {
    console.log('🗑️ Delete request for product:', id);
    
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('✅ Deletion confirmed, calling service...');
        
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            console.log('✅ Product deleted successfully');
            
            // Supprimer du tableau
            const initialLength = this.products.length;
            this.products = this.products.filter(p => {
              const productId = p.id || p._id;
              return productId !== id;
            });
            
            console.log(`📊 Products before: ${initialLength}, after: ${this.products.length}`);
            
            // Recalculer
            this.applyFiltersAndSort();
            
            // Ajuster la page si nécessaire
            if (this.pageIndex > 0 && this.paginatedProducts.length === 0) {
              this.pageIndex--;
              this.applyFiltersAndSort();
            }
            
            this.toastr.success('Product deleted successfully', 'Success');
          },
          error: (error) => {
            console.error('❌ Delete failed:', error);
            this.toastr.error('Failed to delete product', 'Error');
          }
        });
      }
    });
  }

  trackById(index: number, product: Product): string {
    return product.id || product._id || index.toString();
  }

  applyFiltersAndSort(): void {
    console.log('🔄 Applying filters and sort...');
    let filtered = [...this.products];

    // Recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query)
      );
    }

    // Filtre de statut
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

    // Tri
    filtered = this.sortProducts(filtered);

    this.filteredProducts = filtered;
    console.log(`📊 Filtered products: ${filtered.length}`);
    
    this.updatePaginatedProducts();
  }

  // ✅ CORRECTION: Enlever les cases dupliqués
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

  onFilterChange(): void {
    this.pageIndex = 0;
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedProducts();
  }

  updatePaginatedProducts(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
    console.log(`📄 Paginated products: ${this.paginatedProducts.length} (page ${this.pageIndex + 1})`);
  }

  getStartIndex(): number {
    return this.filteredProducts.length === 0 ? 0 : (this.pageIndex * this.pageSize) + 1;
  }

  getEndIndex(): number {
    const end = (this.pageIndex + 1) * this.pageSize;
    return Math.min(end, this.filteredProducts.length);
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  getPremiumCount(): number {
    return this.products.filter(p => p.price > 1000).length;
  }

  getExpiredCount(): number {
    return this.products.filter(p => this.isProductExpired(p)).length;
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + p.price, 0);
  }

  isProductExpired(product: Product): boolean {
    if (!product.expirationDate) return false;
    return new Date(product.expirationDate) < new Date();
  }
}