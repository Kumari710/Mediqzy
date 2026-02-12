import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { onDataChange } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function SelectPatientScreen({ navigation, route }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const appointmentData = route?.params?.appointmentData || {};

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const unsubscribe = onDataChange(`users/${user.uid}/patients`, (data) => {
      if (data) {
        const patientList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));

        // Add Self
        const selfUser = {
          id: user.uid || 'self',
          name: user.displayName || 'Myself',
          age: '25', // Default or fetch if available
          gender: 'Male', // Default or fetch
          relation: 'Self',
          phone: user.phoneNumber || '',
          relationColor: '#4CAF50'
        };

        setPatients([selfUser, ...patientList]);
      } else {
        // Just self if no others
        const selfUser = {
          id: user.uid || 'self',
          name: user.displayName || 'Myself',
          age: '25',
          gender: 'Male',
          relation: 'Self',
          phone: user.phoneNumber || '',
          relationColor: '#4CAF50'
        };
        setPatients([selfUser]);
      }
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const isLabFlow = route?.params?.isLabFlow || false;

  // Debug log
  console.log('[SelectPatient] isLabFlow:', isLabFlow);
  console.log('[SelectPatient] appointmentData:', JSON.stringify(appointmentData, null, 2));

  const handleSelectPatient = () => {
    if (selectedPatient) {
      const patient = patients.find(p => p.id === selectedPatient);

      if (isLabFlow) {
        navigation.navigate('LabPaymentScreen', {
          bookingDetails: {
            ...appointmentData,
            patient: {
              id: patient.id,
              name: patient.name,
              age: patient.age,
              gender: patient.gender,
              relation: patient.relation,
              phone: patient.phone || ''
            }
          }
        });
      } else {
        navigation.navigate('BookingConfirmScreen', {
          appointment: {
            ...appointmentData,
            patientName: patient.name,
            patientId: patient.id,
            patientPhone: patient.phone || ''
          }
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Patient</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: hp(12) }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Patients</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddPatientScreen')}
          >
            <Ionicons name="add-circle" size={moderateScale(20)} color="#23238E" />
            <Text style={styles.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#23238E" style={{ marginTop: 50 }} />
        ) : patients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={moderateScale(60)} color="#ccc" />
            <Text style={styles.emptyText}>No patients found</Text>
            <TouchableOpacity
              style={styles.addInitialBtn}
              onPress={() => navigation.navigate('AddPatientScreen')}
            >
              <Text style={styles.addInitialBtnText}>Add First Patient</Text>
            </TouchableOpacity>
          </View>
        ) : (
          patients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={[styles.patientCard, selectedPatient === patient.id && styles.patientCardSelected]}
              onPress={() => setSelectedPatient(patient.id)}
            >
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>{patient.initial || patient.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.patientNameRow}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      navigation.navigate('AddPatientScreen', { patient });
                    }}
                    style={styles.editIconBtn}
                  >
                    <Ionicons name="create-outline" size={moderateScale(18)} color="#23238E" />
                  </TouchableOpacity>
                </View>
                {/* <Text style={styles.patientAge}>{patient.age} years • {patient.gender}</Text> */}
                {/* {patient.phone && <Text style={styles.patientAge}>{patient.phone}</Text>} */}
              </View>
              <View style={[styles.relationBadge, { backgroundColor: patient.relationColor || '#23238E' }]}>
                <Text style={styles.relationBadgeText}>{patient.relation}</Text>
              </View>
              <View style={[styles.checkbox, selectedPatient === patient.id && styles.checkboxSelected]}>
                {selectedPatient === patient.id && (
                  <Ionicons name="checkmark" size={moderateScale(16)} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.selectBtn, !selectedPatient && styles.selectBtnDisabled]}
          onPress={handleSelectPatient}
          disabled={!selectedPatient}
        >
          <Text style={styles.selectBtnText}>Select Patient</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hp(2),
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: wp(4),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#222',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#EEF4FF',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: scale(20),
  },
  addBtnText: {
    fontSize: moderateScale(13),
    color: '#23238E',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(60),
    paddingHorizontal: wp(10),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#888',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(24),
  },
  addInitialBtn: {
    backgroundColor: '#23238E',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: scale(8),
  },
  addInitialBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: moderateScale(14),
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    marginBottom: verticalScale(10), // Reduced margin
    padding: scale(12), // Reduced padding
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  patientCardSelected: {
    borderColor: '#23238E',
    backgroundColor: '#F5F7FF',
  },
  patientAvatar: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: '#F0F0FF',
    borderWidth: 1,
    borderColor: '#23238E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  patientAvatarText: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: '#23238E',
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: scale(4),
  },
  editIconBtn: {
    padding: scale(4),
  },
  patientName: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#222',
  },
  patientAge: {
    fontSize: moderateScale(13),
    color: '#666',
    marginTop: verticalScale(2),
  },
  relationBadge: {
    borderRadius: scale(4),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    marginRight: scale(12),
  },
  relationBadgeText: {
    color: '#fff',
    fontSize: moderateScale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  checkbox: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#23238E',
    borderColor: '#23238E',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: scale(16),
    paddingBottom: hp(4),
  },
  selectBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(8),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  selectBtnDisabled: {
    backgroundColor: '#23238E',
    opacity: 0.7,
  },
  selectBtnText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
