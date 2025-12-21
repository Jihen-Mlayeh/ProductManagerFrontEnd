import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ScenarioRunnerComponent } from './scenario-runner/scenario-runner.component';

const routes: Routes = [
  {
    path: '',
    component: ProductListComponent
  },
  {
    path: 'scenarios',  // ✅ AJOUTER
    component: ScenarioRunnerComponent
  },
  {
    path: 'new',
    component: ProductFormComponent
  },
  {
    path: ':id',
    component: ProductDetailComponent
  },
  {
    path: ':id/edit',
    component: ProductFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }