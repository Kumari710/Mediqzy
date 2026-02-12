import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function DeliverySuccessScreen({ navigation }) {
    const [rating, setRating] = useState(5);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.content}>
                    {/* Success Icon/Animation Placeholder */}
                    <View style={styles.successBadge}>
                        <Ionicons name="checkmark-circle" size={moderateScale(100)} color="#4CAF50" />
                    </View>

                    <Text style={styles.title}>Order Delivered!</Text>
                    <Text style={styles.subtitle}>
                        Your medicine from Apollo Pharmacy has been successfully delivered.
                    </Text>

                    {/* Delivery Person Card */}
                    <View style={styles.deliveryCard}>
                        <Text style={styles.cardHeader}>Point of delivery Success</Text>
                        <Image source={require('../../images/IndianDoctor.png')} style={styles.avatar} />
                        <Text style={styles.name}>Sathy Raj</Text>
                        <Text style={styles.designation}>Delivery Partner</Text>

                        {/* Stars */}
                        <View style={styles.ratingBox}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons
                                        name={star <= rating ? "star" : "star-outline"}
                                        size={moderateScale(32)}
                                        color="#FFD700"
                                        style={{ marginHorizontal: scale(4) }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.ratingAction}>Rate your delivery experience</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.homeBtn}
                        onPress={() => navigation.navigate('HomeScreen')}
                    >
                        <Text style={styles.homeBtnText}>Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    safeArea: { flex: 1 },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(8),
    },
    successBadge: {
        marginBottom: verticalScale(20),
    },
    title: {
        fontSize: moderateScale(24),
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: moderateScale(14),
        color: '#888',
        textAlign: 'center',
        marginTop: verticalScale(10),
        lineHeight: moderateScale(22),
    },
    deliveryCard: {
        width: '100%',
        backgroundColor: '#F7F8FA',
        borderRadius: scale(24),
        padding: scale(24),
        alignItems: 'center',
        marginTop: verticalScale(40),
    },
    cardHeader: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#23238E',
        marginBottom: verticalScale(20),
    },
    avatar: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        marginBottom: verticalScale(12),
    },
    name: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#222',
    },
    designation: {
        fontSize: moderateScale(12),
        color: '#888',
        marginTop: verticalScale(2),
    },
    ratingBox: {
        flexDirection: 'row',
        marginTop: verticalScale(24),
    },
    ratingAction: {
        fontSize: moderateScale(13),
        color: '#666',
        marginTop: verticalScale(16),
    },
    footer: {
        padding: scale(24),
    },
    homeBtn: {
        backgroundColor: '#23238E',
        borderRadius: scale(16),
        paddingVertical: verticalScale(18),
        alignItems: 'center',
    },
    homeBtnText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },
});
