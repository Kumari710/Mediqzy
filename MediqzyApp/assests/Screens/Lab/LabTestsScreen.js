import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { addToLabCart, getLabCartItems, getLabBookings } from '../../Utils/firebaseLabStorage';
import database from '@react-native-firebase/database';
import { getCurrentUser } from '../../Utils/firebaseAuth';


/* ---------------- COLORS ---------------- */
const COLORS = {
  primary: '#1A1A8E', // Deep blue from reference
  secondary: '#3B4FBF',
  accent: '#FFB800',
  white: '#FFFFFF',
  background: '#F8FAFC',
  text: '#1A1A2E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  tabInactive: '#94A3B8',
};

/* ---------------- CATEGORIES ---------------- */
const categories = [
  { id: 'diabetes', name: 'Diabetes', filter: 'diabetes' },
  { id: 'heart', name: 'Heart Health', filter: 'heart' },
  { id: 'liver', name: 'Liver Health', filter: 'liver' },
  { id: 'scan', name: 'MRI CT SCAN', filter: 'scan' },
];

/* ---------------- MOCK QUOTATIONS ---------------- */
const mockQuotations = [
  { id: 1, lab: 'Apollo Labs', token: '29477950', status: 'Prescription Uploaded', isDownloadable: false },
  { id: 2, lab: 'Apollo Labs', token: '29477950', status: 'Download Quotation', isDownloadable: true },
];

