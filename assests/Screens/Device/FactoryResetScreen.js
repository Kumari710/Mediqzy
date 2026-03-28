import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function FactoryResetScreen({ navigation, visible = true, onCancel, onOk }) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleOk = () => {
    if (onOk) {
      onOk();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={moderateScale(60)} color="#FF3B30" />
          </View>

          <Text style={styles.title}>Factory Reset</Text>
          <Text style={styles.desc}>
            This will erase all settings and history data from the device. To use the device again after reset, you will need to charge it to reactivate.
          </Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.okBtn} onPress={handleOk} activeOpacity={0.7}>
              <Text style={styles.okText}>Confirm Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(24),
    padding: scale(24),
    width: wp(85),
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconContainer: {
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(12),
    textAlign: 'center'
  },
  desc: {
    fontSize: moderateScale(15),
    color: '#666',
    marginBottom: verticalScale(32),
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    backgroundColor: '#F5F5F5',
    borderRadius: scale(12),
  },
  okBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    backgroundColor: '#FF3B30',
    borderRadius: scale(12),
  },
  cancelText: {
    color: '#666',
    fontSize: moderateScale(16),
    fontWeight: 'bold'
  },
  okText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold'
  },
});
