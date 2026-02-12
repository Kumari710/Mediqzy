import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { pick, isCancel, types } from '@react-native-documents/picker';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { savePrescription } from '../../Utils/firebasePrescriptionStorage';

export default function UploadPrescriptionScreen({ navigation }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const pickDocument = async () => {
    try {
      const res = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: true,
      });
      // res is an array of selected files
      const newFiles = res.map((file, index) => ({
        id: Date.now() + index,
        name: file.name || 'Document',
        size: file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'Unknown',
        uri: file.uri,
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    } catch (err) {
      if (isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to pick document. Please try again.');
        console.log('DocumentPicker Error: ', err);
      }
    }
  };

  const removeFile = (id) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      Alert.alert('No Files', 'Please upload at least one prescription file.');
      return;
    }

    try {
      // Save prescription to Firebase
      const result = await savePrescription(uploadedFiles);
      if (result.success) {
        navigation.navigate('PrescriptionSuccessScreen');
      } else {
        Alert.alert('Error', result.error || 'Failed to submit prescription');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during submission');
      console.error('Prescription submission failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Upload Prescription</Text>

        <View style={{ width: scale(40) }} />
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: hp(15) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Upload Prescription</Text>
          <Text style={styles.sectionDesc}>
            Upload the prescription document provided by your doctor
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Upload high resolution scans</Text>
            <Text style={styles.bulletItem}>
              • Upload formats – PDF, JPEG, PNG
            </Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.guidelinesLink}>Read Upload Guidelines</Text>
          </TouchableOpacity>
        </View>

        {/* Documents Card */}
        <View style={styles.documentsCard}>
          <Text style={styles.documentsTitle}>Documents</Text>

          {/* Upload Area */}
          <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
            <Ionicons
              name="cloud-upload-outline"
              size={moderateScale(36)}
              color="#23238E"
            />
            <Text style={styles.uploadText}>Upload your files here</Text>
          </TouchableOpacity>

          {/* Uploaded Documents */}
          <Text style={styles.uploadedTitle}>Uploaded documents</Text>

          {uploadedFiles.length === 0 ? (
            <Text style={styles.noFilesText}>No files uploaded yet</Text>
          ) : (
            uploadedFiles.map((file) => (
              <View key={file.id} style={styles.fileRow}>
                <Image
                  source={require('../../images/records.png')}
                  style={styles.pdfIcon}
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.fileSize}>{file.size}</Text>
                </View>

                <TouchableOpacity onPress={() => removeFile(file.id)} style={styles.trashBtn}>
                  <Ionicons name="trash-outline" size={moderateScale(22)} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
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
  infoSection: {
    paddingHorizontal: wp(4),
    paddingTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(8),
  },
  sectionDesc: {
    fontSize: moderateScale(14),
    color: '#555',
    marginBottom: verticalScale(8),
  },
  bulletList: {
    marginBottom: verticalScale(8),
  },
  bulletItem: {
    fontSize: moderateScale(14),
    color: '#555',
    marginBottom: verticalScale(4),
  },
  guidelinesLink: {
    fontSize: moderateScale(14),
    color: '#23238E',
    textDecorationLine: 'underline',
  },
  documentsCard: {
    backgroundColor: '#EEF4FF',
    marginHorizontal: wp(4),
    marginTop: verticalScale(24),
    padding: scale(16),
    borderRadius: scale(16),
  },
  documentsTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(16),
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#23238E',
    borderStyle: 'dashed',
    borderRadius: scale(12),
    backgroundColor: '#fff',
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  uploadText: {
    fontSize: moderateScale(14),
    color: '#23238E',
    marginTop: verticalScale(8),
  },
  uploadedTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#222',
    marginBottom: verticalScale(12),
  },
  noFilesText: {
    fontSize: moderateScale(14),
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: verticalScale(10),
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: scale(12),
    borderRadius: scale(12),
    marginBottom: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pdfIcon: {
    width: scale(40),
    height: scale(40),
    resizeMode: 'contain',
    marginRight: scale(12),
  },
  fileName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#222',
  },
  fileSize: {
    fontSize: moderateScale(12),
    color: '#888',
    marginTop: verticalScale(2),
  },
  trashBtn: {
    padding: scale(8),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  submitBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(12),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
});

