import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function PatientDetailsScreen({ navigation }) {
  const [selected, setSelected] = useState('Vijay');
  const [problem, setProblem] = useState('');
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={moderateScale(26)} color="#23238E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={{ width: scale(32) }} />
      </View>
      <View style={styles.innerWrap}>
        <Text style={styles.chooseTitle}>Choose Patient</Text>
        <Text style={styles.chooseSub}>Who’re you booking an appointment for?</Text>
        <TouchableOpacity style={styles.selectBox}>
          <Text style={styles.selectText}>{selected}</Text>
          <Ionicons name="chevron-down" size={moderateScale(22)} color="#888" />
        </TouchableOpacity>
        {/* Patient Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Patient Details</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Patient Name</Text><Text style={styles.detailColon}>:</Text><Text style={styles.detailValue}>Vijay</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Relation</Text><Text style={styles.detailColon}>:</Text><Text style={styles.detailValue}>Self</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Date of Birth</Text><Text style={styles.detailColon}>:</Text><Text style={styles.detailValue}>05/06/1987</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Age</Text><Text style={styles.detailColon}>:</Text><Text style={styles.detailValue}>50 yrs</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Email</Text><Text style={styles.detailColon}>:</Text><Text style={styles.detailValue}>Vijay@gmail.com</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Sex</Text><Text style={styles.detailColon}>:</Text><Text style={styles.detailValue}>Male</Text></View>
        </View>
        {/* Problem Input */}
        <TextInput
          style={styles.problemInput}
          placeholder="Write your problem"
          placeholderTextColor="#B0B0B0"
          value={problem}
          onChangeText={setProblem}
          multiline
        />
        {/* Continue Button */}
        <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('BookingSuccessScreen')}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6FB' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: hp(5), paddingBottom: hp(2), paddingHorizontal: wp(4), backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 2 },
  backBtn: { width: scale(32), height: scale(32), alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: moderateScale(22), fontWeight: '700', color: '#444', textAlign: 'left', marginLeft: scale(8) },
  innerWrap: { flex: 1, paddingHorizontal: wp(4), paddingTop: verticalScale(12) },
  chooseTitle: { fontSize: moderateScale(24), color: '#23238E', fontWeight: '700', marginTop: verticalScale(8), marginLeft: scale(8) },
  chooseSub: { fontSize: moderateScale(16), color: '#888', marginLeft: scale(8), marginBottom: verticalScale(18) },
  selectBox: { backgroundColor: '#fff', borderRadius: scale(10), marginHorizontal: scale(4), padding: scale(16), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1, shadowColor: '#23238E', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, marginBottom: verticalScale(28) },
  selectText: { fontSize: moderateScale(18), color: '#222', fontWeight: '600' },
  detailsCard: { backgroundColor: '#fff', borderRadius: scale(14), borderWidth: 1, borderColor: '#D1D6F3', padding: scale(18), marginBottom: verticalScale(28), shadowColor: '#23238E', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  detailsTitle: { color: '#23238E', fontSize: moderateScale(18), fontWeight: '700', textAlign: 'center', marginBottom: verticalScale(12) },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(4) },
  detailLabel: { flex: 1.2, fontSize: moderateScale(15), color: '#444', fontWeight: '500' },
  detailColon: { width: scale(12), textAlign: 'center', color: '#444', fontWeight: '600' },
  detailValue: { flex: 2, fontSize: moderateScale(15), color: '#222', fontWeight: '700' },
  problemInput: { backgroundColor: '#fff', borderRadius: scale(10), minHeight: verticalScale(80), padding: scale(16), fontSize: moderateScale(16), color: '#222', marginBottom: verticalScale(32), borderWidth: 1, borderColor: '#E0E0E0' },
  continueBtn: { backgroundColor: '#23238E', borderRadius: scale(30), marginHorizontal: scale(4), marginBottom: hp(3), paddingVertical: verticalScale(18), alignItems: 'center', justifyContent: 'center' },
  continueText: { color: '#fff', fontSize: moderateScale(18), fontWeight: '700' },
});
