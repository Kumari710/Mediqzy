import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const medicines = [
  { id: 1, name: 'OBH Combi', qty: '1', price: 70 },
  { id: 2, name: 'Bodrex Herbal', qty: '1', price: 120 },
  { id: 3, name: 'Panadol', qty: '2', price: 200 },
];

export default function MedicinesQuotationScreen({ navigation }) {
  const subtotal = medicines.reduce((sum, item) => sum + item.price, 0);
  const taxes = 30;
  const total = subtotal + taxes;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quotation Analysis</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Prescription Analysis Complete!</Text>
            <Text style={styles.infoSubtitle}>We have found the medicines from your uploaded prescription.</Text>
          </View>

          {/* Medicines List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medicines</Text>
            <View style={styles.medicinesCard}>
              <View style={styles.listHeader}>
                <Text style={styles.headerCol}>Drug Name</Text>
                <Text style={styles.headerColCenter}>Qty</Text>
                <Text style={styles.headerColEnd}>Price</Text>
              </View>
              <View style={styles.divider} />
              {medicines.map((item) => (
                <View key={item.id} style={styles.medicineRow}>
                  <Text style={styles.nameCol}>{item.name}</Text>
                  <Text style={styles.qtyCol}>x{item.qty}</Text>
                  <Text style={styles.priceCol}>Rs.{item.price}</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>Rs.{total}</Text>
              </View>
            </View>
          </View>

          {/* Download Section */}
          <View style={styles.downloadSection}>
            <View style={styles.pdfCard}>
              <View style={styles.pdfIconBox}>
                <Ionicons name="document-text" size={moderateScale(30)} color="#E53935" />
              </View>
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfName}>Detailed_Quotation.pdf</Text>
                <Text style={styles.pdfSize}>420 KB</Text>
              </View>
              <TouchableOpacity style={styles.downloadIconBtn}>
                <Ionicons name="download-outline" size={moderateScale(22)} color="#23238E" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <Ionicons name="information-circle" size={moderateScale(20)} color="#23238E" />
            <Text style={styles.noticeText}>
              Click 'Continue' to add these medicines to your cart and proceed with the order.
            </Text>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={async () => {
              // Add quoted medicines to pharmacy cart
              const { addToCart } = require('../../Utils/firebasePharmacyStorage');
              for (const med of medicines) {
                await addToCart({
                  id: med.id,
                  name: med.name,
                  price: med.price,
                  qty: med.qty,
                  desc: 'Prescription Medicine'
                });
              }
              navigation.navigate('PharmacyCartScreen');
            }}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: scale(40),
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#222',
  },
  infoBox: {
    padding: moderateScale(20),
    backgroundColor: '#fff',
    marginBottom: verticalScale(10),
  },
  infoTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#23238E',
  },
  infoSubtitle: {
    fontSize: moderateScale(14),
    color: '#666',
    marginTop: verticalScale(8),
    lineHeight: moderateScale(20),
  },
  section: {
    padding: scale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(12),
  },
  medicinesCard: {
    backgroundColor: '#fff',
    borderRadius: scale(20),
    padding: scale(20),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  listHeader: {
    flexDirection: 'row',
    marginBottom: verticalScale(10),
  },
  headerCol: { flex: 2, fontSize: moderateScale(13), color: '#888', fontWeight: 'bold' },
  headerColCenter: { flex: 1, fontSize: moderateScale(13), color: '#888', fontWeight: 'bold', textAlign: 'center' },
  headerColEnd: { flex: 1, fontSize: moderateScale(13), color: '#888', fontWeight: 'bold', textAlign: 'right' },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: verticalScale(12),
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  nameCol: { flex: 2, fontSize: moderateScale(15), color: '#222', fontWeight: '600' },
  qtyCol: { flex: 1, fontSize: moderateScale(15), color: '#666', textAlign: 'center' },
  priceCol: { flex: 1, fontSize: moderateScale(15), color: '#23238E', fontWeight: 'bold', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
  },
  totalLabel: { fontSize: moderateScale(16), fontWeight: 'bold', color: '#222' },
  totalValue: { fontSize: moderateScale(18), fontWeight: 'bold', color: '#23238E' },
  downloadSection: {
    paddingHorizontal: wp(4),
  },
  pdfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: scale(16),
    padding: scale(16),
  },
  pdfIconBox: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(12),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfInfo: {
    flex: 1,
    marginLeft: scale(15),
  },
  pdfName: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: '#222',
  },
  pdfSize: {
    fontSize: moderateScale(12),
    color: '#888',
    marginTop: verticalScale(2),
  },
  downloadIconBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
    margin: scale(16),
    padding: scale(16),
    borderRadius: scale(12),
    gap: scale(12),
    alignItems: 'center',
  },
  noticeText: {
    flex: 1,
    fontSize: moderateScale(12),
    color: '#666',
    lineHeight: moderateScale(18),
  },
  footer: {
    padding: scale(20),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  continueBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(16),
    paddingVertical: verticalScale(18),
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
});

