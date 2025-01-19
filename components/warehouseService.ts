// app/warehouseService.ts
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
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

export interface Item {
  itemId: string;
  itemName: string;
  quantity: number;
}

/**
 * A simple helper to fetch with Auth headers
 */
async function apiFetch(path: string, method: string, token: string, body?: any) {
  console.log(`API call: ${method} ${path}`);
  console.log('Auth token:', token);
  console.log('Body:', body);
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
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

    // createItem: async (warehouseId: string, itemId: string, itemName: string, quantity: number) => {
    //   const body = { itemId, itemName, quantity };
    //   const data = await apiFetch(`/warehouses/${warehouseId}/items`, 'POST', accessToken, body);
    //   return data;
    // },

    // getItem: async (warehouseId: string, itemId: string): Promise<any> => {
    //   const data = await apiFetch(`/warehouses/${warehouseId}/items/${itemId}`, 'GET', accessToken);
    //   return data as any;
    // },

    // updateItem: async (warehouseId: string, itemId: string, itemName: string, quantity: number) => {
    //   const body = { itemName, quantity };
    //   const data = await apiFetch(`/warehouses/${warehouseId}/items/${itemId}`, 'PUT', accessToken, body);
    //   return data;
    // },

    // deleteItem: async (warehouseId: string, itemId: string) => {
    //   const data = await apiFetch(`/warehouses/${warehouseId}/items/${itemId}`, 'DELETE', accessToken);
    //   return data;
    // },

    // listItems: async (warehouseId: string): Promise<any[]> => {
    //   const data = await apiFetch(`/warehouses/${warehouseId}/items`, 'GET', accessToken);
    //   return data as any[];
    // }

    createItem: async (
      warehouseId: string, 
      itemId: string, 
      itemName: string, 
      quantity: number
    ): Promise<Item> => {
      const body = { itemId, itemName, quantity };
      const data = await apiFetch(`/warehouses/${warehouseId}/items`, 'POST', accessToken, body);
      return data as Item;
    },
    
    getItem: async (warehouseId: string, itemId: string): Promise<Item> => {
      const data = await apiFetch(`/warehouses/${warehouseId}/items/${itemId}`, 'GET', accessToken);
      return data as Item;
    },
    
    updateItem: async (
      warehouseId: string, 
      itemId: string, 
      itemName: string, 
      quantity: number
    ): Promise<Item> => {
      const body = { itemName, quantity };
      const data = await apiFetch(`/warehouses/${warehouseId}/items/${itemId}`, 'PUT', accessToken, body);
      return data as Item;
    },
    
    listItems: async (warehouseId: string): Promise<Item[]> => {
      const data = await apiFetch(`/warehouses/${warehouseId}/items`, 'GET', accessToken);
      return data as Item[];
    },
    
  };
}
