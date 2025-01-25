import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useWarehouseService } from '../components/warehouseService';
import { useAuth } from '../components/AuthContext';

export default function AccessManagementScreen() {
  const { listWarehouses, listAccess, grantAccess, revokeAccess } = useWarehouseService();
  const { authTokens } = useAuth();

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  const [accessList, setAccessList] = useState<{ userId: string; role: string }[]>([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('viewer');

  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchAccessList(selectedWarehouseId);
    } else {
      setAccessList([]);
    }
  }, [selectedWarehouseId]);

  const fetchAccessList = async (warehouseId: string) => {
    try {
      setError(null);
      const data = await listAccess(warehouseId);
      setAccessList(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedWarehouseId) return;
    try {
      setError(null);
      await grantAccess(selectedWarehouseId, userId, role);
      await fetchAccessList(selectedWarehouseId);
      clearForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevokeAccess = async (revUserId: string) => {
    if (!selectedWarehouseId) return;
    try {
      setError(null);
      await revokeAccess(selectedWarehouseId, revUserId);
      await fetchAccessList(selectedWarehouseId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearForm = () => {
    setUserId('');
    setRole('viewer');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Access Management</Text>
      {error && <Text style={styles.error}>{error}</Text>}

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

      {!!selectedWarehouseId && (
        <View style={styles.form}>
          <Text style={styles.label}>Grant/Update Access</Text>
          <TextInput
            style={styles.input}
            placeholder="User ID"
            value={userId}
            onChangeText={setUserId}
          />
          <Picker
            selectedValue={role}
            onValueChange={(value) => setRole(value)}
            style={styles.picker}
          >
            <Picker.Item label="viewer" value="viewer" />
            <Picker.Item label="editor" value="editor" />
            <Picker.Item label="owner" value="owner" />
          </Picker>
          <Button title="Grant Access" onPress={handleGrantAccess} />
        </View>
      )}

      {!!selectedWarehouseId && accessList.length > 0 && (
        <FlatList
          data={accessList}
          keyExtractor={(item) => item.userId}
          style={{ marginTop: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.accessRow}>
              <Text style={styles.itemText}>
                {item.userId} - role: {item.role}
              </Text>
              <Button
                title="Revoke"
                onPress={() => handleRevokeAccess(item.userId)}
                color="red"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {selectedWarehouseId && accessList.length === 0 && (
        <Text style={styles.info}>No users have access to this warehouse.</Text>
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
  form: {
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
  accessRow: {
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
