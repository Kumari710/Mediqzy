import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Image,
    StatusBar,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';

const { width, height } = Dimensions.get('window');

const COLORS = {
    primary: '#23238E',
    secondary: '#3B4FBF',
    white: '#FFFFFF',
    background: '#F8FAFC',
    text: '#1A1A2E',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    accent: '#FF6B6B',
};

const DEFAULT_LOCATION = {
    latitude: 13.0827,
    longitude: 80.2707,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

export default function LabLocationScreen({ navigation, route }) {
    const [address, setAddress] = useState('90/8 Rajaji nagar main Rd,\nThiruvanmiyur, Chennai');
    const [searchText, setSearchText] = useState('');

    // Get params from previous screen
    const { totals, cartItems, patient } = route.params || {};

    // Static map image URL (Google Static Maps or placeholder)
    const mapImageUrl = 'https://maps.googleapis.com/maps/api/staticmap?center=28.6915,77.1498&zoom=14&size=600x400&maptype=roadmap&markers=color:red%7C28.6915,77.1498';

    const handleConfirmLocation = () => {
        const COLLECTION_CHARGE = 50;
        const subtotal = totals?.subtotal || 0;
        const tax = totals?.taxes || 0;
        const grandTotal = subtotal + tax + COLLECTION_CHARGE;

        const today = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

        const defaultLocation = {
            latitude: 28.6915,
            longitude: 77.1498,
        };

        const bookingDetails = {
            type: 'lab',
            items: (cartItems || []).map(item => ({
                id: String(item.id),
                name: String(item.name || 'Unknown Test'),
                price: parseFloat(item.price) || 0,
                lab: item.lab || 'Apollo Labs',
            })),
            provider: { name: 'Apollo Labs', address: 'T.nagar, Chennai', logo: 'apollo.png' },
            schedule: {
                date: formattedDate,
                timeSlot: '08:00 AM - 10:00 AM',
            },
            summary: { 
                subtotal, 
                collectionCharge: COLLECTION_CHARGE, 
                tax, 
                total: grandTotal 
            },
            location: {
                address: address.replace('\n', ', '),
                coordinates: defaultLocation,
            },
            patient: patient,
        };

        navigation.navigate('LabPaymentScreen', {
            bookingDetails,
            location: defaultLocation,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            
            {/* Map Image */}
            <View style={styles.mapContainer}>
                <Image
                    source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=28.6915,77.1498&zoom=14&size=600x400&maptype=roadmap' }}
                    style={styles.map}
                    resizeMode="cover"
                    defaultSource={require('../../images/labtest.png')}
                />
                
                {/* Location marker overlay */}
                <View style={styles.markerOverlay}>
                    <View style={styles.markerContainer}>
                        <View style={styles.marker}>
                            <Ionicons name="location" size={18} color={COLORS.white} />
                        </View>
                        <View style={styles.markerTail} />
                    </View>
                </View>
                
                {/* Circle overlay */}
                <View style={styles.circleOverlay} />
            </View>

            {/* Back Button */}
            <SafeAreaView style={styles.headerOverlay} edges={['top']}>
                <TouchableOpacity 
                    style={styles.backBtn} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search location, ZIP code.."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Bottom Card */}
            <View style={styles.bottomCard}>
                <Text style={styles.confirmTitle}>Confirm your address</Text>
                
                <View style={styles.addressRow}>
                    <View style={styles.locationPin}>
                        <Ionicons name="location" size={18} color={COLORS.accent} />
                    </View>
                    <Text style={styles.addressText}>
                        {address}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={styles.confirmBtn}
                    onPress={handleConfirmLocation}
                >
                    <Text style={styles.confirmBtnText}>Confirm Location</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    markerOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -17 }, { translateY: -40 }],
        zIndex: 5,
    },
    circleOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(59, 79, 191, 0.08)',
        borderWidth: 2,
        borderColor: 'rgba(59, 79, 191, 0.5)',
        transform: [{ translateX: -75 }, { translateY: -75 }],
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: wp(4),
        marginTop: hp(1),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchContainer: {
        position: 'absolute',
        top: hp(12),
        left: wp(4),
        right: wp(4),
        zIndex: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 30,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        marginLeft: 10,
        paddingVertical: 0,
    },
    myLocationBtn: {
        position: 'absolute',
        right: wp(4),
        bottom: hp(32),
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    markerTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: COLORS.secondary,
        marginTop: -3,
    },
    bottomCard: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: wp(5),
        paddingTop: hp(2.5),
        paddingBottom: hp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
    },
    confirmTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: hp(2),
        fontStyle: 'italic',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: hp(2.5),
    },
    locationPin: {
        marginRight: 10,
        marginTop: 2,
    },
    addressText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 22,
    },
    confirmBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: hp(2),
        alignItems: 'center',
    },
    confirmBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
});
