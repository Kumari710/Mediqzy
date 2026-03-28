import React, { useState, useEffect, useCallback } from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { wp, hp } from '../../Utils/responsive';
import { addToLabCart, getLabCartItems, removeFromLabCart } from '../../Utils/firebaseLabStorage';

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
  danger: '#EF4444',
};

const testsIncludedData = [
  'HBA1C, GLYCATED HEMOGLOBIN',
  'ESTIMATED AVERAGE GLUCOSE (eAG)',
  'COMMENTS (Optional)',
];

const faqsData = [
  { question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  { question: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore?', answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
];

export default function LabTestDetailScreen({ navigation, route }) {
  const { test, lab } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(-1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllTests, setShowAllTests] = useState(false);

  const testData = test || {
    id: 1,
    name: 'AHbA1c Test (Hemoglobin A1c)',
    testsIncluded: 3,
    price: 612,
    originalPrice: 1134,
  };

  const labData = lab || {
    name: 'Apollo Labs',
    location: 'T.nagar, Chennai 600017',
    img: require('../../images/apollo.png'),
  };

  // Check cart status on focus
  useFocusEffect(
    useCallback(() => {
      const checkCartStatus = async () => {
        const cartItems = await getLabCartItems();
        const inCart = cartItems.some(item => String(item.id) === String(testData.id));
        setIsInCart(inCart);
      };
      checkCartStatus();
    }, [testData.id])
  );

  // Add item to cart (small Add button)
  const addItemToCart = async () => {
    if (isInCart) return;
    setLoading(true);
    const res = await addToLabCart(testData);
    if (res.success) {
      setIsInCart(true);
    }
    setLoading(false);
  };

  // Navigate to cart screen (bottom button)
  const goToCart = () => {
    navigation.navigate('LabCartScreen');
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? -1 : index);
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
          <Text style={styles.headerTitle}>Test Details</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Lab Info Card */}
          <View style={styles.labInfoCard}>
            <View style={styles.labImgContainer}>
              <Image source={labData.img || require('../../images/apollo.png')} style={styles.labImg} />
            </View>
            <View style={styles.labInfoText}>
              <Text style={styles.labName}>{labData.name}</Text>
              <Text style={styles.labLoc}>{labData.location}</Text>
            </View>
          </View>

          {/* Test Details Section */}
          <Text style={styles.sectionTitle}>Test Details</Text>

          <View style={styles.testCard}>
            <View style={styles.testCardTop}>
              <View style={styles.testIconBox}>
                <Image source={require('../../images/vector.png')} style={styles.testIcon} />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>{testData.name}</Text>
                <Text style={styles.testIncluded}>{testData.testsIncluded} Tests Included</Text>
              </View>
            </View>
            <View style={styles.testPriceRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.testPrice}>Rs. {testData.price}</Text>
                <Text style={styles.originalPrice}>(Rs.{testData.originalPrice || 1134})</Text>
              </View>
              <TouchableOpacity
                style={[styles.addBtn, isInCart && styles.addedBtn]}
                onPress={addItemToCart}
                disabled={loading || isInCart}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.addBtnText}>{isInCart ? 'Added' : 'Add'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Support Card */}
          <View style={styles.supportCard}>
            <View style={styles.supportIconContainer}>
              <Ionicons name="headset" size={24} color={COLORS.success} />
            </View>
            <View style={styles.supportTextContainer}>
              <Text style={styles.supportTitle}>Need Assistance? Call</Text>
              <Text style={styles.supportNumber}>9876543210</Text>
              <Text style={styles.supportSubtitle}> to connect with our Support Team</Text>
            </View>
            <TouchableOpacity style={styles.supportCallBtn}>
              <Ionicons name="call" size={24} color={COLORS.success} />
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Next Slot : <Text style={styles.infoHighlight}>08:00 PM, Tomorrow</Text>
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>No preparation required</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>Track status post collection</Text>
            </View>
          </View>

          {/* About the Test */}
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>About the Test</Text>
            <Text style={styles.aboutText} numberOfLines={showFullDescription ? undefined : 3}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitat.....
            </Text>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.readMoreText}>{showFullDescription ? 'Show Less' : 'Read More'}</Text>
            </TouchableOpacity>
          </View>

          {/* Tests Included */}
          <View style={styles.testsIncludedSection}>
            <Text style={styles.aboutTitle}>Tests Included</Text>
            {testsIncludedData.slice(0, showAllTests ? testsIncludedData.length : 3).map((item, index) => (
              <View key={index} style={styles.testIncludedItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.testIncludedText}>{item}</Text>
              </View>
            ))}
            {testsIncludedData.length > 3 && (
              <TouchableOpacity onPress={() => setShowAllTests(!showAllTests)}>
                <Text style={styles.readMoreText}>{showAllTests ? 'Show Less' : 'Read More'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* FAQs */}
          <View style={styles.faqSection}>
            <Text style={styles.aboutTitle}>FAQs</Text>
            {faqsData.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleFaq(index)}
              >
                <View style={styles.faqQuestion}>
                  <Text style={styles.faqQuestionText} numberOfLines={2}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </View>
                {expandedFaq === index && (
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Add to Cart Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={goToCart}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  labImgContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  labImg: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  labInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  labName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  labLoc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  // Test Card
  testCard: {
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
  testCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  testIncluded: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  testPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 13,
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addedBtn: {
    backgroundColor: '#4CAF50',
  },
  removeBtn: {
    backgroundColor: COLORS.danger,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Support Card
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
  },
  supportIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  supportTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  supportTitle: {
    fontSize: 13,
    color: COLORS.text,
  },
  supportNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  supportSubtitle: {
    fontSize: 13,
    color: COLORS.text,
  },
  supportCallBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  // Info Card
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  infoHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },

  // About Section
  aboutSection: {
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  readMoreText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 5,
  },

  // Tests Included
  testsIncludedSection: {
    marginBottom: 20,
  },
  testIncludedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  testIncludedText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // FAQs
  faqSection: {
    marginBottom: 20,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  faqQuestionText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    marginRight: 10,
    lineHeight: 18,
  },
  faqAnswerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 10,
    lineHeight: 18,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: wp(5),
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFromCartBtn: {
    backgroundColor: COLORS.danger,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
