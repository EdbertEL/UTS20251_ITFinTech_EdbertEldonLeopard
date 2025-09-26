import { Product } from '../types';

export const products: Product[] = [
    {
    id: 1,
    name: 'Sparkling Water',
    price: 25000,
    description: 'Crisp and refreshing carbonated water.',
    category: 'Drinks',
    imageUrl: 'https://placehold.co/400/png', // We'll use a placeholder image
    },
    {
    id: 2,
    name: 'Energy Drink',
    price: 35000,
    description: 'A boost of energy for your day.',
    category: 'Drinks',
    imageUrl: 'https://placehold.co/400/png',
    },
    {
    id: 3,
    name: 'Potato Chips',
    price: 20000,
    description: 'Classic salted potato chips.',
    category: 'Snacks',
    imageUrl: 'https://placehold.co/400/png',
    },
    {
    id: 4,
    name: 'Chocolate Bar',
    price: 18000,
    description: 'Rich and creamy milk chocolate.',
    category: 'Snacks',
    imageUrl: 'https://placehold.co/400/png',
    },
];