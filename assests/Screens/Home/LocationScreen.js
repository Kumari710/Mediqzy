import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import MapView, { Marker, Circle } from 'react-native-maps';
import { searchNearbyHealthcare } from '../../Utils/mapsService';

export default function LocationScreen({ navigation, route }) {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState({
    latitude: 12.9716, // Chennai default
    longitude: 80.2452,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState('90/8 Rjajaji nagar main Rd,');
  const [subAddress, setSubAddress] = useState('Thiruvanmiyur, Chennai');

  const params = route.params || {};

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const mapStyle = [
    {
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#7c93a3" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#123456" }]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{ "color": "#f5f5f5" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#d59563" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#ffffff" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#e9e9e9" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9e9e9e" }]
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Full Screen Map */}
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={handleRegionChange}
          customMapStyle={mapStyle}
        >
          <Marker coordinate={region}>
            <View style={styles.customMarker}>
              <View style={styles.innerMarker} />
            </View>
          </Marker>
          <Circle
            center={region}
            radius={200}
            fillColor="rgba(38, 166, 154, 0.15)"
            strokeColor="#26A69A"
            strokeWidth={1}
          />
        </MapView>
      </View>

      {/* Floating Search Bar */}
      <SafeAreaView style={styles.overlayArea} pointerEvents="box-none">
        <View style={styles.searchBarFloating}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location, ZIP code.."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </SafeAreaView>

      {/* Bottom Card */}
      <View style={styles.bottomSheet}>
        <View style={styles.bsHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bsBackBtn}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.bsTitle}>Confirm your address</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.addressSection}>
          <View style={styles.redPinContainer}>
            <Ionicons name="location" size={24} color="#FF5252" />
          </View>
          <View style={styles.addressTextContainer}>
            <Text style={styles.fullAddress}>{address} {subAddress}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmBtnFull}
          onPress={() => {
            const bookingDetails = route.params?.bookingDetails;
            if (bookingDetails) {
              const updatedBooking = {
                ...bookingDetails,
                location: {
                  latitude: region.latitude,
                  longitude: region.longitude,
                  address: address + ' ' + subAddress,
                  type: 'home'
                }
              };
              navigation.navigate('PaymentScreen', { bookingDetails: updatedBooking });
            } else {
              navigation.navigate('PaymentScreen', {
                ...params,
                location: {
                  latitude: region.latitude,
                  longitude: region.longitude,
                  address: address + ' ' + subAddress
                }
              });
            }
          }}
        >
          <Text style={styles.confirmBtnFullText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mapWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  searchBarFloating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    marginTop: hp(2),
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 54,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#000',
  },
  customMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 150, 136, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#009688',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: -5 },
    elevation: 20,
  },
  bsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  bsBackBtn: {
    marginRight: 15,
  },
  bsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  redPinContainer: {
    marginRight: 15,
  },
  addressTextContainer: {
    flex: 1,
  },
  fullAddress: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    fontWeight: '500',
  },
  confirmBtnFull: {
    backgroundColor: '#1E2E9B',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  confirmBtnFullText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
