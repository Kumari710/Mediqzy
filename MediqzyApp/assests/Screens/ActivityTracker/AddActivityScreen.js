import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import {
    getDailyActivity,
    saveDailyActivity,
    getTodayDate,
    disableMockData,
} from '../../Utils/firebaseActivityStorage';

const AddActivityScreen = ({ navigation, route }) => {
    const activityType = route?.params?.type || 'steps';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [currentData, setCurrentData] = useState(null);
    const [inputValues, setInputValues] = useState({});

    const activityConfigs = {
        steps: {
            title: 'Add Steps',
            icon: 'footsteps',
            color: '#FF8C42',
            fields: [
                { key: 'steps', label: 'Steps Count', placeholder: '0', unit: 'steps', keyboardType: 'numeric' },
            ],
            description: 'Enter the number of steps you walked today.',
        },
        calories: {
            title: 'Add Calories',
            icon: 'flame',
            color: '#E74C3C',
            fields: [
                { key: 'activeCalories', label: 'Active Calories', placeholder: '0', unit: 'kcal', keyboardType: 'numeric' },
                { key: 'restingCalories', label: 'Resting Calories', placeholder: '0', unit: 'kcal', keyboardType: 'numeric' },
            ],
            description: 'Enter calories burned through activity and at rest.',
        },
        distance: {
            title: 'Add Distance',
            icon: 'navigate',
            color: '#3498DB',
            fields: [
                { key: 'walkingDistance', label: 'Walking', placeholder: '0.0', unit: 'km', keyboardType: 'decimal-pad' },
                { key: 'runningDistance', label: 'Running', placeholder: '0.0', unit: 'km', keyboardType: 'decimal-pad' },
                { key: 'cyclingDistance', label: 'Cycling', placeholder: '0.0', unit: 'km', keyboardType: 'decimal-pad' },
            ],
            description: 'Enter distances for each activity type.',
        },
        heartRate: {
            title: 'Add Heart Rate',
            icon: 'heart',
            color: '#E91E63',
            fields: [
                { key: 'currentHeartRate', label: 'Current Heart Rate', placeholder: '72', unit: 'bpm', keyboardType: 'numeric' },
            ],
            description: 'Enter your current heart rate reading.',
        },
        sleep: {
            title: 'Add Sleep Data',
            icon: 'moon',
            color: '#9B59B6',
            fields: [
                { key: 'sleepHours', label: 'Total Sleep', placeholder: '0.0', unit: 'hours', keyboardType: 'decimal-pad' },
                { key: 'sleepQuality', label: 'Sleep Quality', placeholder: '0', unit: '%', keyboardType: 'numeric' },
                { key: 'deepSleep', label: 'Deep Sleep', placeholder: '0.0', unit: 'hours', keyboardType: 'decimal-pad' },
                { key: 'lightSleep', label: 'Light Sleep', placeholder: '0.0', unit: 'hours', keyboardType: 'decimal-pad' },
                { key: 'remSleep', label: 'REM Sleep', placeholder: '0.0', unit: 'hours', keyboardType: 'decimal-pad' },
            ],
            description: 'Enter your sleep data from last night.',
        },
        activeMinutes: {
            title: 'Add Active Time',
            icon: 'time',
            color: '#27AE60',
            fields: [
                { key: 'activeMinutes', label: 'Active Minutes', placeholder: '0', unit: 'min', keyboardType: 'numeric' },
            ],
            description: 'Enter time spent being physically active.',
        },
    };

    const config = activityConfigs[activityType] || activityConfigs.steps;

    useEffect(() => {
        loadCurrentData();
    }, []);

    const loadCurrentData = async () => {
        try {
            const data = await getDailyActivity();
            setCurrentData(data);

            // Pre-fill with current values
            const initialValues = {};
            config.fields.forEach(field => {
                initialValues[field.key] = data[field.key]?.toString() || '';
            });
            setInputValues(initialValues);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key, value) => {
        setInputValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Disable mock data since user is entering real data
            await disableMockData();

            const updatedData = { ...currentData };

            // Parse and update values
            config.fields.forEach(field => {
                const value = inputValues[field.key];
                if (value !== '' && value !== undefined) {
                    updatedData[field.key] = field.keyboardType === 'decimal-pad'
                        ? parseFloat(value) || 0
                        : parseInt(value) || 0;
                }
            });

            // Calculate derived values
            if (activityType === 'distance') {
                const walking = updatedData.walkingDistance || 0;
                const running = updatedData.runningDistance || 0;
                const cycling = updatedData.cyclingDistance || 0;
                updatedData.distance = walking + running + cycling;
            }

            if (activityType === 'calories') {
                const active = updatedData.activeCalories || 0;
                const resting = updatedData.restingCalories || 0;
                updatedData.caloriesBurned = active + resting;
            }

            if (activityType === 'heartRate') {
                const newReading = updatedData.currentHeartRate;
                if (!updatedData.heartRateReadings) {
                    updatedData.heartRateReadings = [];
                }
                updatedData.heartRateReadings.push({
                    bpm: newReading,
                    timestamp: new Date().toISOString(),
                });

                // Update min/max/avg
                const readings = updatedData.heartRateReadings.map(r => r.bpm);
                updatedData.minHeartRate = Math.min(...readings);
                updatedData.maxHeartRate = Math.max(...readings);
                updatedData.avgHeartRate = Math.round(
                    readings.reduce((a, b) => a + b, 0) / readings.length
                );
            }

            await saveDailyActivity(updatedData, getTodayDate());

            Alert.alert(
                'Success!',
                `${config.title.replace('Add ', '')} data saved successfully.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Error saving data:', error);
            Alert.alert('Error', 'Failed to save data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleQuickAdd = (key, amount) => {
        const currentValue = parseFloat(inputValues[key]) || 0;
        const newValue = currentValue + amount;
        handleInputChange(key, newValue.toString());
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={['top']}>
                <ActivityIndicator size="large" color={config.color} />
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#1E3A8A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{config.title}</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Activity Icon & Date */}
                        <View style={styles.topSection}>
                            <View style={[styles.iconCircle, { backgroundColor: `${config.color}20` }]}>
                                <Ionicons name={config.icon} size={moderateScale(40)} color={config.color} />
                            </View>
                            <Text style={styles.dateText}>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                            <Text style={styles.descriptionText}>{config.description}</Text>
                        </View>

                        {/* Input Fields */}
                        {config.fields.map((field, index) => (
                            <View key={field.key} style={styles.inputCard}>
                                <Text style={styles.inputLabel}>{field.label}</Text>

                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={inputValues[field.key] || ''}
                                        onChangeText={(value) => handleInputChange(field.key, value)}
                                        placeholder={field.placeholder}
                                        placeholderTextColor="#94A3B8"
                                        keyboardType={field.keyboardType}
                                        selectTextOnFocus
                                    />
                                    <Text style={styles.unitText}>{field.unit}</Text>
                                </View>

                                {/* Quick Add Buttons */}
                                {(field.key === 'steps' || field.key === 'activeMinutes' ||
                                    field.key === 'activeCalories') && (
                                        <View style={styles.quickAddRow}>
                                            {field.key === 'steps' && (
                                                <>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 500)}
                                                    >
                                                        <Text style={styles.quickAddText}>+500</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 1000)}
                                                    >
                                                        <Text style={styles.quickAddText}>+1K</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 2500)}
                                                    >
                                                        <Text style={styles.quickAddText}>+2.5K</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 5000)}
                                                    >
                                                        <Text style={styles.quickAddText}>+5K</Text>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                            {field.key === 'activeMinutes' && (
                                                <>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 10)}
                                                    >
                                                        <Text style={styles.quickAddText}>+10</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 15)}
                                                    >
                                                        <Text style={styles.quickAddText}>+15</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 30)}
                                                    >
                                                        <Text style={styles.quickAddText}>+30</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 60)}
                                                    >
                                                        <Text style={styles.quickAddText}>+60</Text>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                            {field.key === 'activeCalories' && (
                                                <>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 50)}
                                                    >
                                                        <Text style={styles.quickAddText}>+50</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 100)}
                                                    >
                                                        <Text style={styles.quickAddText}>+100</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 200)}
                                                    >
                                                        <Text style={styles.quickAddText}>+200</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.quickAddButton}
                                                        onPress={() => handleQuickAdd(field.key, 500)}
                                                    >
                                                        <Text style={styles.quickAddText}>+500</Text>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                    )}

                                {/* Current Value Info */}
                                {currentData && currentData[field.key] > 0 && (
                                    <Text style={styles.currentValueText}>
                                        Current: {currentData[field.key]} {field.unit}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    {/* Save Button */}
                    <View style={styles.saveContainer}>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: config.color }, saving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={moderateScale(22)} color="#FFFFFF" />
                                    <Text style={styles.saveButtonText}>Save {config.title.replace('Add ', '')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default AddActivityScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    safeArea: {
        flex: 1,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: verticalScale(16),
        fontSize: moderateScale(14),
        color: '#64748B',
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
    backButton: {
        padding: scale(8),
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E3A8A',
    },
    headerPlaceholder: {
        width: scale(40),
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingBottom: hp(12),
    },
    topSection: {
        alignItems: 'center',
        paddingVertical: hp(3),
    },
    iconCircle: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(2),
    },
    dateText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: hp(1),
    },
    descriptionText: {
        fontSize: moderateScale(14),
        color: '#64748B',
        textAlign: 'center',
    },
    inputCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        padding: scale(20),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    inputLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#64748B',
        marginBottom: hp(1),
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: scale(12),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
    },
    textInput: {
        flex: 1,
        fontSize: moderateScale(28),
        fontWeight: '700',
        color: '#1E3A8A',
        padding: 0,
    },
    unitText: {
        fontSize: moderateScale(16),
        color: '#64748B',
        marginLeft: scale(8),
    },
    quickAddRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp(1.5),
        gap: scale(8),
    },
    quickAddButton: {
        flex: 1,
        backgroundColor: '#E8EDF2',
        borderRadius: scale(8),
        paddingVertical: hp(1),
        alignItems: 'center',
    },
    quickAddText: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#1E3A8A',
    },
    currentValueText: {
        fontSize: moderateScale(12),
        color: '#94A3B8',
        marginTop: hp(1),
        textAlign: 'center',
    },
    saveContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: scale(12),
        paddingVertical: hp(1.8),
        gap: scale(8),
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
