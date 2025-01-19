// app/warehouses/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useWarehouseService } from '../../components/warehouseService';
import { useAuth } from '../../components/AuthContext';

export default function WarehouseListScreen() {
  const { listWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getWarehouse } = useWarehouseService();
  const { authTokens } = useAuth();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // New state variables for form inputs
  const [warehouseId, setWarehouseId] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  const fetchData = async () => {
    try {
      const data = await listWarehouses();
      setWarehouses(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // Only fetch when authTokens are available
    if (authTokens?.idToken) {
      fetchData();
    }
  }, [authTokens]); // Add authTokens as dependency

  // Example: create a dummy warehouse
  const handleCreateWarehouse = async () => {
    try {
      setError(null);
      await createWarehouse(warehouseId, warehouseName);
      await fetchData();
      // Clear inputs after successful creation
      setWarehouseId('');
      setWarehouseName('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateWarehouse = async () => {
    if (!selectedWarehouse) return;
    try {
      setError(null);
      await updateWarehouse(selectedWarehouse.warehouseId, warehouseName);
      await fetchData();
      setSelectedWarehouse(null);
      setWarehouseName('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    try {
      setError(null);
      await deleteWarehouse(warehouseId);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectWarehouse = async (warehouse: any) => {
    try {
      setError(null);
      const details = await getWarehouse(warehouse.warehouseId);
      setSelectedWarehouse(details);
      setWarehouseName(details.warehouseName);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Warehouses</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      
      <View style={styles.inputContainer}>
        {!selectedWarehouse && (
          <TextInput
            style={styles.input}
            placeholder="Warehouse ID"
            value={warehouseId}
            onChangeText={setWarehouseId}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Warehouse Name"
          value={warehouseName}
          onChangeText={setWarehouseName}
        />
        
        {selectedWarehouse ? (
          <View style={styles.buttonGroup}>
            <Button title="Update Warehouse" onPress={handleUpdateWarehouse} />
            <Button title="Cancel" onPress={() => {
              setSelectedWarehouse(null);
              setWarehouseName('');
            }} />
          </View>
        ) : (
          <Button title="Create Warehouse" onPress={handleCreateWarehouse} />
        )}
      </View>

      <FlatList
        data={warehouses}
        keyExtractor={(item) => item.warehouseId}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.item}
            onPress={() => handleSelectWarehouse(item)}
          >
            <Text style={styles.itemText}>
              {item.warehouseId} - {item.warehouseName}
            </Text>
            <Button
              title="Delete"
              onPress={() => handleDeleteWarehouse(item.warehouseId)}
              color="red"
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  error: { 
    color: 'red', 
    marginVertical: 8 
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  item: { 
    padding: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: { 
    fontSize: 16,
    flex: 1,
  },
});
