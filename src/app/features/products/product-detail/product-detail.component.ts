// ===== AJOUTER CES MÉTHODES À VOTRE product-detail.component.ts =====
// GARDEZ TOUT VOTRE CODE EXISTANT, ajoutez juste ces méthodes

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
  // ===== TOUTES VOS PROPRIÉTÉS EXISTANTES (ne changez rien) =====
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

  // ===== GARDEZ TOUTES VOS MÉTHODES EXISTANTES =====
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

  // ===== NOUVELLES MÉTHODES À AJOUTER =====

  // Vérifie si le produit est premium
  isPremium(): boolean {
    return this.product ? this.product.price > 1000 : false;
  }

  // Obtient l'icône appropriée selon le nom du produit
  getProductIcon(): string {
    if (!this.product) return 'inventory_2';
    
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
    
    return 'inventory_2';
  }

  // Obtient l'icône de statut
  getStatusIcon(): string {
    if (this.isExpired()) return 'schedule';
    if (this.isPremium()) return 'star';
    return 'check_circle';
  }

  // Obtient le label de statut
  getStatusLabel(): string {
    if (this.isExpired()) return 'Expired';
    if (this.isPremium()) return 'Premium';
    return 'Active';
  }

  // Texte formaté pour l'expiration
  getExpirationText(): string {
    if (!this.product?.expirationDate) return '';
    
    const expDate = new Date(this.product.expirationDate);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    if (diffDays <= 30) return `Expires in ${Math.ceil(diffDays / 7)} weeks`;
    
    return `Expires in ${Math.ceil(diffDays / 30)} months`;
  }

  // Texte formaté pour la création
  getCreatedText(): string {
    if (!this.product?.createdAt) return '';
    
    const createdDate = new Date(this.product.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Created today';
    if (diffDays === 1) return 'Created yesterday';
    if (diffDays <= 7) return `Created ${diffDays} days ago`;
    if (diffDays <= 30) return `Created ${Math.ceil(diffDays / 7)} weeks ago`;
    
    return `Created ${Math.ceil(diffDays / 30)} months ago`;
  }

  // Texte formaté pour la mise à jour
  getUpdatedText(): string {
    if (!this.product?.updatedAt) return '';
    
    const updatedDate = new Date(this.product.updatedAt);
    const now = new Date();
    const diffTime = now.getTime() - updatedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays <= 7) return `Updated ${diffDays} days ago`;
    if (diffDays <= 30) return `Updated ${Math.ceil(diffDays / 7)} weeks ago`;
    
    return `Updated ${Math.ceil(diffDays / 30)} months ago`;
  }

  // Obtient la catégorie du produit (basé sur le nom)
  getProductCategory(): string {
    if (!this.product) return 'General';
    
    const name = this.product.name.toLowerCase();
    
    if (name.includes('keyboard') || name.includes('mouse')) return 'Peripherals';
    if (name.includes('monitor') || name.includes('screen')) return 'Displays';
    if (name.includes('webcam') || name.includes('camera')) return 'Video Equipment';
    if (name.includes('lamp') || name.includes('light')) return 'Lighting';
    if (name.includes('usb') || name.includes('hub') || name.includes('cable')) return 'Accessories';
    if (name.includes('headphone') || name.includes('audio') || name.includes('speaker')) return 'Audio';
    if (name.includes('ipad') || name.includes('tablet')) return 'Tablets';
    if (name.includes('macbook') || name.includes('laptop')) return 'Computers';
    
    return 'General';
  }

  // Calcule les jours depuis la création
  getDaysSinceCreation(): number {
    if (!this.product?.createdAt) return 0;
    
    const createdDate = new Date(this.product.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calcule les jours jusqu'à l'expiration
  getDaysUntilExpiration(): number {
    if (!this.product?.expirationDate) return 0;
    
    const expDate = new Date(this.product.expirationDate);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}