import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useWarehouseService } from '../components/warehouseService';
import { useAuth } from '../components/AuthContext';

export default function ItemManagementScreen() {
  // We use the same service to get warehouses & items
  const {
    listWarehouses,
    listItems,
    createItem,
    updateItem,
    deleteItem,
  } = useWarehouseService();

  const { authTokens } = useAuth();

  // List of all warehouses (for dropdown)
  const [warehouses, setWarehouses] = useState<any[]>([]);
  // The selected warehouse ID from the dropdown
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  // Items for the selected warehouse
  const [items, setItems] = useState<any[]>([]);
  // For error messages
  const [error, setError] = useState<string | null>(null);

  // Item form states
  const [itemId, setItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Fetch warehouses on mount (once tokens are ready)
  useEffect(() => {
    if (authTokens?.idToken) {
      fetchWarehouses();
    }
  }, [authTokens]);

  const fetchWarehouses = async () => {
    try {
      setError(null);
      const data = await listWarehouses();
      setWarehouses(data);

      // Optionally, auto-select the first warehouse if you want:
      // if (data.length > 0) {
      //   setSelectedWarehouseId(data[0].warehouseId);
      // }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Whenever selectedWarehouseId changes, fetch items
  useEffect(() => {
    if (selectedWarehouseId) {
      fetchItems(selectedWarehouseId);
    } else {
      setItems([]);
    }
  }, [selectedWarehouseId]);

  const fetchItems = async (warehouseId: string) => {
    try {
      setError(null);
      const data = await listItems(warehouseId);
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Create a new item
  const handleCreateItem = async () => {
    if (!selectedWarehouseId) return;
    try {
      setError(null);
      await createItem(selectedWarehouseId, itemId, itemName, parseInt(quantity) || 0);
      await fetchItems(selectedWarehouseId);
      // Clear form
      clearItemForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Update existing item
  const handleUpdateItem = async () => {
    if (!selectedWarehouseId || !selectedItem) return;
    try {
      setError(null);
      await updateItem(selectedWarehouseId, selectedItem.itemId, itemName, parseInt(quantity));
      await fetchItems(selectedWarehouseId);
      // Reset state
      clearItemForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete an item
  const handleDeleteItem = async (itemId: string) => {
    if (!selectedWarehouseId) return;
    try {
      setError(null);
      await deleteItem(selectedWarehouseId, itemId);
      await fetchItems(selectedWarehouseId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // When user taps an item in the list, populate form for editing
  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setItemId(item.itemId);      // Might choose to disable editing itemId in your UI
    setItemName(item.itemName);
    setQuantity(String(item.quantity));
  };

  const clearItemForm = () => {
    setSelectedItem(null);
    setItemId('');
    setItemName('');
    setQuantity('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Item Management</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {/* 1) Warehouse Picker */}
      <Text style={styles.label}>Select Warehouse:</Text>
      <Picker
        selectedValue={selectedWarehouseId}
        onValueChange={(value) => setSelectedWarehouseId(value)}
        style={styles.picker}
      >
        <Picker.Item label="-- Select --" value="" />
        {warehouses.map((wh) => (
          <Picker.Item
            key={wh.warehouseId}
            label={`${wh.warehouseName} (${wh.warehouseId})`}
            value={wh.warehouseId}
          />
        ))}
      </Picker>

      {/* 2) Item Form */}
      {!!selectedWarehouseId && (
        <View style={styles.itemForm}>
          <Text style={styles.label}>
            {selectedItem ? 'Edit Item' : 'New Item'}
          </Text>
          {/* Item ID (only if creating or for reference) */}
          {!selectedItem && (
            <TextInput
              style={styles.input}
              placeholder="Item ID"
              value={itemId}
              onChangeText={setItemId}
            />
          )}
          {/* If you want itemId always editable, remove the condition above. */}

          <TextInput
            style={styles.input}
            placeholder="Item Name"
            value={itemName}
            onChangeText={setItemName}
          />

          <TextInput
            style={styles.input}
            placeholder="Quantity"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          {selectedItem ? (
            <View style={styles.buttonRow}>
              <Button title="Update Item" onPress={handleUpdateItem} />
              <Button
                title="Cancel"
                onPress={clearItemForm}
                color="#999"
              />
            </View>
          ) : (
            <Button title="Create Item" onPress={handleCreateItem} />
          )}
        </View>
      )}

      {/* 3) Items List */}
      {!!selectedWarehouseId && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.itemId}
          style={{ marginTop: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => handleSelectItem(item)}
            >
              <Text style={styles.itemText}>
                {item.itemId} - {item.itemName} (Qty: {item.quantity})
              </Text>
              <Button
                title="Delete"
                onPress={() => handleDeleteItem(item.itemId)}
                color="red"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {selectedWarehouseId && items.length === 0 && (
        <Text style={styles.info}>No items found for this warehouse.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginVertical: 8,
  },
  picker: {
    marginBottom: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  itemForm: {
    marginVertical: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  info: {
    fontStyle: 'italic',
    marginTop: 16,
  },
});
