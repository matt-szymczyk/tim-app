// app/warehouseService.ts

import { useAuth } from "./AuthContext";

// Adjust with your actual API base URL
const API_BASE_URL = 'https://t69lnh1vyd.execute-api.eu-north-1.amazonaws.com'; 

/**
 * Example type definitions
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

  // Return JSON if available
  return res.json();
}

export function useWarehouseService() {
  const { authTokens /*, refreshTokens */ } = useAuth();
  const accessToken = authTokens?.idToken;

  // ----------------------------------------------------------------
  // Warehouse endpoints
  // ----------------------------------------------------------------
  const listWarehouses = async (): Promise<Warehouse[]> => {
    const data = await apiFetch('/warehouses', 'GET', accessToken);
    return data as Warehouse[];
  };

  const getWarehouse = async (warehouseId: string): Promise<Warehouse> => {
    const data = await apiFetch(`/warehouses/${warehouseId}`, 'GET', accessToken);
    return data as Warehouse;
  };

  const createWarehouse = async (warehouseId: string, warehouseName: string) => {
    const body = { warehouseId, warehouseName };
    const data = await apiFetch('/warehouses', 'POST', accessToken, body);
    return data;
  };

  const updateWarehouse = async (warehouseId: string, warehouseName: string) => {
    const body = { warehouseName };
    const data = await apiFetch(`/warehouses/${warehouseId}`, 'PUT', accessToken, body);
    return data;
  };

  const deleteWarehouse = async (warehouseId: string) => {
    const data = await apiFetch(`/warehouses/${warehouseId}`, 'DELETE', accessToken);
    return data;
  };

  // ----------------------------------------------------------------
  // Item endpoints
  // ----------------------------------------------------------------

  /**
   * List all items in a warehouse
   */
  const listItems = async (warehouseId: string): Promise<Item[]> => {
    const data = await apiFetch(`/warehouses/${warehouseId}/items`, 'GET', accessToken);
    return data as Item[];
  };

  /**
   * Create a new item in a warehouse
   */
  const createItem = async (
    warehouseId: string,
    itemId: string,
    itemName: string,
    quantity: number
  ) => {
    const body = {
      itemId,
      itemName,
      quantity,
    };
    const data = await apiFetch(`/warehouses/${warehouseId}/items`, 'POST', accessToken, body);
    return data;
  };

  /**
   * Get a single item from a warehouse
   */
  const getItem = async (warehouseId: string, itemId: string): Promise<Item> => {
    const data = await apiFetch(`/warehouses/${warehouseId}/items/${itemId}`, 'GET', accessToken);
    return data as Item;
  };

  /**
   * Update an item in a warehouse
   * (Pass null or undefined for fields you don't want to update)
   */
  const updateItem = async (
    warehouseId: string,
    itemId: string,
    newName?: string,
    newQuantity?: number
  ) => {
    const body: any = {};
    if (newName !== undefined) body.itemName = newName;
    if (newQuantity !== undefined) body.quantity = newQuantity;

    const data = await apiFetch(`/warehouses/${warehouseId}/items/${itemId}`, 'PUT', accessToken, body);
    return data;
  };

  /**
   * Delete an item from a warehouse
   */
  const deleteItem = async (warehouseId: string, itemId: string) => {
    const data = await apiFetch(`/warehouses/${warehouseId}/items/${itemId}`, 'DELETE', accessToken);
    return data;
  };

  // Return all methods
  return {
    // Warehouse CRUD
    listWarehouses,
    getWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,

    // Item CRUD
    listItems,
    createItem,
    getItem,
    updateItem,
    deleteItem,
  };
}
