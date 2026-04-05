
import { dbClient } from './dbClient';
import { api as mockApi } from './mockApi';

// Determine which API to use based on environment variables
// Default to TRUE to force database connection for "publish level"
let useDb = true; 

try {
    // Helper to safely check import.meta properties without throwing ReferenceError
    const meta = (import.meta as any) || {};
    const env = meta.env || {};
    
    // If VITE_USE_MOCK is explicitly set to true, we switch back to mock
    if (env.VITE_USE_MOCK === 'true') {
        useDb = false;
    }
} catch (e) {
    // If environment check fails, we stay with the default (true for DB)
    console.warn("Environment check failed, defaulting to Database Client");
}

if (useDb) {
    console.log('%c Using Database Client (Backend Connection) ', 'background: #222; color: #bada55');
} else {
    console.log('%c Using Mock Data (Local Storage) ', 'background: #222; color: #ffcc00');
}

export const api = useDb ? dbClient : mockApi;
