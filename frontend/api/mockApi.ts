
import { User, Product, Order, ContactMessage } from '../types';
import { MOCK_USERS } from './mockData';

class MockApi {
    private users: User[] = [];
    private readonly userStorageKey = 'ezooze_users_db';

    constructor() {
        this.loadUsers();
    }

    private loadUsers() {
        try {
            const storedUsers = localStorage.getItem(this.userStorageKey);
            if (storedUsers) {
                this.users = JSON.parse(storedUsers);
                
                // FAILSAFE: For development/demo purposes, ensure admin exists.
                // In production logic, you might remove this auto-reset.
                const defaultAdmin = MOCK_USERS.find(u => u.role === 'admin');
                if (defaultAdmin && !this.users.some(u => u.role === 'admin')) {
                    this.users.push(defaultAdmin);
                }
            } else {
                this.users = MOCK_USERS;
                this._saveUsers();
            }
        } catch (error) {
            console.error("Error loading users from localStorage:", error);
            this.users = MOCK_USERS;
        }
    }

    private _saveUsers() {
        try {
            localStorage.setItem(this.userStorageKey, JSON.stringify(this.users));
        } catch (error) {
            console.error("Error saving users to localStorage:", error);
        }
    }

    async login(email: string, pass: string): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw new Error('User not found. Please check your email.');
        }

        if (user.password !== pass) {
            throw new Error('Invalid password. Please try again.');
        }
        
        // Don't send password back
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }

    async register(name: string, email: string, pass: string): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (this.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('An account with this email already exists.');
        }

        const newUser: User = {
            id: String(Date.now()),
            email,
            name,
            password: pass,
            status: 'Active',
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            orders: [],
        };

        this.users.push(newUser);
        this._saveUsers();

        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword as User;
    }
    
    async signInWithGoogle(_idToken?: string, _profile?: { email?: string; name?: string; picture?: string; googleId?: string }): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 500));
        let googleUser = this.users.find(u => u.email === 'jane.google@example.com');
        if (!googleUser) {
            googleUser = {
                 id: '2', name: 'Jane Google', email: 'jane.google@example.com', password: 'password123',
                 status: 'Active', createdAt: new Date('2023-03-22T11:20:00Z').toISOString(),
                 lastSeen: new Date().toISOString(),
            };
            this.users.push(googleUser);
            this._saveUsers();
        }
        const { password, ...userWithoutPassword } = googleUser;
        return userWithoutPassword as User;
    }

    async signInWithApple(_idToken?: string, _profile?: { email?: string; name?: string; appleId?: string }): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 500));
        let appleUser = this.users.find(u => u.email === 'apple.user@example.com');
        if (!appleUser) {
            appleUser = {
                id: 'apple-demo',
                name: 'Apple User',
                email: 'apple.user@example.com',
                password: 'password123',
                status: 'Active',
                createdAt: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
            } as User;
            this.users.push(appleUser);
            this._saveUsers();
        }
        const { password, ...userWithoutPassword } = appleUser;
        return userWithoutPassword as User;
    }

    async getUsers(): Promise<User[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.users.map(({ password, ...user }) => user as User);
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 400));
        let updatedUser: User | null = null;
        this.users = this.users.map(user => {
            if (user.id === userId) {
                updatedUser = { ...user, ...updates };
                return updatedUser;
            }
            return user;
        });

        if (!updatedUser) {
            throw new Error('User not found for update.');
        }

        this._saveUsers();
        const { password, ...userWithoutPassword } = updatedUser as User;
        return userWithoutPassword as User;
    }

    // --- Product & Order Methods (Reading from LocalStorage to match client persistence) ---

    async getProducts(): Promise<Product[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        const stored = localStorage.getItem('ezooze_products');
        return stored ? JSON.parse(stored) : [];
    }

    async getProduct(id: string | number): Promise<Product | undefined> {
        const products = await this.getProducts();
        return products.find(p => p.id == id);
    }

    async getOrders(): Promise<Order[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        const stored = localStorage.getItem('ezooze_orders');
        return stored ? JSON.parse(stored) : [];
    }

    async createOrder(order: Order): Promise<Order> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const orders = await this.getOrders();
        orders.unshift(order);
        localStorage.setItem('ezooze_orders', JSON.stringify(orders));
        return order;
    }
    
    async getMyOrders(userId: string): Promise<Order[]> {
        const orders = await this.getOrders();
        return orders.filter(o => o.customerId === userId);
    }

    async submitContactForm(data: ContactMessage): Promise<ContactMessage> {
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log("Mock Contact Form Submission:", data);
        return data;
    }

    async createPaymentIntent(amount: number, currency: string): Promise<{ clientSecret: string }> {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Mock Payment Intent created: ${amount} ${currency}`);
        return { clientSecret: 'mock_client_secret_' + Date.now() };
    }
}

export const api = new MockApi();
