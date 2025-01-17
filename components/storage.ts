// storage.ts
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storeValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    return AsyncStorage.setItem(key, value);
  } else {
    return SecureStore.setItemAsync(key, value);
  }
}

export async function getValue(key: string) {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  } else {
    return SecureStore.getItemAsync(key);
  }
}

export async function deleteValue(key: string) {
  if (Platform.OS === 'web') {
    return AsyncStorage.removeItem(key);
  } else {
    return SecureStore.deleteItemAsync(key);
  }
}
