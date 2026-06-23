export type PizzaSize = 'mediana' | 'grande' | 'familiar';

export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  base_price: number;
  image_url: string;
  vegetarian: boolean;
  spicy: boolean;
  available: boolean;
  sort_order: number;
}

export interface SizeOption {
  id: PizzaSize;
  label: string;
  multiplier: number;
  diameter: string;
}

export interface ExtraOption {
  id: string;
  label: string;
  price: number;
}

export const sizeOptions: SizeOption[] = [
  { id: 'mediana', label: 'Mediana', multiplier: 1, diameter: '25 cm' },
  { id: 'grande', label: 'Grande', multiplier: 1.35, diameter: '30 cm' },
  { id: 'familiar', label: 'Familiar', multiplier: 1.7, diameter: '40 cm' },
];

export const extraOptions: ExtraOption[] = [
  { id: 'queso', label: 'Queso extra', price: 1.5 },
  { id: 'orilla', label: 'Orilla rellena', price: 2.5 },
  { id: 'borde', label: 'Borde de queso', price: 3.0 },
  { id: 'picante', label: 'Ají picante', price: 1.0 },
];

export const DELIVERY_FEE = 2.99;
export const TAX_RATE = 0.1;
