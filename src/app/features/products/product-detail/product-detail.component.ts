import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  productId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      this.loadProduct();
    });
  }

  loadProduct(): void {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Product not found', 'Error');
        this.loading = false;
        this.router.navigate(['/products']);
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/products', this.productId, 'edit']);
  }

  onDelete(): void {
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
        this.productService.deleteProduct(this.productId).subscribe({
          next: () => {
            this.toastr.success('Product deleted successfully', 'Success');
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.toastr.error('Failed to delete product', 'Error');
          }
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/products']);
  }

  isExpired(): boolean {
    if (!this.product?.expirationDate) return false;
    return new Date(this.product.expirationDate) < new Date();
  }
}