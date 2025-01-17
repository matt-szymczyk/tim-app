// app/warehouses/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { useWarehouseService } from '../../components/warehouseService';
import { useAuth } from '../../components/AuthContext';

export default function WarehouseListScreen() {
  const { listWarehouses, createWarehouse } = useWarehouseService();
  const { authTokens } = useAuth(); // Add this line
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      await createWarehouse('W999', 'My brand new warehouse');
      await fetchData(); // reload list
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Warehouses</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Create Warehouse (Demo)" onPress={handleCreateWarehouse} />
      <FlatList
        data={warehouses}
        keyExtractor={(item) => item.warehouseId}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.warehouseId} - {item.warehouseName}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  error: { color: 'red', marginVertical: 8 },
  item: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  itemText: { fontSize: 16 },
});
