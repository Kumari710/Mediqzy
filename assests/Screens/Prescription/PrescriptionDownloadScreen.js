import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function PrescriptionDownloadScreen({ navigation, route }) {
  const { type = 'Prescription' } = route?.params || {};
  const isLab = type.toLowerCase().includes('lab') || type.toLowerCase().includes('report');

  const handleDownload = () => {
    // Handle PDF download
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(22)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isLab ? 'Lab Report' : 'Prescription'}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Download {isLab ? 'Lab Report' : 'Prescription'}</Text>
            <View style={styles.imageContainer}>
              <Image
                source={require('../../images/DownloadReport.png')}
                style={styles.prescriptionImg}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
              <Ionicons name="download-outline" size={moderateScale(18)} color="#fff" />
              <Text style={styles.downloadBtnText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backBtn: {
    width: scale(36),
    height: scale(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: '#222',
  },
  placeholder: { width: scale(36) },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: wp(8),
    alignItems: 'center',
    width: '100%',
    maxWidth: scale(300),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: hp(3),
  },
  imageContainer: {
    marginBottom: hp(3),
  },
  prescriptionImg: {
    width: scale(100),
    height: scale(120),
  },
  downloadBtn: {
    flexDirection: 'row',
    backgroundColor: '#23238E',
    borderRadius: scale(12),
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontWeight: 'bold',
  },
});
