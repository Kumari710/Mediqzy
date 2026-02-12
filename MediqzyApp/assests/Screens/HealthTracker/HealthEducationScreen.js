import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { searchHealthVideos } from '../../Utils/youtubeService';

const CATEGORIES = ['All', 'Lifestyle', 'Nutrition', 'Mental Health', 'Fitness', 'Medical'];

export default function HealthEducationScreen({ navigation }) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchEducationContent();
    }, [selectedCategory]);

    const fetchEducationContent = async () => {
        setLoading(true);
        try {
            const query = selectedCategory === 'All' ? 'health and wellness tips' : `health ${selectedCategory.toLowerCase()}`;
            const results = await searchHealthVideos(query);
            setVideos(results);
        } catch (error) {
            console.log('Error fetching education content:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Health Education</Text>
                    <View style={{ width: scale(40) }} />
                </View>

                {/* Categories Bar */}
                <View style={styles.categoryBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#23238E" />
                        <Text style={styles.loaderText}>Loading educational content...</Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.sectionTitle}>Featured Videos</Text>
                        <View style={styles.videoGrid}>
                            {videos.map((v) => (
                                <TouchableOpacity
                                    key={v.id}
                                    style={styles.videoCard}
                                    onPress={() => navigation.navigate('YouTubePlayer', { videoId: v.videoId })}
                                >
                                    <Image source={{ uri: v.thumbnail }} style={styles.thumbnail} />
                                    <View style={styles.playOverlay}>
                                        <Ionicons name="play" size={moderateScale(32)} color="#fff" />
                                    </View>
                                    <View style={styles.videoInfo}>
                                        <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
                                        <Text style={styles.videoChannel}>{v.channelTitle}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {videos.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="videocam-off-outline" size={moderateScale(64)} color="#ccc" />
                                <Text style={styles.emptyText}>No videos found for this category.</Text>
                            </View>
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: { width: scale(40), padding: scale(4) },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#1E293B' },
    categoryBar: { backgroundColor: '#fff', paddingVertical: verticalScale(12) },
    categoryScroll: { paddingHorizontal: wp(4), gap: scale(8) },
    categoryChip: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderRadius: scale(20),
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    categoryChipActive: { backgroundColor: '#23238E', borderColor: '#23238E' },
    categoryText: { fontSize: moderateScale(13), color: '#64748B', fontWeight: '600' },
    categoryTextActive: { color: '#fff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: verticalScale(16), fontSize: moderateScale(14), color: '#64748B' },
    scrollContent: { paddingVertical: hp(2) },
    sectionTitle: { fontSize: moderateScale(18), fontWeight: '800', color: '#1E293B', paddingHorizontal: wp(4), marginBottom: verticalScale(16) },
    videoGrid: { paddingHorizontal: wp(4), gap: verticalScale(20) },
    videoCard: {
        backgroundColor: '#fff',
        borderRadius: scale(16),
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    thumbnail: { width: '100%', height: verticalScale(200), backgroundColor: '#E2E8F0' },
    playOverlay: {
        position: 'absolute',
        top: verticalScale(200) / 2 - scale(25),
        left: wp(92) / 2 - scale(25),
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoInfo: { padding: scale(16) },
    videoTitle: { fontSize: moderateScale(15), fontWeight: '700', color: '#1E293B', lineHeight: moderateScale(22) },
    videoChannel: { fontSize: moderateScale(12), color: '#64748B', marginTop: verticalScale(4) },
    emptyState: { alignItems: 'center', marginTop: hp(10) },
    emptyText: { fontSize: moderateScale(14), color: '#64748B', marginTop: verticalScale(16) },
});
