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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { onDataChange, getData, db } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  // Subscribe to real-time updates from ALL relevant sources
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setDebugInfo('No User Logged In');
      setLoading(false);
      return;
    }

    setDebugInfo(`Logged in as: ${user.uid.slice(0, 8)}...`);

    let pharmacyData = null;
    let labData = null;
    let legacyData = null;
    let allOrdersData = null;

    const combineAndSetOrders = () => {
      const combinedMap = new Map();

      const addOrders = (data, defaultType) => {
        if (!data) return;
        Object.entries(data).forEach(([key, value]) => {
          // STRICT FILTER: Only show Lab tests, avoid Pharmacy/Product orders
          const isLab = value.tests || value.labName || value.type === 'lab' || value.source === 'bookings';
          const isPharmacy = value.products || value.pharmacyId || value.type === 'pharmacy';

          if (isLab && !isPharmacy) {
            const uniqueId = value.orderId || key;
            if (!combinedMap.has(uniqueId)) {
              combinedMap.set(uniqueId, {
                id: uniqueId,
                type: 'lab',
                ...value
              });
            }
          }
        });
      };

      addOrders(pharmacyData, 'pharmacy');
      addOrders(labData, 'lab');
      addOrders(legacyData, 'pharmacy');
      addOrders(allOrdersData, 'pharmacy');

      const ordersList = Array.from(combinedMap.values());
      ordersList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setOrders(ordersList);
      setLoading(false);
      setDebugInfo(`Loaded ${ordersList.length} lab records`);
    };

    // Subscriptions
    const unsubPharmacy = onDataChange(`pharmacyOrders/${user.uid}`, (data) => {
      pharmacyData = data;
      combineAndSetOrders();
    });

    const unsubLab = onDataChange(`labOrders/${user.uid}`, (data) => {
      labData = data;
      combineAndSetOrders();
    });

    const unsubLegacy = onDataChange(`orders/${user.uid}`, (data) => {
      legacyData = data;
      combineAndSetOrders();
    });

    const unsubAll = onDataChange('allOrders', (data) => {
      allOrdersData = data;
      combineAndSetOrders();
    });

    // Connection check
    const connectedRef = db().ref('.info/connected');
    const unsubConnection = connectedRef.on('value', (snap) => {
      if (snap.val() === false) {
        setDebugInfo('Searching for network...');
      }
    });

    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 8000);

    return () => {
      if (unsubPharmacy) unsubPharmacy();
      if (unsubLab) unsubLab();
      if (unsubLegacy) unsubLegacy();
      if (unsubAll) unsubAll();
      connectedRef.off('value', unsubConnection);
      clearTimeout(timer);
    };
  }, []);

  const loadOrders = async () => {
    const user = getCurrentUser();
    if (!user) return;

    try {
      setRefreshing(true);
      const [pharmacyRes, labRes, legacyRes, allRes] = await Promise.all([
        getData(`pharmacyOrders/${user.uid}`),
        getData(`labOrders/${user.uid}`),
        getData(`orders/${user.uid}`),
        getData('allOrders')
      ]);

      const combinedMap = new Map();
      const addFromRes = (res, defaultType) => {
        if (res.success && res.data) {
          Object.entries(res.data).forEach(([key, value]) => {
            const id = value.orderId || key;
            if (!combinedMap.has(id)) {
              combinedMap.set(id, { id, type: value.type || value.orderType || defaultType, ...value });
            }
          });
        }
      };

      addFromRes(pharmacyRes, 'pharmacy');
      addFromRes(labRes, 'lab');
      addFromRes(legacyRes, 'pharmacy');
      addFromRes(allRes, 'pharmacy');

      const finalOrders = Array.from(combinedMap.values());
      finalOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(finalOrders);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  /**
   * Normalizes a date to midnight (start of day) in local timezone
   * This ensures we compare calendar days, not 24-hour periods
   */
  const normalizeToMidnight = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  /**
   * Formats a date string into a user-friendly label
   * - Today's orders → "Today"
   * - Yesterday's orders → "Yesterday"  
   * - This year's orders → "24 Jan"
   * - Older orders → "24 Jan 2025"
   */
  const formatDateLabel = (dateString) => {
    if (!dateString) return 'Recent';

    const orderDate = new Date(dateString);

    // Check if date is valid
    if (isNaN(orderDate.getTime())) return 'Recent';

    const now = new Date();

    // Normalize both dates to midnight for accurate calendar day comparison
    const todayMidnight = normalizeToMidnight(now);
    const orderMidnight = normalizeToMidnight(orderDate);

    // Calculate difference in calendar days
    const diffTime = todayMidnight.getTime() - orderMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    // For orders older than yesterday
    const isCurrentYear = orderDate.getFullYear() === now.getFullYear();

    if (isCurrentYear) {
      // Same year: "24 Jan"
      return orderDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
    } else {
      // Different year: "24 Jan 2025"
      return orderDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  /**
   * Returns a sortable key for date grouping
   * This ensures proper chronological order: Today > Yesterday > Older dates
   */
  const getDateSortKey = (dateString) => {
    if (!dateString) return 0;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 0;
    return date.getTime();
  };


  const getItemImage = (item, type) => {
    if (type === 'lab') return require('../../images/labtest.png');
    if (item.imageName === 'drug2.png') return require('../../images/drug2.png');
    return require('../../images/drug1.png');
  };

  const renderOrderItem = (item) => {
    // Get test image from item data
    const testImageUrl = item.image || item.imageUrl || item.testImage || null;
    
    return (
      <View key={item.id || Math.random()} style={styles.testTile}>
        <View style={styles.tileImageBox}>
          {testImageUrl ? (
            <Image source={{ uri: testImageUrl }} style={styles.tileImage} />
          ) : (
            <Image source={require('../../images/labtest.png')} style={styles.tileImage} />
          )}
        </View>
        <Text style={styles.tileName} numberOfLines={1}>{item.name || 'Test Name'}</Text>
        <Text style={styles.tileCount}>{item.testsIncluded || 3} Tests</Text>
      </View>
    );
  };

  const renderOrderCard = (order) => {
    const status = (order.status || 'Pending').toLowerCase();
    const isOngoing = status === 'pending' || status === 'on-going' || status === 'active' || status === 'processing';
    const isCompleted = status === 'completed' || status === 'delivered';

    // Get lab image from order data (supports multiple possible field names)
    const labImageUrl = order.lab?.image || order.labImage || order.image || null;

    return (
      <View key={order.id} style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.cardMain}
          onPress={() => navigation.navigate('LabTestDetailsScreen', { order })}
        >
          {/* Top Section: Logo, Name, Badge */}
          <View style={styles.cardHeader}>
            <View style={styles.logoSquare}>
              {labImageUrl ? (
                <Image source={{ uri: labImageUrl }} style={styles.labLogoImage} />
              ) : (
                <Image source={require('../../images/apollo.png')} style={styles.labLogoImage} />
              )}
            </View>
            <Text style={styles.labNameText}>{order.labName || order.lab?.name || 'Apollo Labs'}</Text>
            <View style={[styles.badge, isOngoing ? styles.ongoingBadge : styles.completeBadge]}>
              <Text style={styles.badgeText}>{isOngoing ? 'On-going' : 'Complete'}</Text>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.locationContainer}>
            <View style={styles.locLeft}>
              <Ionicons name="location" size={16} color="#23238E" />
              <Text style={styles.locText} numberOfLines={1}>
                {isCompleted && <Text style={{ fontWeight: '700' }}>Location: </Text>}
                ({order.addressType || 'Home'}) {order.address || 'T.nagar, Chennai 600017'}
              </Text>
            </View>
            {isOngoing && (
              <TouchableOpacity
                style={styles.trackCol}
                onPress={() => navigation.navigate('CollectionDetailsScreen', { orderId: order.id, order })}
              >
                <View style={styles.trackCircle}>
                  <Ionicons name="moped" size={14} color="#23238E" />
                </View>
                <Text style={styles.trackLabelText}>Track</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.cardDivider} />

          {/* Items & Price Section */}
          <View style={styles.itemsPriceRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tilesList}>
              {(order.items || order.tests || [{ name: 'Full Body Checkup' }]).slice(0, 3).map((item, idx) => renderOrderItem(item))}
              {(order.items?.length > 3 || order.tests?.length > 3) && (
                <View style={styles.moreIconBox}>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              )}
            </ScrollView>

            <View style={styles.priceCol}>
              <Text style={styles.priceLabel}>Rs. {order.total || 200}</Text>
            </View>
          </View>

          {/* Bottom Button for Completed */}
          {isCompleted && (
            <TouchableOpacity
              style={styles.rebookBtn}
              onPress={() => navigation.navigate('LabTestsScreen')}
            >
              <Text style={styles.rebookText}>Re-book Service</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // Group orders by date label with proper sorting
  const groupedOrders = React.useMemo(() => {
    // First, group orders by label while keeping track of the newest order in each group
    const groups = orders.reduce((acc, order) => {
      const label = formatDateLabel(order.createdAt);
      if (!acc[label]) {
        acc[label] = {
          orders: [],
          newestTimestamp: 0,
          label: label,
          // Priority: Today = 2, Yesterday = 1, other = 0
          priority: label === 'Today' ? 2 : label === 'Yesterday' ? 1 : 0
        };
      }
      acc[label].orders.push(order);

      // Track the newest order timestamp for sorting
      const orderTime = new Date(order.createdAt || 0).getTime();
      if (orderTime > acc[label].newestTimestamp) {
        acc[label].newestTimestamp = orderTime;
      }

      return acc;
    }, {});

    // Sort groups: Today > Yesterday > Other dates (newest first)
    const sortedLabels = Object.keys(groups).sort((a, b) => {
      const groupA = groups[a];
      const groupB = groups[b];

      // First sort by priority (Today, Yesterday)
      if (groupA.priority !== groupB.priority) {
        return groupB.priority - groupA.priority;
      }

      // Then by newest timestamp (most recent first)
      return groupB.newestTimestamp - groupA.newestTimestamp;
    });

    // Build final sorted object
    const sortedGroups = {};
    sortedLabels.forEach(label => {
      // Sort orders within each group by newest first
      const sortedGroupOrders = [...groups[label].orders].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      sortedGroups[label] = sortedGroupOrders;
    });

    return sortedGroups;
  }, [orders]);


  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#23238E" />
        <Text style={{ marginTop: 15, color: '#666', fontSize: moderateScale(14) }}>{debugInfo}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnCircle}>
            <Ionicons name="arrow-back" size={moderateScale(22)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Orders</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshIcon}>
            <Ionicons name="refresh-outline" size={moderateScale(22)} color="#23238E" />
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={moderateScale(80)} color="#DDD" />
            <Text style={styles.emptyTitle}>No Records Found</Text>
            <Text style={styles.emptySubtitle}>{debugInfo}</Text>
            <TouchableOpacity style={styles.startShoppingBtn} onPress={() => navigation.navigate('HomeScreen')}>
              <Text style={styles.startShoppingText}>Explore Health Services</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: verticalScale(24) }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#23238E']} />}
          >
            {Object.keys(groupedOrders).map((label) => (
              <View key={label}>
                <Text style={styles.sectionTitle}>{label}</Text>
                {groupedOrders[label].map(renderOrderCard)}
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: verticalScale(14),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA'
  },
  headerTitleText: { fontSize: moderateScale(18), fontWeight: '600', color: '#1A1A1A', flex: 1, marginLeft: 10 },
  backBtnCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  refreshIcon: { padding: scale(4) },

  sectionTitle: {
    fontSize: moderateScale(15),
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: verticalScale(20),
    fontWeight: '500'
  },

  cardContainer: {
    marginHorizontal: wp(5),
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden'
  },
  cardMain: { padding: 0 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8FAFC'
  },
  logoSquare: {
    width: 36,
    height: 36,
    backgroundColor: '#FFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowOpacity: 0.05
  },
  labLogoImage: { width: 26, height: 26, resizeMode: 'contain' },
  labNameText: { fontSize: 14, fontWeight: '700', color: '#1A1A8E', flex: 1, marginLeft: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  ongoingBadge: { backgroundColor: '#1F2287' },
  completeBadge: { backgroundColor: '#10B981' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  locText: { marginLeft: 6, fontSize: 12, color: '#4B5563', flex: 1 },
  trackCol: { alignItems: 'center' },
  trackCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#E0EEFF'
  },
  trackLabelText: { fontSize: 8, color: '#1A1A8E', fontWeight: '800' },

  cardDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 12 },

  itemsPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  tilesList: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  testTile: {
    width: 55,
    height: 62,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    backgroundColor: '#FFF'
  },
  tileImageBox: { marginBottom: 2 },
  tileImage: { width: 24, height: 24, resizeMode: 'contain' },
  tileName: { fontSize: 9, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  tileCount: { fontSize: 7, color: '#94A3B8', marginTop: 1 },
  moreIconBox: { padding: 4, alignItems: 'center', justifyContent: 'center' },

  priceCol: { flex: 1, alignItems: 'flex-end' },
  priceLabel: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },

  rebookBtn: {
    backgroundColor: '#1A1A8E',
    margin: 10,
    marginTop: 0,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  rebookText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(10) },
  emptyTitle: { fontSize: moderateScale(18), fontWeight: '700', color: '#1F2937', marginTop: verticalScale(15) },
  emptySubtitle: { fontSize: moderateScale(13), color: '#6B7280', textAlign: 'center', marginTop: verticalScale(8) },
  startShoppingBtn: { backgroundColor: '#1A1A8E', paddingHorizontal: scale(25), paddingVertical: verticalScale(12), borderRadius: scale(12), marginTop: verticalScale(25) },
  startShoppingText: { color: '#fff', fontSize: moderateScale(14), fontWeight: '700' },
});
