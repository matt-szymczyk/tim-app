// app/warehouseService.ts
import { useAuth } from "./AuthContext";

const API_BASE_URL = 'https://t69lnh1vyd.execute-api.eu-north-1.amazonaws.com'; 
// Or from .env, or constants file

/**
 * Example of a typed interface for Warehouse.
 */
export interface Warehouse {
  warehouseId: string;
  warehouseName: string;
  createdAt?: number;
}

/**
 * A simple helper to fetch with Auth headers
 */
async function apiFetch(path: string, method: string, token: string, body?: any) {
  const executeRequest = async (currentToken: string) => {
    const headers: any = {
      'Authorization': `Bearer ${currentToken}`,
    };
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API error: ${res.status} - ${errorBody}`);
    }
    return res.json();
  };

  try {
    return await executeRequest(token);
  } catch (error: any) {
    if (error.message.includes('401')) {
      // Get fresh tokens from AuthContext
      const newToken = await refreshTokens();
      // Retry with new token
      return await executeRequest(newToken);
    }
    throw error;
  }
}

export function useWarehouseService() {
  const { authTokens, refreshTokens } = useAuth();
  const accessToken = authTokens?.idToken;  
  // Print auth tokens for debugging
  console.log('Auth tokens:', authTokens);

  // Optionally, you can do a token expiry check here.
  // If expired, call refreshTokens(). We'll keep it simple.

  return {
    /**
     * List warehouses user can access
     */
    listWarehouses: async (): Promise<Warehouse[]> => {
      const data = await apiFetch('/warehouses', 'GET', accessToken);
      return data as Warehouse[];
    },

    /**
     * Get a single warehouse
     */
    getWarehouse: async (warehouseId: string): Promise<Warehouse> => {
      const data = await apiFetch(`/warehouses/${warehouseId}`, 'GET', accessToken);
      return data as Warehouse;
    },

    /**
     * Create a warehouse
     */
    createWarehouse: async (warehouseId: string, warehouseName: string) => {
      const body = { warehouseId, warehouseName };
      const data = await apiFetch('/warehouses', 'POST', accessToken, body);
      return data;
    },

    /**
     * Update a warehouse
     */
    updateWarehouse: async (warehouseId: string, warehouseName: string) => {
      const body = { warehouseName };
      const data = await apiFetch(`/warehouses/${warehouseId}`, 'PUT', accessToken, body);
      return data;
    },

    /**
     * Delete a warehouse
     */
    deleteWarehouse: async (warehouseId: string) => {
      const data = await apiFetch(`/warehouses/${warehouseId}`, 'DELETE', accessToken);
      return data;
    },

    // You can similarly add "listItems", "createItem", etc.
  };
}
