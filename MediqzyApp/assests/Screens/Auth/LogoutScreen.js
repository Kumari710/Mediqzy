import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { signOut } from '../../Utils/firebaseAuth';

export default function LogoutScreen({ navigation }) {
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            const result = await signOut();
            if (result.success) {
                // Reset navigation to Login screen
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            } else {
                Alert.alert('Error', result.error || 'Failed to logout. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.illustrationContainer}>
                        <Image
                            source={require('../../images/doctor.png')}
                            style={styles.doctorImage}
                            resizeMode="contain"
                        />
                    </View>

                    <Text style={styles.title}>Log Out</Text>
                    <Text style={styles.subtitle}>
                        Are you sure you want to log out?{'\n'}You will need to login again to access your health data.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.logoutButton, loading && styles.buttonDisabled]}
                            onPress={handleLogout}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="log-out-outline" size={moderateScale(20)} color="#FFFFFF" style={styles.buttonIcon} />
                                    <Text style={styles.logoutButtonText}>Log Out</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Smart Health v1.0.0</Text>
                </View>
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
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
    },
    backBtn: {
        width: scale(40),
        height: scale(40),
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(8),
    },
    illustrationContainer: {
        width: scale(180),
        height: scale(180),
        marginBottom: verticalScale(30),
        backgroundColor: '#F8FAFC',
        borderRadius: scale(90),
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
    },
    doctorImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: moderateScale(26),
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: verticalScale(12),
    },
    subtitle: {
        fontSize: moderateScale(15),
        color: '#64748B',
        textAlign: 'center',
        lineHeight: moderateScale(22),
        marginBottom: verticalScale(40),
    },
    buttonContainer: {
        width: '100%',
        gap: verticalScale(16),
    },
    button: {
        height: verticalScale(55),
        borderRadius: scale(30),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        marginRight: scale(10),
    },
    logoutButton: {
        backgroundColor: '#EF4444', // Red for logout
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cancelButtonText: {
        color: '#475569',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    footer: {
        paddingBottom: hp(4),
        alignItems: 'center',
    },
    footerText: {
        fontSize: moderateScale(12),
        color: '#94A3B8',
    },
});
