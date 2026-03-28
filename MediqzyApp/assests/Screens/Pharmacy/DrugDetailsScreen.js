import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  scale,
  verticalScale,
  moderateScale,
  wp,
  hp,
} from '../../Utils/responsive';
import {
  addToCart,
  addToFavorites,
  removeFromFavorites,
  isInFavorites,
} from '../../Utils/firebasePharmacyStorage';

export default function DrugDetailsScreen({ navigation, route }) {
  const { product } = route.params || {};
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  React.useEffect(() => {
    if (product?.id) {
      checkFavoriteStatus();
    }
  }, [product]);

  const checkFavoriteStatus = async () => {
    const status = await isInFavorites(product.id);
    setIsFav(status);
  };

  /* ---------- SAFETY CHECK ---------- */
  if (!product) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centered}>
            <Ionicons
              name="alert-circle-outline"
              size={moderateScale(60)}
              color="#D1D5DB"
            />
            <Text style={styles.errorText}>Product not found</Text>
            <TouchableOpacity
              style={styles.goBackBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  /* ---------- ACTIONS ---------- */
  const handleAddToCart = async () => {
    const result = await addToCart({ ...product, qty });
    if (result.success) {
      Alert.alert('Success', `${product.name} added to cart!`);
    } else {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const toggleFavorite = async () => {
    if (isFav) {
      await removeFromFavorites(product.id);
      setIsFav(false);
    } else {
      await addToFavorites(product);
      setIsFav(true);
    }
  };

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={moderateScale(24)} />
          </TouchableOpacity>
          <Text style={styles.title}>Drug Details</Text>
          <View style={{ width: scale(24) }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Product Card */}
          <View style={styles.card}>
            <Image
              source={
                product.image
                  ? product.image
                  : product.imageName === 'drug2.png'
                    ? require('../../images/drug2.png')
                    : require('../../images/drug1.png')
              }
              style={styles.image}
              resizeMode="contain"
            />

            <View style={styles.row}>
              <Text style={styles.name}>{product.name}</Text>
              <TouchableOpacity onPress={toggleFavorite}>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={moderateScale(28)}
                  color="#FF4D4D"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.qtyText}>
              {product.desc || product.description}
            </Text>

            <View style={styles.ratingRow}>
              {[1, 2, 3, 4].map(i => (
                <Ionicons
                  key={i}
                  name="star"
                  size={moderateScale(16)}
                  color="#FFD700"
                />
              ))}
              <Text style={styles.rating}>4.0</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>Rs. {product.price}</Text>

              <View style={styles.counter}>
                <TouchableOpacity
                  onPress={() => setQty(Math.max(1, qty - 1))}
                  style={styles.counterBtnContainer}
                >
                  <Text style={styles.counterBtn}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qty}>{qty}</Text>

                <TouchableOpacity
                  onPress={() => setQty(qty + 1)}
                  style={styles.counterBtnContainer}
                >
                  <Text style={styles.counterBtn}>＋</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.descText} numberOfLines={showFullDesc ? undefined : 3}>
              {product.description ||
                `${product.name} is a trusted medication that provides effective relief from common symptoms. It is formulated with high-quality ingredients for fast action and long-lasting results.`}
            </Text>

            {showFullDesc && (
              <>
                <Text style={styles.descSubTitle}>Usage Instructions</Text>
                <Text style={styles.descText}>
                  • Take as directed by your physician{'\n'}
                  • Recommended for adults and children above 12 years{'\n'}
                  • Store in a cool, dry place away from sunlight
                </Text>

                <Text style={styles.descSubTitle}>Dosage</Text>
                <Text style={styles.descText}>
                  Adults: 1-2 tablets every 4-6 hours as needed{'\n'}
                  Do not exceed 8 tablets in 24 hours
                </Text>
              </>
            )}

            <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
              <Text style={styles.readMore}>
                {showFullDesc ? 'Read less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pharmacy */}
          <View style={styles.pharmacyCard}>
            <Image
              source={require('../../images/apollo.png')}
              style={styles.logo}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.pharmacyName}>Apollo Pharmacy</Text>
              <Text style={styles.addr}>T.nagar, Chennai 600017</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons
                name="call-outline"
                size={moderateScale(20)}
                color="#23238E"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.viewBtn} onPress={() => navigation.navigate('PharmacyListScreen')}>
            <Text style={styles.viewText}>View Pharmacy</Text>
            <Ionicons
              name="arrow-forward"
              size={moderateScale(18)}
              color="#23238E"
            />
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
            <Ionicons
              name="cart-outline"
              size={moderateScale(20)}
              color="#23238E"
            />
            <Text style={styles.cartBtnText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() =>
              navigation.navigate('LocationScreen', {
                amount: product.price * qty,
                type: 'pharmacy',
              })
            }
          >
            <Text style={styles.buyText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  safeArea: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  errorText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  goBackBtn: {
    marginTop: 20,
    backgroundColor: '#23238E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  goBackText: { color: '#fff', fontWeight: '600' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: { fontSize: 18, fontWeight: '700' },

  scrollContent: { padding: wp(5), paddingBottom: hp(2) },

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },

  image: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 16,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 20, fontWeight: '700', flex: 1 },
  qtyText: { color: '#6B7280', marginVertical: 8 },

  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { marginLeft: 8, fontWeight: '600' },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  price: { fontSize: 24, fontWeight: '700', color: '#23238E' },

  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#23238E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  counterBtnContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F0F4FF',
  },
  counterBtn: {
    fontSize: 18,
    fontWeight: '700',
    color: '#23238E',
  },
  qty: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#23238E',
    textAlign: 'center',
    minWidth: 40,
  },

  descCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FAFBFF',
  },
  descTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  descSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#23238E',
  },
  descText: {
    color: '#6B7280',
    lineHeight: 22,
    fontSize: 13,
  },
  readMore: {
    color: '#23238E',
    fontWeight: '600',
    marginTop: 12,
  },

  pharmacyCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  logo: { width: 50, height: 50, marginRight: 12 },
  pharmacyName: { fontWeight: '700' },
  addr: { fontSize: 13, color: '#6B7280' },
  callBtn: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 25,
  },

  viewBtn: {
    marginTop: 16,
    backgroundColor: '#F0F4FF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  viewText: { color: '#23238E', fontWeight: '700' },

  btnRow: {
    flexDirection: 'row',
    gap: 12,
    padding: wp(5),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cartBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#23238E',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cartBtnText: { color: '#23238E', fontWeight: '700' },

  buyBtn: {
    flex: 1,
    backgroundColor: '#23238E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyText: { color: '#fff', fontWeight: '700' },
});
