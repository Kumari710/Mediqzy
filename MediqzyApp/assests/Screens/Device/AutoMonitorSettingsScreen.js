import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const monitorOptions = [
  { label: 'Auto Heart Rate Monitor', image: require('../../images/heart.png') },
  { label: 'Auto Temperature Monitor', image: require('../../images/temp.png') },
  { label: 'Auto SpO₂ Monitor', image: require('../../images/Monitor.png') },
];

const intervals = ['1 min', '5 mins', '10 mins', '15 mins', '30 mins'];

export default function AutoMonitorSettingsScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [intervalIdx, setIntervalIdx] = useState(1);

  const openModal = (monitor) => {
    setSelectedMonitor(monitor);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const nextInterval = () =>
    setIntervalIdx((prev) => (prev + 1) % intervals.length);

  const prevInterval = () =>
    setIntervalIdx((prev) => (prev - 1 + intervals.length) % intervals.length);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Monitor Settings</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Health Monitoring</Text>
          <Text style={styles.description}>
            Configure how often your device should automatically monitor your vital signs.
          </Text>

          {/* Monitor List */}
          <View style={styles.cardList}>
            {monitorOptions.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.card}
                onPress={() => openModal(option)}
                activeOpacity={0.8}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.iconCircle}>
                    <Image source={option.image} style={styles.cardIcon} resizeMode="contain" />
                  </View>
                  <Text style={styles.cardText}>{option.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={moderateScale(20)} color="#888" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={closeModal} style={styles.modalBack}>
                  <Ionicons name="arrow-back" size={moderateScale(22)} color="#333" />
                </TouchableOpacity>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedMonitor?.label}
                </Text>
              </View>

              {/* Icon */}
              {selectedMonitor?.image && (
                <View style={styles.modalIconContainer}>
                  <Image
                    source={selectedMonitor.image}
                    style={styles.modalIcon}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Interval Selection */}
              <Text style={styles.modalSubtitle}>Set Monitoring Interval</Text>

              <View style={styles.intervalPicker}>
                <Pressable style={styles.arrowBtn} onPress={prevInterval}>
                  <Ionicons name="chevron-back" size={moderateScale(26)} color="#666" />
                </Pressable>

                <View style={styles.intervalTextWrap}>
                  <Text style={styles.intervalText}>
                    {intervals[intervalIdx]}
                  </Text>
                </View>

                <Pressable style={styles.arrowBtn} onPress={nextInterval}>
                  <Ionicons name="chevron-forward" size={moderateScale(26)} color="#666" />
                </Pressable>
              </View>

              {/* Confirm */}
              <TouchableOpacity style={styles.confirmBtn} onPress={closeModal} activeOpacity={0.8}>
                <Text style={styles.confirmText}>Confirm Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(4),
    paddingBottom: hp(4),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#23238E',
    marginBottom: verticalScale(8),
  },
  description: {
    fontSize: moderateScale(15),
    color: '#666',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(32),
  },
  cardList: {
    gap: verticalScale(16),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(16),
  },
  cardIcon: {
    width: scale(28),
    height: scale(28),
  },
  cardText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: scale(24),
    padding: scale(24),
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(20),
  },
  modalBack: {
    padding: scale(4),
    marginRight: scale(12),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalIconContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(20),
  },
  modalIcon: {
    width: scale(50),
    height: scale(50),
  },
  modalSubtitle: {
    fontSize: moderateScale(14),
    color: '#666',
    marginBottom: verticalScale(16),
  },
  intervalPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8F9FB',
    borderRadius: scale(16),
    padding: scale(10),
    marginBottom: verticalScale(32),
  },
  intervalTextWrap: {
    flex: 1,
    alignItems: 'center',
  },
  intervalText: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#23238E',
  },
  arrowBtn: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: '#23238E',
    paddingVertical: verticalScale(16),
    borderRadius: scale(16),
    alignItems: 'center',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
});
