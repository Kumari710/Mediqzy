import React from 'react';
import { View, Text, Modal, StyleSheet, Image } from 'react-native';
import { scale, verticalScale, moderateScale, wp } from '../../Utils/responsive';

export default function SosSuccessModal({ visible }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => { }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Image
            source={require('../../images/SOS.png')}
            style={styles.sosImage}
            resizeMode="contain"
          />
          <Text style={styles.successText}>SOS sent successfully</Text>
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
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(28),
    alignItems: 'center',
    padding: moderateScale(30),
    elevation: 10,
    width: wp(80),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  sosImage: {
    width: scale(140),
    height: scale(140),
    marginBottom: verticalScale(20),
  },
  successText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
  },
});
