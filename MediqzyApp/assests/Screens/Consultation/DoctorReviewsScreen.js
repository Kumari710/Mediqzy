import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function DoctorReviewsScreen({ navigation, route }) {
    const doctor = route?.params?.doctor || {
        name: 'Dr. Vijayakumar',
        rating: 4.5,
    };

    const reviews = [
        { id: 1, name: 'Ramesh K', rating: 5, comment: 'Very professional and caring doctor. Highly recommended!', date: '2 days ago' },
        { id: 2, name: 'Priya S', rating: 4, comment: 'Good consultation experience. Doctor listened patiently.', date: '1 week ago' },
        { id: 3, name: 'Anil Kumar', rating: 5, comment: 'Best doctor I have ever visited. Explained everything clearly.', date: '2 weeks ago' },
        { id: 4, name: 'Sneha R', rating: 4, comment: 'Wait time was short and treatment was effective.', date: '1 month ago' },
        { id: 5, name: 'John Doe', rating: 5, comment: 'Excellent diagnosis. Felt much better after the first dose.', date: '1 month ago' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Reviews</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Summary Section */}
                    <View style={styles.summaryCard}>
                        <View style={styles.ratingBox}>
                            <Text style={styles.ratingValue}>{doctor.rating}</Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Ionicons
                                        key={s}
                                        name={s <= Math.floor(doctor.rating) ? "star" : "star-outline"}
                                        size={moderateScale(20)}
                                        color="#FFB800"
                                    />
                                ))}
                            </View>
                            <Text style={styles.totalReviews}>Based on 500+ reviews</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statsColumn}>
                            {[5, 4, 3, 2, 1].map((s) => (
                                <View key={s} style={styles.statRow}>
                                    <Text style={styles.statLabel}>{s} star</Text>
                                    <View style={styles.progressBg}>
                                        <View style={[styles.progressFill, { width: `${s * 15 + 10}%` }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* List of Reviews */}
                    <View style={styles.reviewsList}>
                        {reviews.map((review) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewTop}>
                                    <View style={styles.reviewerAvatar}>
                                        <Text style={styles.reviewerInitial}>{review.name.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.reviewerInfo}>
                                        <Text style={styles.reviewerName}>{review.name}</Text>
                                        <Text style={styles.reviewDate}>{review.date}</Text>
                                    </View>
                                    <View style={styles.reviewRating}>
                                        <Ionicons name="star" size={moderateScale(14)} color="#FFB800" />
                                        <Text style={styles.reviewRatingText}>{review.rating}</Text>
                                    </View>
                                </View>
                                <Text style={styles.reviewComment}>{review.comment}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    backBtn: {
        width: scale(40),
        padding: scale(4),
    },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#222' },
    scrollContent: { paddingBottom: hp(4) },
    summaryCard: {
        backgroundColor: '#fff',
        margin: scale(16),
        padding: scale(20),
        borderRadius: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    ratingBox: {
        alignItems: 'center',
        flex: 1,
    },
    ratingValue: {
        fontSize: moderateScale(40),
        fontWeight: '800',
        color: '#222',
    },
    starsRow: {
        flexDirection: 'row',
        marginVertical: verticalScale(4),
    },
    totalReviews: {
        fontSize: moderateScale(12),
        color: '#888',
    },
    divider: {
        width: 1,
        height: '80%',
        backgroundColor: '#eee',
        marginHorizontal: scale(20),
    },
    statsColumn: {
        flex: 1.5,
        gap: verticalScale(6),
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    statLabel: {
        fontSize: moderateScale(10),
        color: '#666',
        width: scale(35),
    },
    progressBg: {
        flex: 1,
        height: verticalScale(6),
        backgroundColor: '#F0F0F0',
        borderRadius: scale(3),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFB800',
        borderRadius: scale(3),
    },
    reviewsList: {
        paddingHorizontal: wp(4),
    },
    reviewCard: {
        backgroundColor: '#fff',
        padding: scale(16),
        borderRadius: scale(14),
        marginBottom: verticalScale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    reviewTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    reviewerAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#23238E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewerInitial: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#fff',
    },
    reviewerInfo: {
        flex: 1,
        marginLeft: scale(12),
    },
    reviewerName: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        color: '#222',
    },
    reviewDate: {
        fontSize: moderateScale(12),
        color: '#888',
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E0',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(6),
    },
    reviewRatingText: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        color: '#222',
        marginLeft: scale(4),
    },
    reviewComment: {
        fontSize: moderateScale(14),
        color: '#555',
        lineHeight: moderateScale(22),
    },
});
