export interface Product {
  id?: string;
  name: string;
  price: number;
  expirationDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCreateRequest {
  name: string;
  price: number;
  expirationDate?: Date;
}

export interface ProductUpdateRequest {
  name: string;
  price: number;
  expirationDate?: Date;
}