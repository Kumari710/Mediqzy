import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatsScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');

  const chats = [
    {
      id: 1,
      name: 'Dr. Sri Hariharan',
      specialty: 'ENT',
      lastMessage: 'Pls let me know if there are side effects',
      time: '18.31',
      unreadCount: 5,
      isOnline: false,
    },
    {
      id: 2,
      name: 'Dr. Ranganayaki',
      specialty: 'General Physicist',
      lastMessage: 'We can have a review in 20 days',
      time: '16.04',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 3,
      name: 'Dr. Ramesh K',
      specialty: '',
      lastMessage: 'Great! Thank you',
      time: '06.12',
      unreadCount: 0,
      isOnline: true,
    },
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchText.toLowerCase()) ||
    chat.specialty.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={moderateScale(20)} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search For Doctor..."
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        {filteredChats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            onPress={() => navigation.navigate('DoctorChatScreen', { doctor: chat })}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={moderateScale(24)} color="#888" />
              </View>
              {chat.isOnline && <View style={styles.onlineIndicator} />}
              {!chat.isOnline && chat.unreadCount === 0 && <View style={[styles.onlineIndicator, { backgroundColor: '#FFD700' }]} />}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.doctorName}>
                  {chat.name} {chat.specialty ? <Text style={styles.specialty}>({chat.specialty})</Text> : null}
                </Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <View style={styles.chatFooter}>
                <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },
  searchContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: scale(25),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#222',
    marginLeft: scale(10),
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: scale(12),
  },
  avatar: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: scale(2),
    left: scale(2),
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  doctorName: {
    fontSize: moderateScale(15),
    fontWeight: 'bold',
    color: '#23238E',
  },
  specialty: {
    fontSize: moderateScale(13),
    fontWeight: 'normal',
    color: '#888',
  },
  chatTime: {
    fontSize: moderateScale(12),
    color: '#888',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: moderateScale(13),
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#23238E',
    borderRadius: scale(10),
    minWidth: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(6),
  },
  unreadCount: {
    color: '#fff',
    fontSize: moderateScale(11),
    fontWeight: 'bold',
  },
});