export default function LabTestsScreen({ navigation }) {
  // Hooks must be at the top level and always called in the same order
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(-1); // -1 for "All" or selection
  const [selectedTab, setSelectedTab] = useState('status');
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const [allTests, setAllTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [activeBookings, setActiveBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);

  // Real-time synchronization for bookings
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    const userId = user.uid;
    const bookingsRef = database().ref(`labBookings/${userId}`);
    const ordersRef = database().ref(`labOrders/${userId}`);
    const legacyOrdersRef = database().ref(`orders/${userId}`);

    const handleUpdate = async () => {
      try {
        // Fetch from all sources like OrdersScreen does
        const combinedMap = new Map();
        
        const addOrders = (data, source) => {
          if (!data) return;
          Object.entries(data).forEach(([key, value]) => {
            const isLab = value.tests || value.items || value.labName || value.lab || value.type === 'lab' || value.orderType === 'lab';
            const isPharmacy = value.products || value.pharmacyId || value.type === 'pharmacy';
            
            if (isLab && !isPharmacy) {
              const uniqueId = value.orderId || key;
              if (!combinedMap.has(uniqueId)) {
                combinedMap.set(uniqueId, {
                  id: uniqueId,
                  source: source,
                  ...value
                });
              }
            }
          });
        };

        // Fetch from labBookings
        const bookingsSnap = await database().ref(`labBookings/${userId}`).once('value');
        if (bookingsSnap.exists()) addOrders(bookingsSnap.val(), 'bookings');

        // Fetch from labOrders
        const labOrdersSnap = await database().ref(`labOrders/${userId}`).once('value');
        if (labOrdersSnap.exists()) addOrders(labOrdersSnap.val(), 'labOrders');

        // Fetch from orders (legacy)
        const ordersSnap = await database().ref(`orders/${userId}`).once('value');
        if (ordersSnap.exists()) addOrders(ordersSnap.val(), 'orders');

        const allBookings = Array.from(combinedMap.values());

        const active = allBookings.filter(b =>
          ['scheduled', 'active', 'pending', 'processing', 'ongoing', 'confirmed'].includes((b.status || '').toLowerCase()) ||
          !(b.status) || (b.status === '')
        );
        const completed = allBookings.filter(b =>
          ['completed', 'complete', 'delivered'].includes((b.status || '').toLowerCase())
        );
        setActiveBookings(active);
        setCompletedBookings(completed);
      } catch (e) {
        console.error('Error syncing bookings:', e);
      }
    };

    // Listen for changes
    bookingsRef.on('value', handleUpdate);
    ordersRef.on('value', handleUpdate);
    legacyOrdersRef.on('value', handleUpdate);

    // Initial fetch
    handleUpdate();

    return () => {
      bookingsRef.off('value', handleUpdate);
      ordersRef.off('value', handleUpdate);
      legacyOrdersRef.off('value', handleUpdate);
    };
  }, []);

  // Initial load data on focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadData = async () => {
        const user = getCurrentUser();
        if (!user) {
          if (isMounted) setLoadingTests(false);
          return;
        }
        const userId = user.uid;

        try {
          // Load cart
          const items = await getLabCartItems();
          if (isMounted) {
            setCartItems(items);
            setCartCount(items.length);
          }

          // Load tests
          const snap = await database().ref('labTests').once('value');
          if (isMounted && snap.exists()) {
            const data = snap.val();
            const list = Object.entries(data).map(([key, val]) => ({
              id: key,
              ...val,
            }));
            setAllTests(list);
          }

          // Fetch bookings from all sources (same as useEffect)
          const combinedMap = new Map();
          
          const addOrders = (data, source) => {
            if (!data) return;
            Object.entries(data).forEach(([key, value]) => {
              const isLab = value.tests || value.items || value.labName || value.lab || value.type === 'lab' || value.orderType === 'lab';
              const isPharmacy = value.products || value.pharmacyId || value.type === 'pharmacy';
              
              if (isLab && !isPharmacy) {
                const uniqueId = value.orderId || key;
                if (!combinedMap.has(uniqueId)) {
                  combinedMap.set(uniqueId, {
                    id: uniqueId,
                    source: source,
                    ...value
                  });
                }
              }
            });
          };

          // Fetch from labBookings
          const bookingsSnap = await database().ref(`labBookings/${userId}`).once('value');
          if (bookingsSnap.exists()) addOrders(bookingsSnap.val(), 'bookings');

          // Fetch from labOrders
          const labOrdersSnap = await database().ref(`labOrders/${userId}`).once('value');
          if (labOrdersSnap.exists()) addOrders(labOrdersSnap.val(), 'labOrders');

          // Fetch from orders (legacy)
          const ordersSnap = await database().ref(`orders/${userId}`).once('value');
          if (ordersSnap.exists()) addOrders(ordersSnap.val(), 'orders');

          if (isMounted) {
            const allBookings = Array.from(combinedMap.values());

            const active = allBookings.filter(b =>
              ['scheduled', 'active', 'pending', 'processing', 'ongoing', 'confirmed'].includes((b.status || '').toLowerCase()) ||
              !(b.status) || (b.status === '')
            );
            const completed = allBookings.filter(b =>
              ['completed', 'complete', 'delivered'].includes((b.status || '').toLowerCase())
            );
            setActiveBookings(active);
            setCompletedBookings(completed);
          }
        } catch (e) {
          console.error('Error loading lab data:', e);
        } finally {
          if (isMounted) setLoadingTests(false);
        }
      };

      loadData();
      return () => { isMounted = false; };
    }, [])
  );


  // Memoized filter logic
  const filteredTests = useMemo(() => {
    if (!allTests || allTests.length === 0) return [];
    let list = [...allTests];
    if (selectedCategory !== -1) {
      const filter = categories[selectedCategory]?.filter;
      if (filter) list = list.filter(t => t.category === filter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(t =>
        (t.name || '').toLowerCase().includes(s) ||
        (t.lab || '').toLowerCase().includes(s)
      );
    }
    return list;
  }, [allTests, search, selectedCategory]);

  // Ensure first test always shows as AHbA1c if it's the default view
  const displayTests = useMemo(() => {
    if (filteredTests.length > 0) return filteredTests;
    // Fallback to allTests ONLY if not searching/filtering
    if (!search && selectedCategory === -1) return allTests;
    return [];
  }, [filteredTests, allTests, search, selectedCategory]);

  const isInCart = useCallback((id) => cartItems.some(item => String(item.id) === String(id)), [cartItems]);

  const addItemToCart = async (test) => {
    if (isInCart(test.id)) return;
    setAddingToCart(test.id);
    const res = await addToLabCart(test);
    if (res.success) {
      setCartItems(res.cart);
      setCartCount(res.cart.length);
    }
    setAddingToCart(null);
  };

  const parseDateRobustly = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    // Handle DD.MM.YY format
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10) + (parts[2].length === 2 ? 2000 : 0);
      const parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  };

  const formatTestDate = (dateStr) => {
    const d = parseDateRobustly(dateStr);
    if (!d) return dateStr || '21.05.25';
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear().toString().slice(-2)}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '11:00 AM';
    // Splits by '-' or ' to ' and takes the first part (starting time)
    return timeStr.split('-')[0].split('to')[0].trim();
  };

  // Date-Based Grouping Logic
  const groupedScheduled = useMemo(() => {
    if (!activeBookings || activeBookings.length === 0) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const groups = {};

    activeBookings.forEach(b => {
      // Check multiple possible date fields used by bookings vs paid orders
      const bDate = parseDateRobustly(b.scheduledDate || b.date || b.schedule?.date || b.createdAt);

      let label;
      if (!bDate) {
        label = 'Scheduled'; // Fallback for missing/unparsable dates
      } else {
        const normalizedBDate = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate());
        if (normalizedBDate.getTime() === today.getTime()) {
          label = 'Today';
        } else if (normalizedBDate.getTime() === tomorrow.getTime()) {
          label = 'Tomorrow';
        } else {
          label = formatTestDate(b.scheduledDate || b.date);
        }
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(b);
    });

    const sortedLabels = Object.keys(groups).sort((a, b) => {
      if (a === 'Tomorrow' && b === 'Today') return -1;
      if (a === 'Today' && b === 'Tomorrow') return 1;
      if (a === 'Scheduled') return 1; // Put "Scheduled" at the bottom
      if (b === 'Scheduled') return -1;

      const getTime = (l) => {
        if (l === 'Today') return today.getTime();
        if (l === 'Tomorrow') return tomorrow.getTime();
        const d = parseDateRobustly(l);
        return d ? d.getTime() : 0;
      };
      return getTime(a) - getTime(b);
    });

    return { groups, sortedLabels };
  }, [activeBookings]);



  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lab Tests</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('OrdersScreen')}>
              <Ionicons name="time-outline" size={26} color={COLORS.primary} style={{ marginRight: 15 }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('LabCartScreen')}>
              <Ionicons name="cart-outline" size={26} color={COLORS.primary} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* SEARCH */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              placeholder="Search For Tests"
              placeholderTextColor={COLORS.textSecondary}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* BANNER */}
          <View style={styles.bannerWrapper}>
            <LinearGradient colors={['#FFFFFF', '#B9E2FA', '#194E9D']} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Book a Lab Test quickly with Prescription</Text>
                <TouchableOpacity
                  style={styles.bannerBtn}
                  onPress={() => navigation.navigate('UploadPrescriptionScreen')}
                >
                  <Text style={styles.bannerBtnText}>Upload Prescription</Text>
                </TouchableOpacity>
              </View>
              <Image source={require('../../images/BookLab.png')} style={styles.bannerImg} />
            </LinearGradient>
          </View>

          {/* CATEGORIES */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: wp(5), gap: 10 }}>
            {categories.map((c, i) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCategory(selectedCategory === i ? -1 : i)}
                style={[styles.catChip, selectedCategory === i && styles.catChipActive]}
              >
                <Text style={[styles.catText, selectedCategory === i && styles.catTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* EXPLORE LAB TESTS */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Explore Lab Tests</Text>
            <TouchableOpacity onPress={() => {
              // Enrich first test with hardcoded name if it doesn't have one
              const enrichedTests = allTests.map((test, index) => {
                if (index === 0 && !test.name) {
                  return { ...test, name: 'AHbA1c Test (Hemoglobin A1c)', testsIncluded: 3 };
                }
                return test;
              });
              navigation.navigate('LabTestsListScreen', { tests: enrichedTests, title: 'All Lab Tests', initialSearch: search });
            }}>
              <Text style={styles.viewMore}>View More</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exploreScroll} contentContainerStyle={{ paddingHorizontal: wp(5), gap: 15 }}>
            {displayTests.length > 0 ? (
              displayTests.slice(0, 5).map((test, index) => (
                <View key={test.id || index} style={styles.exploreCard}>
                  <View style={styles.exploreTop}>
                    <View style={styles.exploreIconBox}>
                      <Image source={require('../../images/vector.png')} style={styles.exploreTestIcon} />
                    </View>
                    <View style={styles.exploreContent}>
                      <Text style={styles.exploreTestName} numberOfLines={1}>
                        {(index === 0 && !search) ? 'AHbA1c Test (Hemoglobin A1c)' : test.name}
                      </Text>
                      <Text style={styles.exploreIncluded}>
                        {(index === 0 && !search) ? '3 Tests Included' : (test.testsIncluded || 1) + ' Tests Included'}
                      </Text>
                      <View style={styles.explorePriceRow}>
                        <Text style={styles.explorePrice}>Rs. {test.price || '612'}</Text>
                        <TouchableOpacity
                          style={[styles.exploreAddBtn, isInCart(test.id) && { opacity: 0.7, backgroundColor: COLORS.success }]}
                          onPress={() => addItemToCart(test)}
                          disabled={addingToCart === test.id || isInCart(test.id)}
                        >
                          {addingToCart === test.id ? (
                            <ActivityIndicator size="small" color={COLORS.white} />
                          ) : (
                            <Text style={styles.exploreAddText}>{isInCart(test.id) ? 'Added' : 'Add'}</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <View style={styles.exploreFooter}>
                    <View style={styles.exploreLabGroup}>
                      <Image source={require('../../images/apollo.png')} style={styles.exploreLabLogo} />
                      <View style={styles.exploreVLine} />
                    </View>
                    <View style={styles.exploreQuickBadge}>
                      <Text style={styles.exploreQuickText}>Quick Reports</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              !loadingTests ? (
                <Text style={styles.emptyCardText}>No matches found</Text>
              ) : (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 20 }} />
              )
            )}
          </ScrollView>

          {/* LAB TEST QUOTATIONS */}
          <View style={[styles.sectionHead, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Lab Test Quotations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LabListingScreen')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quotationScroll} contentContainerStyle={{ paddingHorizontal: wp(5), gap: 15 }}>
            {mockQuotations.map((item) => (
              <View key={item.id} style={styles.quoteCard}>
                <View style={styles.quoteCardTop}>
                  <Image source={require('../../images/apollo.png')} style={styles.quoteLabLogo} />
                  <Text style={styles.quoteLabName}>{item.lab}</Text>
                </View>
                <View style={styles.quoteCardBody}>
                  <Text style={styles.quoteTokenLabel}>Token No. : {item.token}</Text>
                  <TouchableOpacity
                    style={[styles.quoteActionBtn, item.isDownloadable && { backgroundColor: '#1A1A8E' }]}
                    onPress={() => item.isDownloadable && Alert.alert('Downloading...', 'Your quotation is being prepared.')}
                  >
                    <Text style={styles.quoteActionText}>{item.status}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>


          {/* STATUS TABS */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'status' && styles.tabActive]}
              onPress={() => setSelectedTab('status')}
            >
              <Text style={[styles.tabText, selectedTab === 'status' && styles.tabTextActive]}>Lab Test Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'scheduled' && styles.tabActive]}
              onPress={() => setSelectedTab('scheduled')}
            >
              <Text style={[styles.tabText, selectedTab === 'scheduled' && styles.tabTextActive]}>Scheduled Test</Text>
            </TouchableOpacity>
          </View>

          {/* TAB CONTENT */}
          <View style={styles.historySection}>
            {loadingTests ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 30 }} />
            ) : selectedTab === 'status' ? (
              // TAB: LAB TEST STATUS -> SHOWS ONLY COMPLETED TESTS
              <View>
                {completedBookings.length > 0 ? (
                  completedBookings.map((item, idx) => (
                    <TouchableOpacity
                      key={item.id || idx}
                      style={styles.trackingCard}
                      onPress={() => navigation.navigate('LabTestDetailsScreen', { order: item })}
                    >
                      {/* Header: Title & Logo */}
                      <View style={styles.trackTopSection}>
                        <View style={styles.trackInfoHead}>
                          <Text style={styles.trackTitle}>{item.tests?.[0]?.name || item.items?.[0]?.name || item.name || 'PCR Test'}</Text>
                          <Text style={styles.trackSub}>Test No. - {item.orderId || (item.id ? item.id.slice(-8).toUpperCase() : 'RK9755472')}</Text>
                        </View>
                        <Image source={require('../../images/apollo.png')} style={styles.trackLabLogo} />
                      </View>

                      {/* Body: Info Row */}
                      <View style={styles.trackBottomSection}>
                        <View style={styles.trackMidRow}>
                          <View style={styles.trackMidItem}>
                            <Text style={styles.trackMidLabel}>Patient name</Text>
                            <Text style={styles.trackMidValue}>{item.patientName || item.patient?.name || 'Shivakumar'}</Text>
                          </View>
                          <View style={styles.trackMidItem}>
                            <Text style={styles.trackMidLabel}>Test Date</Text>
                            <Text style={styles.trackMidValue}>{formatTestDate(item.scheduledDate || item.date || item.schedule?.date)}</Text>
                          </View>
                          <View style={styles.trackMidItem}>
                            <Text style={styles.trackMidLabel}>Report Date</Text>
                            <Text style={styles.trackMidValue}>{item.reportDate || 'TBA'}</Text>
                          </View>
                        </View>

                        {/* Stepper Logic for Tracking */}
                        <View style={styles.stepperRow}>
                          <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, styles.stepActive]}>
                              <MaterialCommunityIcons name="flask-outline" size={22} color={COLORS.primary} />
                            </View>
                            <Text style={styles.stepText}>Test Given by Patient</Text>
                          </View>
                          <View style={styles.stepLine} />
                          <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, (item.status === 'confirmed' || item.status === 'active' || item.status === 'completed') && styles.stepActive]}>
                              <MaterialCommunityIcons name="currency-inr" size={22} color={COLORS.primary} />
                            </View>
                            <Text style={styles.stepText}>Payment Done</Text>
                          </View>
                          <View style={styles.stepLine} />
                          <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, (item.status === 'processing' || item.status === 'completed') && styles.stepActive]}>
                              <MaterialCommunityIcons name="check-circle" size={22} color={COLORS.primary} />
                            </View>
                            <Text style={styles.stepText}>Sample Received</Text>
                          </View>
                          <View style={styles.stepLine} />
                          <View style={styles.stepItem}>
                            <View style={[styles.stepCircle, (item.status === 'completed') && styles.stepActive]}>
                              <MaterialCommunityIcons name="file-document-outline" size={22} color={COLORS.primary} />
                            </View>
                            <Text style={styles.stepText}>Test Results Received</Text>
                          </View>
                        </View>
                      </View>

                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No completed tests</Text>
                  </View>
                )}
              </View>
            ) : (
              // TAB: SCHEDULED TEST -> SHOWS DYNAMIC GROUPED TESTS
              <View>
                {groupedScheduled && groupedScheduled.sortedLabels.length > 0 ? (
                  groupedScheduled.sortedLabels.map(label => (
                    <View key={label}>
                      <Text style={styles.dayHeader}>{label}</Text>
                      {groupedScheduled.groups[label].map((item, idx) => (
                        <TouchableOpacity
                          key={item.id || idx}
                          style={styles.scheduledCard}
                          onPress={() => navigation.navigate('LabTestDetailsScreen', { order: item })}
                        >
                          <View style={styles.scheduledTopCompact}>
                            <View style={styles.scheduledLogoBoxSmall}>
                              <Image source={require('../../images/apollo.png')} style={styles.scheduledLogoSmall} />
                            </View>
                            <Text style={styles.scheduledTitleCompact}>{item.tests?.[0]?.name || item.items?.[0]?.name || item.name || 'Blood Test'}</Text>
                            <TouchableOpacity
                              style={styles.trackActionSmall}
                              onPress={() => navigation.navigate('CollectionDetailsScreen', { orderId: item.id, order: item })}
                            >
                              <MaterialCommunityIcons name="moped" size={20} color={COLORS.primary} />
                              <Text style={styles.trackScooterText}>Track</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.scheduledBottom}>
                            <View style={styles.sInfoRow}>
                              <View style={styles.sInfoItem}>
                                <Text style={styles.sLabel}>Patient name</Text>
                                <Text style={styles.sValueBold}>{item.patientName || item.patient?.name || 'Shivakumar'}</Text>
                              </View>
                              <View style={styles.sInfoItem}>
                                <Text style={styles.sLabel}>Test No.</Text>
                                <Text style={styles.sValue}>{item.orderId || 'RK9755472'}</Text>
                              </View>
                              <View style={styles.sInfoItem}>
                                <Text style={styles.sLabel}>Date</Text>
                                <View style={styles.dateBadge}>
                                  <Text style={styles.badgeText}>{formatTestDate(item.scheduledDate || item.date || item.schedule?.date)}</Text>
                                </View>
                              </View>
                              <View style={styles.sInfoItem}>
                                <Text style={styles.sLabel}>Time</Text>
                                <View style={styles.timeBadge}>
                                  <Text style={styles.badgeText}>{formatTime(item.scheduledTime || item.schedule?.timeSlot)}</Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.sAddressRow}>
                              <Ionicons name="location" size={16} color={COLORS.primary} />
                              <Text style={styles.sAddressText}>
                                <Text style={{ fontWeight: '700' }}>({item.address?.type || item.schedule?.addressType || 'Home'})</Text> {item.address?.address || item.schedule?.address || item.address?.landmark || 'T.nagar, Chennai 600017'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No tests available</Text>
                  </View>
                )}
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(5), paddingVertical: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', right: -5, top: -5, backgroundColor: COLORS.accent, borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.text },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', marginHorizontal: wp(5), paddingHorizontal: 15, height: 50, borderRadius: 15, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: COLORS.text },

  bannerWrapper: { paddingHorizontal: wp(5), marginBottom: 25 },
  banner: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 12 },

  bannerBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' },
  bannerBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  bannerImg: { width: 100, height: 100, position: 'absolute', right: 0, bottom: 0 },

  catScroll: { marginBottom: 25 },
  catChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  catChipActive: { backgroundColor: COLORS.white, borderColor: COLORS.primary },
  catText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  catTextActive: { color: COLORS.primary, fontWeight: '800' },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(5), marginBottom: 15, },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  viewMore: { fontSize: 14, color: COLORS.textSecondary, textDecorationLine: 'underline' },
  seeAllText: { fontSize: 14, color: COLORS.textSecondary },

  exploreScroll: { marginBottom: 20 },
  exploreCard: { width: wp(72), backgroundColor: COLORS.white, borderRadius: 18, paddingVertical: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#F1F5F9', elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, marginBottom: 10 },
  exploreTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  exploreIconBox: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  exploreTestIcon: { width: 30, height: 30, resizeMode: 'contain' },
  exploreContent: { flex: 1 },
  exploreTestName: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginBottom: 2 },
  exploreIncluded: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 10 },
  explorePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  explorePrice: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
  exploreAddBtn: { backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 15, borderRadius: 8 },
  exploreAddText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },

  exploreFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  exploreLabGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exploreLabLogo: { width: 45, height: 20, resizeMode: 'contain' },
  exploreVLine: { width: 1, height: 15, backgroundColor: '#E2E8F0' },
  exploreQuickBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  exploreQuickText: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
  emptyCardText: { textAlign: 'center', color: COLORS.textSecondary, width: wp(70), marginTop: 20 },

  quotationScroll: { marginBottom: 25 },
  quoteCard: { width: wp(52), backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, overflow: 'hidden', marginBottom: 10 },
  quoteCardTop: { backgroundColor: '#F8FAFC', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  quoteLabLogo: { width: 30, height: 30, resizeMode: 'contain', backgroundColor: COLORS.white, borderRadius: 6 },
  quoteLabName: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  quoteCardBody: { padding: 15, alignItems: 'center' },
  quoteTokenLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 15, fontWeight: '600' },
  quoteActionBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  quoteActionText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },

  tabContainer: { flexDirection: 'row', marginHorizontal: wp(5), backgroundColor: '#F1F5F9', borderRadius: 15, padding: 5, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.white, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.tabInactive },
  tabTextActive: { color: COLORS.primary, fontWeight: '800' },

  // History / Tracking Section
  historySection: { paddingHorizontal: wp(5) },
  trackingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  trackTopSection: {
    backgroundColor: '#F1F5F9', // light grey
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackBottomSection: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  trackInfoHead: { flex: 1 },
  trackTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  trackSub: { fontSize: 12, color: COLORS.textSecondary },
  trackLabLogo: { width: 50, height: 35, resizeMode: 'contain', backgroundColor: COLORS.white, borderRadius: 6 },
  trackLabLogoSmall: { width: 40, height: 28, resizeMode: 'contain', backgroundColor: COLORS.white, borderRadius: 4 },

  trackTopSectionCompact: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  trackBottomSectionCompact: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  trackTitleCompact: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginBottom: 2 },
  trackMidRowCompact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackMidValueCompact: { fontSize: 12, color: COLORS.text, fontWeight: '700' },

  trackMidRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  trackMidItem: { flex: 1 },
  trackMidLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  trackMidValue: { fontSize: 13, color: COLORS.text, fontWeight: '700' },

  stepperRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 5 },
  stepItem: { alignItems: 'center', width: wp(18) },
  stepCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F7FF', alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 1, borderColor: '#E0EEFF' },
  stepActive: { backgroundColor: '#F0F7FF', borderColor: '#E0EEFF' },
  stepText: { fontSize: 9, color: '#4B5563', textAlign: 'center', fontWeight: '500', lineHeight: 12 },
  stepLine: { height: 1, backgroundColor: '#E5E7EB', flex: 1, marginTop: 22 },

  // Scheduled Test Styles
  dayHeader: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginVertical: 15, fontWeight: '600' },
  scheduledCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  scheduledTop: {
    backgroundColor: '#F1F5F9',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduledLogoBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  scheduledLogo: { width: 32, height: 32, resizeMode: 'contain' },
  scheduledTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.primary },
  trackScooterBox: { alignItems: 'center', justifyContent: 'center' },
  scooterCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E0EEFF', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  trackScooterText: { fontSize: 8, color: COLORS.primary, fontWeight: '700', lineHeight: 9 },

  scheduledBottom: { padding: 18 },
  sInfoRow: { flexDirection: 'row', gap: 15, marginBottom: 10 },
  sInfoItem: {},
  sLabel: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 5 },
  sValue: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  sValueBold: { fontSize: 12, color: COLORS.text, fontWeight: '800' },

  dateBadge: { backgroundColor: '#4F75FF', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  timeBadge: { backgroundColor: '#FF6B6B', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },

  sAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 },
  sAddressText: { fontSize: 11, color: COLORS.textSecondary },
  noDataContainer: { padding: 40, alignItems: 'center' },
  noDataText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },

  // New Compact Styles
  trackActionMini: { alignItems: 'center', marginRight: 10 },
  trackActionTextMini: { fontSize: 8, color: COLORS.primary, fontWeight: '800' },
  scheduledTopCompact: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduledLogoBoxSmall: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  scheduledLogoSmall: { width: 36, height: 36, resizeMode: 'contain' },
  scheduledTitleCompact: { flex: 1, fontSize: 14, fontWeight: '800', color: COLORS.primary },
  trackActionSmall: { alignItems: 'center', justifyContent: 'center' },
});

