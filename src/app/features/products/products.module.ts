import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProductsRoutingModule } from './products-routing.module';

import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductCardComponent } from './product-card/product-card.component';

@NgModule({
  declarations: [
    ProductListComponent,
    ProductDetailComponent,
    ProductFormComponent,
    ProductCardComponent
  ],
  imports: [
    SharedModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }