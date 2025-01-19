import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
  CameraType,
  FlashMode,
} from 'expo-camera';

interface ScannerOverlayProps {
  onScanned: (barcodeData: string) => void;
  onClose: () => void;
}

export default function ScannerOverlay({ onScanned, onClose }: ScannerOverlayProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');

  // If permission is null, it's still loading
  if (!permission) {
    return <View style={styles.center}><Text>Requesting camera permission...</Text></View>;
  }

  // If permission not granted, show a request button
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10 }}>We need your camera permission to scan barcodes</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={{ color: '#fff' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Callback when a barcode is detected
  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    // If the result has data, pass it to parent
    if (result.data) {
      onScanned(result.data);
    }
  };

  const toggleFlash = () => {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  return (
    <View style={styles.overlayContainer}>
      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        mirror={false}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          // Adjust if you only want certain barcode types
          // e.g., barcodeTypes: ['qr', 'ean13', 'code128']
          barcodeTypes: ['qr', 'ean13', 'code128']
        }}
      >
        {/* Overlay UI (buttons, instructions) */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.topBarText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFlash}>
            <Text style={styles.topBarText}>Flash: {flash === 'off' ? 'Off' : 'On'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={() => setFacing((prev) => (prev === 'front' ? 'back' : 'front'))}
          >
            <Text style={styles.topBarText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 9999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  permissionButton: {
    padding: 12,
    backgroundColor: 'blue',
    borderRadius: 4,
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  topBarText: {
    fontSize: 16,
    color: '#fff',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
});
