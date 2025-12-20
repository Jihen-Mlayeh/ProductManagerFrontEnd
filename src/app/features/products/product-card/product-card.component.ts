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
  getProductIcon(): string {
  // Map product names to appropriate Material icons
  const name = this.product.name.toLowerCase();
  
  if (name.includes('keyboard')) return 'keyboard';
  if (name.includes('mouse')) return 'mouse';
  if (name.includes('monitor')) return 'monitor';
  if (name.includes('webcam') || name.includes('camera')) return 'videocam';
  if (name.includes('lamp') || name.includes('light')) return 'light_mode';
  if (name.includes('usb') || name.includes('hub')) return 'usb';
  if (name.includes('headphone') || name.includes('audio')) return 'headphones';
  if (name.includes('ipad') || name.includes('tablet')) return 'tablet';
  if (name.includes('macbook') || name.includes('laptop')) return 'laptop_mac';
  
  return 'inventory_2'; // Default icon
}

isPremium(): boolean {
  return this.product.price > 1000;
}

getStatusLabel(): string {
  if (this.isExpired()) return 'Expired';
  if (this.isPremium()) return 'Premium';
  return 'Active';
}

getDecimals(): string {
  const decimals = (this.product.price % 1).toFixed(2).substring(2);
  return decimals;
}

getExpirationText(): string {
  if (!this.product.expirationDate) return '';
  
  const expDate = new Date(this.product.expirationDate);
  const now = new Date();
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  if (diffDays <= 7) return `Expires in ${diffDays} days`;
  if (diffDays <= 30) return `Expires in ${Math.ceil(diffDays / 7)} weeks`;
  
  return `Expires ${expDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

getCreatedText(): string {
  if (!this.product.createdAt) return '';
  
  const createdDate = new Date(this.product.createdAt);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Added today';
  if (diffDays === 1) return 'Added yesterday';
  if (diffDays <= 7) return `Added ${diffDays} days ago`;
  if (diffDays <= 30) return `Added ${Math.ceil(diffDays / 7)} weeks ago`;
  
  return `Added ${createdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}
}