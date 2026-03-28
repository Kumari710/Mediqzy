import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, moderateScale, wp, hp } from '../../Utils/responsive';

export default function YouTubePlayerScreen({ navigation, route }) {
    const { videoId } = route.params;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
                        <Text style={styles.backText}>Back to Health Tracker</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.playerContainer}>
                    <YoutubePlayer
                        height={hp(30)}
                        play={true}
                        videoId={videoId}
                    />
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoTitle}>Enjoy your health educational video</Text>
                    <Text style={styles.infoDesc}>
                        Learn more about maintaining a healthy lifestyle and improving your well-being.
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        color: '#fff',
        fontSize: moderateScale(16),
        marginLeft: scale(10),
        fontWeight: '500',
    },
    playerContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    infoContainer: {
        padding: scale(20),
        backgroundColor: '#111',
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
    },
    infoTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: scale(10),
    },
    infoDesc: {
        fontSize: moderateScale(14),
        color: '#ccc',
        lineHeight: scale(20),
    },
});
