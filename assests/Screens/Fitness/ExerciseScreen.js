import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import LinearGradient from 'react-native-linear-gradient';

// Default exercises with adjustable settings
const DEFAULT_EXERCISES = [
  { id: 'Walking', icon: 'walk-outline', color: '#4CD964', image: require("../../images/girlRunning.png"), kcal: 150, intensity: 'Low', duration: 30, enabled: true },
  { id: 'Running', icon: 'fitness-outline', color: '#FF3B30', image: require("../../images/running.png"), kcal: 600, intensity: 'High', duration: 20, enabled: true },
  { id: 'Cycling', icon: 'bicycle-outline', color: '#007AFF', image: require("../../images/cycling.png"), kcal: 450, intensity: 'Medium', duration: 45, enabled: true },
  { id: 'Yoga', icon: 'body-outline', color: '#FF9500', image: require("../../images/girlRunning.png"), kcal: 200, intensity: 'Low', duration: 60, enabled: true },
  { id: 'Swimming', icon: 'water-outline', color: '#5AC8FA', image: require("../../images/running.png"), kcal: 500, intensity: 'High', duration: 30, enabled: false },
  { id: 'Strength', icon: 'barbell-outline', color: '#AF52DE', image: require("../../images/girlRunning.png"), kcal: 350, intensity: 'High', duration: 45, enabled: false },
];

const INTENSITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function ExerciseScreen({ navigation, route }) {
  const [exercises, setExercises] = useState(DEFAULT_EXERCISES);
  const [activeTab, setActiveTab] = useState(route.params?.activeTab || "Walking");
  const [showSettings, setShowSettings] = useState(false);
  const [showFilterSettings, setShowFilterSettings] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  // Recent tracking history
  const [recentWorkouts, setRecentWorkouts] = useState([
    { id: 1, type: 'Running', duration: '25 min', calories: 280, date: 'Today, 8:30 AM', completed: true },
    { id: 2, type: 'Yoga', duration: '45 min', calories: 150, date: 'Yesterday, 6:00 PM', completed: true },
    { id: 3, type: 'Walking', duration: '30 min', calories: 120, date: 'Jan 29, 7:00 AM', completed: true },
  ]);

  const enabledExercises = exercises.filter(e => e.enabled);
  const currentExercise = exercises.find(e => e.id === activeTab) || enabledExercises[0];

  // Toggle exercise filter
  const toggleExerciseFilter = (exerciseId) => {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId ? { ...e, enabled: !e.enabled } : e
    ));
  };

  // Update exercise settings
  const updateExerciseSettings = (exerciseId, field, value) => {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId ? { ...e, [field]: value } : e
    ));
  };

  // Open settings for specific exercise
  const openExerciseSettings = (exercise) => {
    setEditingExercise({ ...exercise });
    setShowSettings(true);
  };

  // Save exercise settings
  const saveExerciseSettings = () => {
    if (editingExercise) {
      setExercises(prev => prev.map(e =>
        e.id === editingExercise.id ? editingExercise : e
      ));
      setShowSettings(false);
      setEditingExercise(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#1A1A2E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Tracker</Text>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilterSettings(true)}
          >
            <Ionicons name="options-outline" size={moderateScale(22)} color="#23238E" />
          </TouchableOpacity>
        </View>

        {/* Filter Categories - Adjustable */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {enabledExercises.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.categoryBtn, activeTab === item.id && styles.categoryBtnActive]}
                onPress={() => setActiveTab(item.id)}
                onLongPress={() => openExerciseSettings(item)}
              >
                <Ionicons
                  name={item.icon}
                  size={moderateScale(20)}
                  color={activeTab === item.id ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.categoryText, activeTab === item.id && styles.categoryTextActive]}>
                  {item.id}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addCategoryBtn}
              onPress={() => setShowFilterSettings(true)}
            >
              <Ionicons name="add" size={moderateScale(20)} color="#23238E" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Visual */}
          <View style={styles.visualCard}>
            <LinearGradient
              colors={['#F8FAFC', '#F1F5F9']}
              style={styles.gradientBg}
            >
              <Image
                source={currentExercise.image}
                style={styles.mainImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          {/* Exercise Info */}
          <View style={styles.infoSection}>
            <View style={styles.titleRow}>
              <Text style={styles.exerciseTitle}>{currentExercise.id}</Text>
              <TouchableOpacity
                style={styles.settingsIconBtn}
                onPress={() => openExerciseSettings(currentExercise)}
              >
                <Ionicons name="settings-outline" size={moderateScale(20)} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.exerciseDesc}>
              A great way to boost your cardiovascular health and burn calories. Customize your workout settings by tapping the gear icon.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="flame" size={moderateScale(20)} color="#FF3B30" />
                <Text style={styles.statValue}>{currentExercise.kcal} kcal/hr</Text>
                <Text style={styles.statLabel}>Burn Rate</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="speedometer" size={moderateScale(20)} color="#007AFF" />
                <Text style={styles.statValue}>{currentExercise.intensity}</Text>
                <Text style={styles.statLabel}>Intensity</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="time" size={moderateScale(20)} color="#FF9500" />
                <Text style={styles.statValue}>{currentExercise.duration} min</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
            </View>
          </View>

          {/* Recent Workouts - Tracking Check */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentWorkouts.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutIcon}>
                  <Ionicons
                    name={exercises.find(e => e.id === workout.type)?.icon || 'fitness'}
                    size={moderateScale(22)}
                    color="#23238E"
                  />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutType}>{workout.type}</Text>
                  <Text style={styles.workoutDate}>{workout.date}</Text>
                </View>
                <View style={styles.workoutStats}>
                  <Text style={styles.workoutDuration}>{workout.duration}</Text>
                  <Text style={styles.workoutCalories}>{workout.calories} kcal</Text>
                </View>
                {workout.completed && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={moderateScale(24)} color="#4CD964" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Start Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate('CountDown', { activeTab })}
          >
            <View style={styles.playIconBox}>
              <Ionicons name="play" size={moderateScale(28)} color="#FFFFFF" />
            </View>
            <Text style={styles.startBtnText}>Start {activeTab} Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Settings Modal */}
        <Modal
          visible={showSettings}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingExercise?.id} Settings
                </Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <Ionicons name="close" size={moderateScale(24)} color="#64748B" />
                </TouchableOpacity>
              </View>

              {editingExercise && (
                <ScrollView style={styles.modalBody}>
                  {/* Duration Setting */}
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Target Duration (min)</Text>
                    <View style={styles.durationControl}>
                      <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={() => setEditingExercise(prev => ({ ...prev, duration: Math.max(5, prev.duration - 5) }))}
                      >
                        <Ionicons name="remove" size={moderateScale(20)} color="#23238E" />
                      </TouchableOpacity>
                      <Text style={styles.durationValue}>{editingExercise.duration}</Text>
                      <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={() => setEditingExercise(prev => ({ ...prev, duration: prev.duration + 5 }))}
                      >
                        <Ionicons name="add" size={moderateScale(20)} color="#23238E" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Intensity Setting */}
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Intensity Level</Text>
                    <View style={styles.intensityOptions}>
                      {INTENSITY_OPTIONS.map((level) => (
                        <TouchableOpacity
                          key={level}
                          style={[
                            styles.intensityBtn,
                            editingExercise.intensity === level && styles.intensityBtnActive
                          ]}
                          onPress={() => setEditingExercise(prev => ({ ...prev, intensity: level }))}
                        >
                          <Text style={[
                            styles.intensityText,
                            editingExercise.intensity === level && styles.intensityTextActive
                          ]}>{level}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Calorie Setting */}
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Calories per Hour</Text>
                    <View style={styles.calorieInput}>
                      <TextInput
                        style={styles.inputField}
                        value={editingExercise.kcal.toString()}
                        onChangeText={(val) => setEditingExercise(prev => ({ ...prev, kcal: parseInt(val) || 0 }))}
                        keyboardType="number-pad"
                      />
                      <Text style={styles.inputUnit}>kcal/hr</Text>
                    </View>
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={saveExerciseSettings}>
                <Text style={styles.saveBtnText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Filter Settings Modal */}
        <Modal
          visible={showFilterSettings}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilterSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Manage Exercise Filters</Text>
                <TouchableOpacity onPress={() => setShowFilterSettings(false)}>
                  <Ionicons name="close" size={moderateScale(24)} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={styles.filterHint}>
                  Toggle exercises to show/hide them in the filter bar
                </Text>

                {exercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.filterItem}
                    onPress={() => toggleExerciseFilter(exercise.id)}
                  >
                    <View style={[styles.filterIcon, { backgroundColor: exercise.color + '20' }]}>
                      <Ionicons name={exercise.icon} size={moderateScale(22)} color={exercise.color} />
                    </View>
                    <View style={styles.filterInfo}>
                      <Text style={styles.filterName}>{exercise.id}</Text>
                      <Text style={styles.filterDetails}>
                        {exercise.kcal} kcal/hr • {exercise.intensity}
                      </Text>
                    </View>
                    <View style={[styles.toggleSwitch, exercise.enabled && styles.toggleSwitchActive]}>
                      <View style={[styles.toggleKnob, exercise.enabled && styles.toggleKnobActive]} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.saveBtn} onPress={() => setShowFilterSettings(false)}>
                <Text style={styles.saveBtnText}>Done</Text>
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
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: '#1A1A2E',
  },
  filterBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    paddingVertical: hp(2),
  },
  categoryScroll: {
    paddingHorizontal: wp(6),
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: hp(1.2),
    borderRadius: scale(25),
    backgroundColor: '#F8FAFC',
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBtnActive: {
    backgroundColor: '#23238E',
    borderColor: '#23238E',
  },
  categoryText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#64748B',
    marginLeft: scale(8),
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  addCategoryBtn: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  scrollContent: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(15),
  },
  visualCard: {
    height: hp(28),
    width: '100%',
    borderRadius: scale(24),
    overflow: 'hidden',
    marginBottom: hp(3),
  },
  gradientBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: '70%',
    height: '70%',
  },
  infoSection: {
    paddingHorizontal: wp(2),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  exerciseTitle: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: '#1A1A2E',
  },
  settingsIconBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(10),
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseDesc: {
    fontSize: moderateScale(14),
    color: '#64748B',
    lineHeight: moderateScale(21),
    marginBottom: hp(3),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: verticalScale(6),
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: '#94A3B8',
    marginTop: verticalScale(2),
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E2E8F0',
  },
  // Recent Workouts Section
  recentSection: {
    marginTop: hp(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A1A2E',
  },
  viewAllText: {
    fontSize: moderateScale(14),
    color: '#23238E',
    fontWeight: '600',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(14),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  workoutIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(14),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  workoutType: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#1A1A2E',
  },
  workoutDate: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
    marginTop: verticalScale(2),
  },
  workoutStats: {
    alignItems: 'flex-end',
    marginRight: scale(8),
  },
  workoutDuration: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1A1A2E',
  },
  workoutCalories: {
    fontSize: moderateScale(12),
    color: '#FF3B30',
    marginTop: verticalScale(2),
  },
  checkBadge: {
    marginLeft: scale(4),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: wp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  startBtn: {
    backgroundColor: '#23238E',
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(8),
    borderRadius: scale(40),
    shadowColor: '#23238E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  playIconBox: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(17),
    fontWeight: '700',
    marginLeft: scale(14),
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: hp(70),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1A1A2E',
  },
  modalBody: {
    padding: scale(20),
  },
  // Settings Items
  settingItem: {
    marginBottom: hp(3),
  },
  settingLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#64748B',
    marginBottom: hp(1.5),
  },
  durationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(16),
    padding: scale(8),
  },
  controlBtn: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  durationValue: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: '#23238E',
    marginHorizontal: scale(24),
  },
  intensityOptions: {
    flexDirection: 'row',
    gap: scale(10),
  },
  intensityBtn: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: scale(12),
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  intensityBtnActive: {
    backgroundColor: '#23238E',
    borderColor: '#23238E',
  },
  intensityText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#64748B',
  },
  intensityTextActive: {
    color: '#FFFFFF',
  },
  calorieInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: scale(12),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputField: {
    flex: 1,
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#1A1A2E',
    paddingVertical: hp(1.5),
  },
  inputUnit: {
    fontSize: moderateScale(14),
    color: '#94A3B8',
  },
  saveBtn: {
    backgroundColor: '#23238E',
    margin: scale(20),
    paddingVertical: hp(2),
    borderRadius: scale(14),
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  // Filter Modal Styles
  filterHint: {
    fontSize: moderateScale(13),
    color: '#94A3B8',
    marginBottom: hp(2),
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterIcon: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterInfo: {
    flex: 1,
    marginLeft: scale(12),
  },
  filterName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#1A1A2E',
  },
  filterDetails: {
    fontSize: moderateScale(12),
    color: '#94A3B8',
    marginTop: verticalScale(2),
  },
  toggleSwitch: {
    width: scale(50),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: '#E2E8F0',
    padding: scale(3),
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#4CD964',
  },
  toggleKnob: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});
