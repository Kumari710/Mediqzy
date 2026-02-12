import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

import {
    scale,
    verticalScale,
    moderateScale,
    wp,
    hp,
} from '../../Utils/responsive';

import {
    getFavorites,
    removeFromFavorites,
    addToCart,
} from '../../Utils/firebasePharmacyStorage';

export default function FavouritesScreen({ navigation }) {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const loadFavorites = async () => {
        setLoading(true);
        try {
            let data = await getFavorites();
            // Filter out any corrupted or duplicate items
            data = data.filter(item =>
                item &&
                item.id &&
                item.id !== 'undefined' &&
                item.name &&
                item.name !== 'undefined'
            );
            setFavorites(data);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        // No alert needed for heart toggle, just remove
        await removeFromFavorites(productId);
        loadFavorites(); // Refresh list
    };

    const handleAddToCart = async (product) => {
        const result = await addToCart(product);
        if (result.success) {
            Alert.alert('Success', 'Added to cart');
        } else {
            Alert.alert('Error', result.message || 'Failed to add to cart');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DrugDetailsScreen', { product: item })}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={
                        item.image
                            ? item.image
                            : item.imageName === 'drug2.png'
                                ? require('../../images/drug2.png')
                                : require('../../images/drug1.png')
                    }
                    style={styles.image}
                    resizeMode="contain"
                />
                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item.id)}
                >
                    <Ionicons name="heart" size={20} color="#FF4D4D" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.desc} numberOfLines={1}>
                    {item.desc || item.description || 'Healthcare Product'}
                </Text>
                <Text style={styles.price}>₹ {item.price}</Text>

                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleAddToCart(item)}
                >
                    <Text style={styles.addBtnText}>Add to Cart</Text>
                    <Ionicons name="cart-outline" size={16} color="#fff" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1E2E9B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Favourites</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#1E2E9B" />
                    </View>
                ) : favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Image
                            source={require('../../images/drug1.png')} // Reuse an existing image or a placeholder
                            style={[styles.emptyImg, { opacity: 0.5, tintColor: '#ccc' }]}
                        />
                        <Text style={styles.emptyTitle}>No Favourites Yet</Text>
                        <Text style={styles.emptyText}>
                            Mark items as favourite to see them here.
                        </Text>
                        <TouchableOpacity
                            style={styles.exploreBtn}
                            onPress={() => navigation.navigate('PharmacyScreen')}
                        >
                            <Text style={styles.exploreBtnText}>Explore Medicines</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        renderItem={renderItem}
                        keyExtractor={(item) => String(item.id)}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FD' },
    safeArea: { flex: 1 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E2E9B',
    },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    list: { padding: wp(5), paddingBottom: hp(5) },

    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    imageContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#F5F5FA',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: { width: '80%', height: '80%' },
    removeBtn: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 6,
        borderRadius: 8,
        elevation: 1,
    },

    content: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    name: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 4 },
    desc: { fontSize: 13, color: '#888', marginBottom: 8 },
    price: { fontSize: 18, fontWeight: '700', color: '#1E2E9B', marginBottom: 12 },

    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E2E9B',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignSelf: 'flex-start',
        gap: 6,
    },
    addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyImg: { width: 100, height: 100, marginBottom: 20 },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    emptyText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    exploreBtn: {
        backgroundColor: '#1E2E9B',
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 30,
        shadowColor: '#1E2E9B',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
    },
    exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
