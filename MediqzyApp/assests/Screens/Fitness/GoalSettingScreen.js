import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import Slider from "@react-native-community/slider";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { saveActivityGoals, getActivityGoals } from '../../Utils/firebaseActivityStorage';

export default function GoalSettingsScreen({ navigation }) {
  const [goals, setGoals] = useState({
    steps: 8000,
    calories: 500,
    distance: 5,
    sleep: 8,
    activeMinutes: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const savedGoals = await getActivityGoals();
      if (savedGoals) {
        setGoals(savedGoals);
      }
    } catch (error) {
      console.log('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = (key, value) => {
    setGoals(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await saveActivityGoals(goals);
      if (success) {
        Alert.alert('Success', 'Your daily goals have been updated.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#23238E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Goals</Text>
          <View style={{ width: scale(40) }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Set Your Targets</Text>
          <Text style={styles.subtitle}>Adjust your daily goals to stay motivated and track your progress effectively.</Text>

          {/* Goal Cards */}
          <GoalCard
            icon="footsteps"
            color="#FF9500"
            label="Daily Steps"
            value={goals.steps}
            unit="steps"
            min={1000}
            max={20000}
            step={500}
            onValueChange={(val) => updateGoal('steps', val)}
          />

          <GoalCard
            icon="flame"
            color="#FF3B30"
            label="Active Calories"
            value={goals.calories}
            unit="kcal"
            min={100}
            max={2000}
            step={50}
            onValueChange={(val) => updateGoal('calories', val)}
          />

          <GoalCard
            icon="navigate"
            color="#007AFF"
            label="Walking Distance"
            value={goals.distance}
            unit="km"
            min={1}
            max={20}
            step={0.5}
            onValueChange={(val) => updateGoal('distance', val)}
          />

          <GoalCard
            icon="moon"
            color="#5856D6"
            label="Sleep Duration"
            value={goals.sleep}
            unit="hrs"
            min={4}
            max={12}
            step={0.5}
            onValueChange={(val) => updateGoal('sleep', val)}
          />

          <GoalCard
            icon="time"
            color="#4CD964"
            label="Active Minutes"
            value={goals.activeMinutes}
            unit="min"
            min={10}
            max={180}
            step={5}
            onValueChange={(val) => updateGoal('activeMinutes', val)}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Apply Goals</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const GoalCard = ({ icon, color, label, value, unit, min, max, step, onValueChange }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={moderateScale(24)} color={color} />
      </View>
      <View style={styles.cardTextInfo}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={[styles.cardValue, { color: color }]}>{value} <Text style={styles.cardUnit}>{unit}</Text></Text>
      </View>
    </View>
    <Slider
      style={styles.slider}
      minimumValue={min}
      maximumValue={max}
      step={step}
      value={value}
      onValueChange={onValueChange}
      minimumTrackTintColor={color}
      maximumTrackTintColor="#E2E8F0"
      thumbTintColor={color}
    />
    <View style={styles.rangeLabels}>
      <Text style={styles.rangeText}>{min}{unit}</Text>
      <Text style={styles.rangeText}>{max}{unit}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A1A2E',
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingTop: hp(3),
    paddingBottom: hp(4),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#64748B',
    lineHeight: moderateScale(20),
    marginBottom: hp(4),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(20),
    padding: scale(20),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  iconBox: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextInfo: {
    marginLeft: scale(15),
    flex: 1,
  },
  cardLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#64748B',
    marginBottom: verticalScale(4),
  },
  cardValue: {
    fontSize: moderateScale(20),
    fontWeight: '700',
  },
  cardUnit: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#94A3B8',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(2),
  },
  rangeText: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
    fontWeight: '500',
  },
  footer: {
    padding: wp(6),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveButton: {
    backgroundColor: '#23238E',
    borderRadius: scale(30),
    paddingVertical: hp(2),
    alignItems: 'center',
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
