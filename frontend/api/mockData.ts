
import { User } from '../types';

export const MOCK_USERS: User[] = [
    { 
        id: 'admin-01', name: 'Admin User', email: 'admin@ezooze.com', role: 'admin', password: 'password123',
        status: 'Active', 
        createdAt: new Date('2023-01-10T10:00:00Z').toISOString(),
        lastSeen: new Date('2024-05-26T10:00:00Z').toISOString(),
    },
    { 
        id: '1', name: 'John Doe', email: 'john.doe@example.com', password: 'password123',
        status: 'Active', 
        createdAt: new Date('2023-01-15T10:00:00Z').toISOString(),
        lastSeen: new Date('2024-05-20T14:30:00Z').toISOString(),
        address: { street: '123 Oak Ave', city: 'Metropolis', state: 'NY', zip: '10001', country: 'USA' },
        orders: [
            { id: 'ORD-001', date: new Date('2024-05-18T10:00:00Z').toISOString(), status: 'Delivered', total: 75000 },
            { id: 'ORD-002', date: new Date('2024-04-10T11:00:00Z').toISOString(), status: 'Delivered', total: 48000 },
        ]
    },
    { 
        id: '2', name: 'Jane Google', email: 'jane.google@example.com', password: 'password123',
        status: 'Active', 
        createdAt: new Date('2023-03-22T11:20:00Z').toISOString(),
        lastSeen: new Date('2024-05-25T09:00:00Z').toISOString(),
        address: { street: '456 Pine St', city: 'Gotham', state: 'NJ', zip: '07001', country: 'USA' },
        orders: [
             { id: 'ORD-003', date: new Date('2024-05-24T12:00:00Z').toISOString(), status: 'Delivered', total: 54000 },
        ]
    },
    { 
        id: '3', name: 'Sam Smith', email: 'sam.smith@example.com', password: 'password123',
        status: 'Inactive', 
        createdAt: new Date('2023-08-10T09:00:00Z').toISOString(),
        lastSeen: new Date('2023-11-01T18:00:00Z').toISOString(),
        address: { street: '789 Birch Rd', city: 'Star City', state: 'CA', zip: '90210', country: 'USA' },
        orders: []
    },
];
