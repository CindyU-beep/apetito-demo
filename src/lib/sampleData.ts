import { OrderHistory, CartItem } from './types';
import { MOCK_MEALS } from './mockData';

export function generateSampleOrders(): OrderHistory[] {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const orders: OrderHistory[] = [
    {
      id: 'order-001',
      date: now - (7 * oneDay),
      status: 'completed',
      items: [
        {
          product: {
            id: MOCK_MEALS[0].id,
            sku: `MEAL-${MOCK_MEALS[0].id}`,
            name: MOCK_MEALS[0].name,
            description: MOCK_MEALS[0].description,
            category: MOCK_MEALS[0].category,
            price: MOCK_MEALS[0].price,
            unit: 'serving',
            imageUrl: MOCK_MEALS[0].imageUrl,
            allergens: MOCK_MEALS[0].allergens,
            nutritionalInfo: MOCK_MEALS[0].nutritionalInfo,
            inStock: true,
          },
          quantity: 20,
        },
        {
          product: {
            id: MOCK_MEALS[1].id,
            sku: `MEAL-${MOCK_MEALS[1].id}`,
            name: MOCK_MEALS[1].name,
            description: MOCK_MEALS[1].description,
            category: MOCK_MEALS[1].category,
            price: MOCK_MEALS[1].price,
            unit: 'serving',
            imageUrl: MOCK_MEALS[1].imageUrl,
            allergens: MOCK_MEALS[1].allergens,
            nutritionalInfo: MOCK_MEALS[1].nutritionalInfo,
            inStock: true,
          },
          quantity: 15,
        },
        {
          product: {
            id: MOCK_MEALS[2].id,
            sku: `MEAL-${MOCK_MEALS[2].id}`,
            name: MOCK_MEALS[2].name,
            description: MOCK_MEALS[2].description,
            category: MOCK_MEALS[2].category,
            price: MOCK_MEALS[2].price,
            unit: 'serving',
            imageUrl: MOCK_MEALS[2].imageUrl,
            allergens: MOCK_MEALS[2].allergens,
            nutritionalInfo: MOCK_MEALS[2].nutritionalInfo,
            inStock: true,
          },
          quantity: 25,
        },
      ],
      total: 0,
    },
    {
      id: 'order-002',
      date: now - (14 * oneDay),
      status: 'completed',
      items: [
        {
          product: {
            id: MOCK_MEALS[3].id,
            sku: `MEAL-${MOCK_MEALS[3].id}`,
            name: MOCK_MEALS[3].name,
            description: MOCK_MEALS[3].description,
            category: MOCK_MEALS[3].category,
            price: MOCK_MEALS[3].price,
            unit: 'serving',
            imageUrl: MOCK_MEALS[3].imageUrl,
            allergens: MOCK_MEALS[3].allergens,
            nutritionalInfo: MOCK_MEALS[3].nutritionalInfo,
            inStock: true,
          },
          quantity: 30,
        },
        {
          product: {
            id: MOCK_MEALS[4].id,
            sku: `MEAL-${MOCK_MEALS[4].id}`,
            name: MOCK_MEALS[4].name,
            description: MOCK_MEALS[4].description,
            category: MOCK_MEALS[4].category,
            price: MOCK_MEALS[4].price,
            unit: 'serving',
            imageUrl: MOCK_MEALS[4].imageUrl,
            allergens: MOCK_MEALS[4].allergens,
            nutritionalInfo: MOCK_MEALS[4].nutritionalInfo,
            inStock: true,
          },
          quantity: 20,
        },
      ],
      total: 0,
    },
    {
      id: 'order-003',
      date: now - (21 * oneDay),
      status: 'completed',
      items: [
        {
          product: {
            id: MOCK_MEALS[9].id,
            sku: `MEAL-${MOCK_MEALS[9].id}`,
            name: MOCK_MEALS[9].name,
            description: MOCK_MEALS[9].description,
            category: MOCK_MEALS[9].category,
            price: MOCK_MEALS[9].price,
            unit: 'serving',
            imageUrl: MOCK_MEALS[9].imageUrl,
            allergens: MOCK_MEALS[9].allergens,
            nutritionalInfo: MOCK_MEALS[9].nutritionalInfo,
            inStock: true,
          },
          quantity: 18,
        },
      ],
      total: 0,
    },
  ];

  orders.forEach(order => {
    order.total = order.items.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
  });

  return orders;
}
