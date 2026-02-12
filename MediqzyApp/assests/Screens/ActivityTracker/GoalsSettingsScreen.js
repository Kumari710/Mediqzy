import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import {
    getActivityGoals,
    saveActivityGoals,
    getDefaultGoals,
} from '../../Utils/firebaseActivityStorage';

const GoalsSettingsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [goals, setGoals] = useState(getDefaultGoals());
    const [hasChanges, setHasChanges] = useState(false);

    const goalItems = [
        {
            key: 'steps',
            label: 'Daily Steps Goal',
            icon: 'footsteps',
            color: '#FF8C42',
            unit: 'steps',
            min: 1000,
            max: 50000,
            step: 500,
            description: 'Recommended: 8,000 - 10,000 steps',
        },
        {
            key: 'calories',
            label: 'Daily Calories Goal',
            icon: 'flame',
            color: '#E74C3C',
            unit: 'kcal',
            min: 100,
            max: 2000,
            step: 50,
            description: 'Calories to burn through activity',
        },
        {
            key: 'distance',
            label: 'Daily Distance Goal',
            icon: 'navigate',
            color: '#3498DB',
            unit: 'km',
            min: 1,
            max: 50,
            step: 0.5,
            description: 'Total walking/running distance',
        },
        {
            key: 'sleep',
            label: 'Daily Sleep Goal',
            icon: 'moon',
            color: '#9B59B6',
            unit: 'hours',
            min: 4,
            max: 12,
            step: 0.5,
            description: 'Recommended: 7-9 hours',
        },
        {
            key: 'activeMinutes',
            label: 'Active Minutes Goal',
            icon: 'time',
            color: '#27AE60',
            unit: 'min',
            min: 10,
            max: 180,
            step: 5,
            description: 'Time spent being active',
        },
    ];

    const loadGoals = useCallback(async () => {
        try {
            const savedGoals = await getActivityGoals();
            setGoals(savedGoals);
        } catch (error) {
            console.error('Error loading goals:', error);
            Alert.alert('Error', 'Failed to load goals');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    const updateGoal = (key, value) => {
        const goalItem = goalItems.find(g => g.key === key);
        let numValue = parseFloat(value) || 0;

        // Clamp value within min/max
        if (numValue < goalItem.min) numValue = goalItem.min;
        if (numValue > goalItem.max) numValue = goalItem.max;

        setGoals(prev => ({ ...prev, [key]: numValue }));
        setHasChanges(true);
    };

    const incrementGoal = (key) => {
        const goalItem = goalItems.find(g => g.key === key);
        const currentValue = goals[key] || goalItem.min;
        const newValue = Math.min(currentValue + goalItem.step, goalItem.max);
        updateGoal(key, newValue);
    };

    const decrementGoal = (key) => {
        const goalItem = goalItems.find(g => g.key === key);
        const currentValue = goals[key] || goalItem.min;
        const newValue = Math.max(currentValue - goalItem.step, goalItem.min);
        updateGoal(key, newValue);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveActivityGoals(goals);
            setHasChanges(false);
            Alert.alert('Success', 'Goals saved successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error saving goals:', error);
            Alert.alert('Error', 'Failed to save goals');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        Alert.alert(
            'Reset Goals',
            'Are you sure you want to reset all goals to default values?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setGoals(getDefaultGoals());
                        setHasChanges(true);
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]} edges={['top']}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={styles.loadingText}>Loading goals...</Text>
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
                    <Text style={styles.headerTitle}>Activity Goals</Text>
                    <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                        <Ionicons name="refresh" size={moderateScale(22)} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={moderateScale(24)} color="#3498DB" />
                        <Text style={styles.infoText}>
                            Set your daily activity goals. These will be used to track your progress across all activity screens.
                        </Text>
                    </View>

                    {/* Goals List */}
                    {goalItems.map((item) => (
                        <View key={item.key} style={styles.goalCard}>
                            <View style={styles.goalHeader}>
                                <View style={[styles.goalIcon, { backgroundColor: `${item.color}20` }]}>
                                    <Ionicons name={item.icon} size={moderateScale(22)} color={item.color} />
                                </View>
                                <View style={styles.goalInfo}>
                                    <Text style={styles.goalLabel}>{item.label}</Text>
                                    <Text style={styles.goalDescription}>{item.description}</Text>
                                </View>
                            </View>

                            <View style={styles.goalInputRow}>
                                <TouchableOpacity
                                    style={styles.adjustButton}
                                    onPress={() => decrementGoal(item.key)}
                                >
                                    <Ionicons name="remove" size={moderateScale(24)} color="#1E3A8A" />
                                </TouchableOpacity>

                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.goalInput}
                                        value={String(goals[item.key] || '')}
                                        onChangeText={(value) => updateGoal(item.key, value)}
                                        keyboardType="numeric"
                                        selectTextOnFocus
                                    />
                                    <Text style={styles.goalUnit}>{item.unit}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.adjustButton}
                                    onPress={() => incrementGoal(item.key)}
                                >
                                    <Ionicons name="add" size={moderateScale(24)} color="#1E3A8A" />
                                </TouchableOpacity>
                            </View>

                            {/* Progress Bar showing min-max range */}
                            <View style={styles.rangeContainer}>
                                <Text style={styles.rangeText}>{item.min}</Text>
                                <View style={styles.rangeBar}>
                                    <View
                                        style={[
                                            styles.rangeFill,
                                            {
                                                width: `${((goals[item.key] - item.min) / (item.max - item.min)) * 100}%`,
                                                backgroundColor: item.color,
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.rangeText}>{item.max}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Preset Buttons */}
                    <Text style={styles.sectionTitle}>Quick Presets</Text>
                    <View style={styles.presetsRow}>
                        <TouchableOpacity
                            style={styles.presetButton}
                            onPress={() => {
                                setGoals({
                                    steps: 5000,
                                    calories: 300,
                                    distance: 3,
                                    sleep: 7,
                                    activeMinutes: 20,
                                });
                                setHasChanges(true);
                            }}
                        >
                            <Ionicons name="leaf" size={moderateScale(20)} color="#27AE60" />
                            <Text style={styles.presetLabel}>Beginner</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.presetButton}
                            onPress={() => {
                                setGoals({
                                    steps: 10000,
                                    calories: 500,
                                    distance: 5,
                                    sleep: 8,
                                    activeMinutes: 30,
                                });
                                setHasChanges(true);
                            }}
                        >
                            <Ionicons name="fitness" size={moderateScale(20)} color="#3498DB" />
                            <Text style={styles.presetLabel}>Active</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.presetButton}
                            onPress={() => {
                                setGoals({
                                    steps: 15000,
                                    calories: 800,
                                    distance: 10,
                                    sleep: 8,
                                    activeMinutes: 60,
                                });
                                setHasChanges(true);
                            }}
                        >
                            <Ionicons name="trophy" size={moderateScale(20)} color="#E74C3C" />
                            <Text style={styles.presetLabel}>Athlete</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Save Button */}
                {hasChanges && (
                    <View style={styles.saveContainer}>
                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={moderateScale(22)} color="#FFFFFF" />
                                    <Text style={styles.saveButtonText}>Save Goals</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
};

export default GoalsSettingsScreen;

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
    resetButton: {
        padding: scale(8),
    },
    scrollContent: {
        paddingHorizontal: wp(4),
        paddingBottom: hp(12),
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E4F0FF',
        borderRadius: scale(12),
        padding: scale(16),
        marginTop: hp(2),
        marginBottom: hp(2),
        gap: scale(12),
    },
    infoText: {
        flex: 1,
        fontSize: moderateScale(13),
        color: '#1E3A8A',
        lineHeight: moderateScale(18),
    },
    goalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    goalIcon: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalInfo: {
        flex: 1,
        marginLeft: scale(12),
    },
    goalLabel: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#1E293B',
    },
    goalDescription: {
        fontSize: moderateScale(12),
        color: '#64748B',
        marginTop: verticalScale(2),
    },
    goalInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(1.5),
    },
    adjustButton: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: '#E8EDF2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginHorizontal: wp(4),
    },
    goalInput: {
        fontSize: moderateScale(32),
        fontWeight: '700',
        color: '#1E3A8A',
        textAlign: 'center',
        minWidth: wp(25),
    },
    goalUnit: {
        fontSize: moderateScale(16),
        color: '#64748B',
        marginLeft: scale(4),
    },
    rangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    rangeText: {
        fontSize: moderateScale(11),
        color: '#94A3B8',
        width: wp(12),
    },
    rangeBar: {
        flex: 1,
        height: scale(4),
        backgroundColor: '#E8EDF2',
        borderRadius: scale(2),
        overflow: 'hidden',
    },
    rangeFill: {
        height: '100%',
        borderRadius: scale(2),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '700',
        color: '#1E293B',
        marginTop: hp(1),
        marginBottom: hp(1.5),
    },
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scale(12),
    },
    presetButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: scale(12),
        padding: scale(16),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    presetLabel: {
        fontSize: moderateScale(13),
        fontWeight: '600',
        color: '#1E293B',
        marginTop: verticalScale(8),
    },
    saveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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
        backgroundColor: '#1E3A8A',
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
