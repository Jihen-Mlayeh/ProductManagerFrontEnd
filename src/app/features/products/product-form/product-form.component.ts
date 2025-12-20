import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  loading = false;
  isEditMode = false;
  productId: number | null = null;
  minDate = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct();
      }
    });
  }

  initForm(): void {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      expirationDate: ['']
    });
  }

  loadProduct(): void {
    if (this.productId) {
      this.loading = true;
      this.productService.getProductById(this.productId).subscribe({
        next: (product) => {
          this.productForm.patchValue({
            name: product.name,
            price: product.price,
            expirationDate: product.expirationDate
          });
          this.loading = false;
        },
        error: (error) => {
          this.toastr.error('Product not found', 'Error');
          this.loading = false;
          this.router.navigate(['/products']);
        }
      });
    }
  }

  get f() {
    return this.productForm.controls;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.loading = true;
    const productData = this.productForm.value;

    if (this.isEditMode && this.productId) {
      // Update existing product
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (product) => {
          this.toastr.success('Product updated successfully', 'Success');
          this.router.navigate(['/products', this.productId]);
        },
        error: (error) => {
          this.toastr.error('Failed to update product', 'Error');
          this.loading = false;
        }
      });
    } else {
      // Create new product
      this.productService.createProduct(productData).subscribe({
        next: (product) => {
          this.toastr.success('Product created successfully', 'Success');
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.toastr.error('Failed to create product', 'Error');
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode && this.productId) {
      this.router.navigate(['/products', this.productId]);
    } else {
      this.router.navigate(['/products']);
    }
  }
}