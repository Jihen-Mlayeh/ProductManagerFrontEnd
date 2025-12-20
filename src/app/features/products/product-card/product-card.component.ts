import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() deleteProduct = new EventEmitter<number>();

  constructor(private router: Router) {}

  onViewDetails(): void {
    this.router.navigate(['/products', this.product.id]);
  }

  onEdit(): void {
    this.router.navigate(['/products', this.product.id, 'edit']);
  }

  onDelete(): void {
    if (this.product.id) {
      this.deleteProduct.emit(this.product.id);
    }
  }

  isExpired(): boolean {
    if (!this.product.expirationDate) return false;
    return new Date(this.product.expirationDate) < new Date();
  }
}