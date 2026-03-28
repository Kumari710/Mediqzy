import React, { useState, useEffect, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hp } from '../../Utils/responsive';
import { onDataChange } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';

export default function ManageProductsScreen() {
    const navigation = useNavigation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            setLoading(false);
            return;
        }

        let data1, data2, data3;

        const mergeOrders = () => {
            const map = new Map();

            const process = (data) => {
                if (!data) return;
                Object.entries(data).forEach(([key, value]) => {
                    const isPharmacy =
                        value.products ||
                        value.pharmacyId ||
                        value.type === 'pharmacy' ||
                        value.orderType === 'pharmacy';

                    if (isPharmacy) {
                        const id = value.orderId || key;
                        if (!map.has(id)) {
                            map.set(id, { id, ...value });
                        }
                    }
                });
            };

            process(data1);
            process(data2);
            process(data3);

            const getValidDate = (o) => {
                const ds = o.createdAt || o.date || o.orderDate || o.timestamp;
                if (!ds) return 0;
                const d = new Date(ds);
                return isNaN(d.getTime()) ? 0 : d.getTime();
            };

            const finalData = Array.from(map.values()).sort(
                (a, b) => getValidDate(b) - getValidDate(a)
            );

            setOrders(finalData);
            setLoading(false);
        };

        const u1 = onDataChange(`pharmacyOrders/${user.uid}`, d => {
            data1 = d;
            mergeOrders();
        });

        const u2 = onDataChange(`orders/${user.uid}`, d => {
            data2 = d;
            mergeOrders();
        });

        const u3 = onDataChange(`allOrders`, d => {
            data3 = d;
            mergeOrders();
        });

        return () => {
            u1 && u1();
            u2 && u2();
            u3 && u3();
        };
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    };

    const formatDateLabel = (date) => {
        if (!date) return 'Recent';

        const d = new Date(date);
        const today = new Date();
        const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const o = new Date(d.getFullYear(), d.getMonth(), d.getDate());

        if (o.getTime() === t.getTime()) return 'Today';

        t.setDate(t.getDate() - 1);
        if (o.getTime() === t.getTime()) return 'Yesterday';

        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const groupedOrders = useMemo(() => {
        const g = {};
        orders.forEach(o => {
            const label = formatDateLabel(o.createdAt || o.date || o.orderDate || o.timestamp);
            if (!g[label]) g[label] = [];
            g[label].push(o);
        });

        // Define priority for Today and Yesterday
        const priority = { 'Today': 3, 'Yesterday': 2, 'Recent': 1 };

        return Object.keys(g)
            .sort((a, b) => {
                if (priority[a] || priority[b]) {
                    return (priority[b] || 0) - (priority[a] || 0);
                }
                // For other dates, simple descending comparison works if they were added in order
                // or just parse them if needed. But priority handles the edge cases.
                return 0;
            })
            .reduce((acc, key) => {
                acc[key] = g[key];
                return acc;
            }, {});
    }, [orders]);

    const renderOrderCard = (order) => {
        const status = (order.status || 'pending').toLowerCase();
        const badgeColor =
            status === 'completed' || status === 'delivered'
                ? '#10B981'
                : status === 'cancelled'
                    ? '#EF4444'
                    : '#1E2287';

        return (
            <View
                key={order.id}
                style={styles.card}
            >
                <Image
                    source={require('../../images/apollo.png')}
                    style={styles.logo}
                />

                <View style={styles.textWrap}>
                    <Text style={styles.title} numberOfLines={1}>
                        {order.pharmacy?.name || 'Apollo Pharmacy'}
                    </Text>
                    <Text style={styles.subText} numberOfLines={1}>
                        {order.addressType || 'Home'} - {order.address || 'T Nagar'}
                    </Text>
                </View>

                <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.badgeText}>
                        {status.toUpperCase()}
                    </Text>
                </View>

            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerAction}>
                        <Ionicons name="arrow-back" size={22} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Orders</Text>
                    <View style={styles.headerAction} />
                </View>

                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    {orders.length === 0 && !loading ? (
                        <View style={styles.empty}>
                            <Ionicons
                                name="receipt-outline"
                                size={70}
                                color="#CBD5E1"
                            />
                            <Text style={styles.emptyText}>
                                No orders found
                            </Text>
                        </View>
                    ) : (
                        Object.keys(groupedOrders).map(label => (
                            <View key={label}>
                                <Text style={styles.dateLabel}>{label}</Text>
                                {groupedOrders[label].map(renderOrderCard)}
                            </View>
                        ))
                    )}

                    {loading && (
                        <ActivityIndicator
                            size="large"
                            color="#1E2287"
                            style={{ marginTop: 20 }}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
        color: '#1A1A1A',
    },
    headerAction: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },

    dateLabel: {
        textAlign: 'center',
        color: '#94A3B8',
        marginVertical: 12,
        fontWeight: '600',
    },

    card: {
        height: 44,
        marginHorizontal: 15,
        marginBottom: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },

    logo: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginRight: 10,
    },

    textWrap: {
        flex: 1,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1E2287',
        lineHeight: 14,
    },
    subText: {
        fontSize: 9,
        color: '#64748B',
        lineHeight: 11,
    },

    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6,
    },
    badgeText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#FFF',
    },

    empty: {
        alignItems: 'center',
        marginTop: hp(12),
    },
    emptyText: {
        marginTop: 10,
        color: '#64748B',
        fontSize: 15,
    },
});
