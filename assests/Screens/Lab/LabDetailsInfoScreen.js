import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { addToLabCart, getLabCartItems } from '../../Utils/firebaseLabStorage';

const COLORS = {
  primary: '#23238E',
  secondary: '#3B4FBF',
  accent: '#FFB800',
  white: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
};

const labTests = [
  { id: 1, name: 'AHbA1c Test (Hemoglobin A1c)', testsIncluded: 3, price: 612 },
  { id: 2, name: 'Diabetes Group Test', testsIncluded: 3, price: 1123 },
  { id: 3, name: 'Complete Blood Count', testsIncluded: 5, price: 450 },
  { id: 4, name: 'Lipid Profile Test', testsIncluded: 4, price: 890 },
];

export default function LabDetailsInfoScreen({ navigation, route }) {
  const { lab } = route.params || {};
  const [cartItems, setCartItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);

  const data = lab || {
    name: 'Apollo Labs',
    location: 'T.nagar, Chennai 600017',
    img: require('../../images/apollo.png'),
  };

  const isInCart = (id) => cartItems.some(item => String(item.id) === String(id));

  const addItemToCart = async (test) => {
    if (isInCart(test.id)) return;
    setAddingToCart(test.id);
    const res = await addToLabCart(test);
    if (res.success) {
      setCartItems(res.cart);
    }
    setAddingToCart(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lab Details</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Lab Info Card */}
          <View style={styles.labInfoCard}>
            <View style={styles.labInfoMain}>
              <View style={styles.labImgContainer}>
                <Image source={data.img || require('../../images/apollo.png')} style={styles.labImg} />
              </View>
              <View style={styles.labInfoText}>
                <Text style={styles.labName}>{data.name || 'Apollo Labs'}</Text>
                <Text style={styles.labLoc}>{data.location || 'T.nagar, Chennai 600017'}</Text>
              </View>
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Address & Contact Card */}
          <View style={styles.addressCard}>
            {/* Address Row */}
            <View style={styles.addressRow}>
              <View style={styles.addressIconContainer}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.addressText}>#567, new lake road, T nagar, chennai - 600091</Text>
              <TouchableOpacity>
                <Ionicons name="share-social-outline" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Map Preview */}
            <View style={styles.mapContainer}>
              <Image source={require('../../images/Map.png')} style={styles.mapImg} />
            </View>

            {/* Contact Info */}
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.contactText}>LoremIpsum.info@gmail.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.contactText}>Reception:  9876543210</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="globe-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.contactText}>www.apollohospitals.com</Text>
            </View>
          </View>

          {/* Lab Tests Section */}
          <Text style={styles.sectionTitle}>Lab Tests</Text>

          {labTests.map((test) => (
            <TouchableOpacity 
              key={test.id} 
              style={styles.testCard}
              onPress={() => navigation.navigate('LabTestDetailScreen', { test, lab: data })}
            >
              <View style={styles.testCardTop}>
                <View style={styles.testIconBox}>
                  <Image source={require('../../images/vector.png')} style={styles.testIcon} />
                </View>
                <View style={styles.testInfo}>
                  <Text style={styles.testName}>{test.name}</Text>
                  <Text style={styles.testIncluded}>{test.testsIncluded} Tests Included</Text>
                  <Text style={styles.testPrice}>Rs. {test.price}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, isInCart(test.id) && styles.addBtnDone]}
                  onPress={() => navigation.navigate('LabTestDetailScreen', { test, lab: data })}
                  disabled={addingToCart === test.id || isInCart(test.id)}
                >
                  {addingToCart === test.id ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.addBtnText}>{isInCart(test.id) ? 'Added' : 'Add'}</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.testCardFooter}>
                <Image source={require('../../images/apollo.png')} style={styles.testLabLogo} />
                <View style={styles.quickReportsBadge}>
                  <Text style={styles.quickReportsText}>Quick Reports</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* See All Button */}
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: 12,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: 10,
  },

  // Lab Info Card
  labInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  labInfoMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labImgContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  labImg: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  labInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  labName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  labLoc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  // Address Card
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  mapContainer: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  mapImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.text,
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 15,
  },

  // Test Card
  testCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  testCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  testInfo: {
    flex: 1,
    marginLeft: 12,
  },
  testName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  testIncluded: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  testPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  addBtnDone: {
    backgroundColor: COLORS.success,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  testCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 10,
  },
  testLabLogo: {
    width: 40,
    height: 18,
    resizeMode: 'contain',
  },
  quickReportsBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickReportsText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // See All Button
  seeAllBtn: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});


