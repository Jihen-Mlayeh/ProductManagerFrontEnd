import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../models/product';
import { delay, from, Observable, switchMap, tap } from 'rxjs';

export interface ScenarioStep {
  name: string;
  action: () => Observable<any> | Promise<any>;
  delayAfter: number;
}

export interface Scenario {
  name: string;
  user: {
    name: string;
    email: string;
    password: string;
  };
  steps: ScenarioStep[];
}

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  async executeScenario(scenario: Scenario): Promise<void> {
    console.log(`🎬 Starting scenario: ${scenario.name}`);
    console.log(`👤 User: ${scenario.user.name}`);

    await this.login(scenario.user);
    
    for (const step of scenario.steps) {
      console.log(`  ▶️ Step: ${step.name}`);
      
      try {
        const result = await step.action();
        console.log(`  ✅ Step completed: ${step.name}`);
      } catch (error) {
        console.error(`  ❌ Step failed: ${step.name}`, error);
      }

      if (step.delayAfter > 0) {
        await this.wait(step.delayAfter);
      }
    }

    console.log(`🏁 Scenario completed: ${scenario.name}\n`);
  }

  async executeAllScenarios(): Promise<void> {
    const scenarios = this.getAllScenarios();
    
    console.log(`🚀 Starting execution of ${scenarios.length} scenarios\n`);
    
    for (const scenario of scenarios) {
      await this.executeScenario(scenario);
      await this.wait(2000);
    }

    console.log(`✅ All scenarios completed!`);
    this.toastr.success('All scenarios completed!', 'Success');
  }

  private async login(user: { email: string; password: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authService.login({
        email: user.email,
        password: user.password
      }).subscribe({
        next: () => {
          console.log(`  ✅ Logged in as ${user.email}`);
          resolve();
        },
        error: (error) => {
          console.error(`  ❌ Login failed for ${user.email}`, error);
          reject(error);
        }
      });
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAllScenarios(): Scenario[] {
    return [
      this.scenario1_AdminHeavyUser(),
      this.scenario2_BrowserUser(),
      this.scenario3_CreatorUser(),
      this.scenario4_DeleterUser(),
      this.scenario5_ErrorProneUser(),
      this.scenario6_MixedBehaviorUser()
    ];
  }

  private scenario1_AdminHeavyUser(): Scenario {
    return {
      name: 'Admin Heavy User - Full CRUD Operations',
      user: {
        name: 'Admin User',
        email: 'admin@productmanager.com',
        password: 'admin123'
      },
      steps: [
        {
          name: 'View all products',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        },
        {
          name: 'Search for expensive products',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            return products?.filter(p => p.price > 1000) || [];
          },
          delayAfter: 1500
        },
        {
          name: 'View first product details',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 0) {
              return this.productService.getProductById(products[0].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1000
        },
        {
          name: 'Create premium product',
          action: () => this.productService.createProduct({
            name: 'Admin Premium Laptop',
            price: 2499.99,
            expirationDate: new Date('2026-12-31')
          }).toPromise(),
          delayAfter: 1500
        },
        {
          name: 'Create budget product',
          action: () => this.productService.createProduct({
            name: 'Admin Budget Mouse',
            price: 15.99,
            expirationDate: new Date('2025-06-30')
          }).toPromise(),
          delayAfter: 1000
        },
        {
          name: 'View all products again',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        },
        {
          name: 'Update first product',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 0) {
              return this.productService.updateProduct(products[0].id!, {
                name: products[0].name + ' (Updated by Admin)',
                price: products[0].price * 1.1,
                expirationDate: products[0].expirationDate
              }).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'Delete last product',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 0) {
              return this.productService.deleteProduct(products[products.length - 1].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1000
        }
      ]
    };
  }

  private scenario2_BrowserUser(): Scenario {
    return {
      name: 'Browser User - Read-Only Exploration',
      user: {
        name: 'Browser User',
        email: 'browser@productmanager.com',
        password: 'browse123'
      },
      steps: [
        {
          name: 'View all products',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 2000
        },
        {
          name: 'View product 1 details',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 0) {
              return this.productService.getProductById(products[0].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'View product 2 details',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 1) {
              return this.productService.getProductById(products[1].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'View product 3 details',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 2) {
              return this.productService.getProductById(products[2].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'Browse products again',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 2000
        },
        {
          name: 'View product 5 details',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 4) {
              return this.productService.getProductById(products[4].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'View product 10 details',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 9) {
              return this.productService.getProductById(products[9].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'Final products view',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        }
      ]
    };
  }

  private scenario3_CreatorUser(): Scenario {
    return {
      name: 'Creator User - Bulk Product Creation',
      user: {
        name: 'Creator User',
        email: 'creator@productmanager.com',
        password: 'create123'
      },
      steps: [
        {
          name: 'View existing products',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        },
        {
          name: 'Create product 1: Gaming Keyboard',
          action: () => this.productService.createProduct({
            name: 'RGB Gaming Keyboard',
            price: 89.99,
            expirationDate: new Date('2026-03-15')
          }).toPromise(),
          delayAfter: 800
        },
        {
          name: 'Create product 2: Wireless Mouse',
          action: () => this.productService.createProduct({
            name: 'Wireless Gaming Mouse',
            price: 59.99,
            expirationDate: new Date('2026-03-15')
          }).toPromise(),
          delayAfter: 800
        },
        {
          name: 'Create product 3: Monitor',
          action: () => this.productService.createProduct({
            name: '27" 4K Monitor',
            price: 399.99,
            expirationDate: new Date('2027-01-01')
          }).toPromise(),
          delayAfter: 800
        },
        {
          name: 'Create product 4: Headset',
          action: () => this.productService.createProduct({
            name: 'Noise-Cancelling Headset',
            price: 149.99,
            expirationDate: new Date('2026-06-30')
          }).toPromise(),
          delayAfter: 800
        },
        {
          name: 'Create product 5: Webcam',
          action: () => this.productService.createProduct({
            name: '1080p Webcam',
            price: 79.99,
            expirationDate: new Date('2025-12-31')
          }).toPromise(),
          delayAfter: 800
        },
        {
          name: 'View all created products',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        }
      ]
    };
  }

  private scenario4_DeleterUser(): Scenario {
    return {
      name: 'Deleter User - Cleanup Operations',
      user: {
        name: 'Deleter User',
        email: 'deleter@productmanager.com',
        password: 'delete123'
      },
      steps: [
        {
          name: 'View all products',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1500
        },
        {
          name: 'Delete product at index 0',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 0) {
              return this.productService.deleteProduct(products[0].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1000
        },
        {
          name: 'Delete product at index 1',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 1) {
              return this.productService.deleteProduct(products[1].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1000
        },
        {
          name: 'View remaining products',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1500
        },
        {
          name: 'Delete product at index 2',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 2) {
              return this.productService.deleteProduct(products[2].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1000
        },
        {
          name: 'Final products check',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        }
      ]
    };
  }

  private scenario5_ErrorProneUser(): Scenario {
    return {
      name: 'Error-Prone User - Testing Error Handling',
      user: {
        name: 'Error User',
        email: 'error@productmanager.com',
        password: 'error123'
      },
      steps: [
        {
          name: 'Try to view non-existent product (ID: invalid-id-99999)',
          action: () => this.productService.getProductById('invalid-id-99999').toPromise().catch(e => e),
          delayAfter: 1000
        },
        {
          name: 'View valid products',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        },
        {
          name: 'Try to delete non-existent product (ID: invalid-id-88888)',
          action: () => this.productService.deleteProduct('invalid-id-88888').toPromise().catch(e => e),
          delayAfter: 1000
        },
        {
          name: 'Create product with minimal data',
          action: () => this.productService.createProduct({
            name: 'Error Test Product',
            price: 10.00,
          }).toPromise().catch(e => e),
          delayAfter: 1000
        },
        {
          name: 'View products after errors',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        }
      ]
    };
  }

  private scenario6_MixedBehaviorUser(): Scenario {
    return {
      name: 'Mixed Behavior User - Realistic Usage',
      user: {
        name: 'Regular User',
        email: 'regular@productmanager.com',
        password: 'regular123'
      },
      steps: [
        {
          name: 'Browse products',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 2000
        },
        {
          name: 'View specific product',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 4) {
              return this.productService.getProductById(products[4].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'Create own product',
          action: () => this.productService.createProduct({
            name: 'Regular User Office Chair',
            price: 249.99,
            expirationDate: new Date('2026-12-31')
          }).toPromise(),
          delayAfter: 1500
        },
        {
          name: 'Browse again',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 2000
        },
        {
          name: 'View another product',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            if (products && products.length > 7) {
              return this.productService.getProductById(products[7].id!).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'Update own product',
          action: async () => {
            const products = await this.productService.getAllProducts().toPromise();
            const myProduct = products?.find(p => p.name.includes('Regular User'));
            if (myProduct && myProduct.id) {
              return this.productService.updateProduct(myProduct.id, {
                name: myProduct.name + ' (Price Reduced)',
                price: myProduct.price * 0.9,
                expirationDate: myProduct.expirationDate
              }).toPromise();
            }
            return undefined;
          },
          delayAfter: 1500
        },
        {
          name: 'Final browse',
          action: () => this.productService.getAllProducts().toPromise(),
          delayAfter: 1000
        }
      ]
    };
  }
}