import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { pushData, onDataChange } from '../../Utils/firebaseDatabase';
import { getCurrentUser } from '../../Utils/firebaseAuth';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DoctorChatScreen({ navigation, route }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showJoinCall, setShowJoinCall] = useState(true);
  const scrollViewRef = useRef();

  const doctor = route?.params?.doctor || {};
  const doctorName = doctor.name || route?.params?.appointment?.doctorName || 'Doctor';
  const doctorSpec = doctor.specialty || route?.params?.appointment?.specialty || 'Specialist';
  const doctorId = doctor.id || route?.params?.appointment?.doctorId || 'default_doctor';

  const appointmentId = route?.params?.appointmentId || route?.params?.appointment?.id;
  const chatRoomId = appointmentId || `chat_${doctorId}`;

  useEffect(() => {
    // Subscribe to chat messages
    const unsubscribe = onDataChange(`chats/${chatRoomId}/messages`, (data) => {
      if (data) {
        const messageList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        // Sort by timestamp
        messageList.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(messageList);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatRoomId]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const user = getCurrentUser();
    const newMessage = {
      text: message.trim(),
      senderId: user?.uid || 'patient',
      senderName: user?.displayName || 'Patient',
      isDoctor: false,
      timestamp: new Date().toISOString(),
    };

    setMessage('');

    // Push to Firebase
    await pushData(`chats/${chatRoomId}/messages`, newMessage);
  };

  const handleJoinCall = () => {
    navigation.navigate('DocVideoCallScreen', { doctor: { ...doctor, name: doctorName, specialty: doctorSpec, id: doctorId }, appointmentId });
  };

  const handleDownloadPrescription = () => {
    navigation.navigate('PrescriptionDownloadScreen', { doctor: { name: doctorName, specialty: doctorSpec } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp(2) : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat with Doctor</Text>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="person-circle-outline" size={moderateScale(32)} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Doctor Info Bar */}
        <View style={styles.doctorBar}>
          <Image source={require('../../images/IndianDoctor.png')} style={styles.doctorAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.doctorSpecialty}>{doctorSpec}</Text>
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('CallScreen', { doctor })}>
            <Ionicons name="call-outline" size={moderateScale(22)} color="#23238E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callBtn} onPress={handleJoinCall}>
            <Ionicons name="videocam" size={moderateScale(18)} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={moderateScale(48)} color="#DDD" />
              <Text style={styles.emptyChatText}>No messages yet</Text>
              <Text style={styles.emptyChatSub}>Start chatting with your doctor</Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.isDoctor ? styles.doctorMessage : styles.userMessage,
                ]}
              >
                {msg.isDoctor && (
                  <View style={styles.messageAvatar}>
                    <Ionicons name="person" size={moderateScale(16)} color="#888" />
                  </View>
                )}
                <View style={[styles.messageContent, msg.isDoctor ? styles.doctorBubble : styles.userBubble]}>
                  <Text style={[styles.messageText, msg.isDoctor ? styles.doctorText : styles.userText]}>
                    {msg.text}
                  </Text>
                  <Text style={styles.messageTime}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {!msg.isDoctor && (
                  <View style={styles.messageAvatar}>
                    <Ionicons name="person" size={moderateScale(16)} color="#23238E" />
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {showJoinCall ? (
            <TouchableOpacity style={styles.joinCallBtn} onPress={handleJoinCall}>
              <Ionicons name="videocam" size={moderateScale(20)} color="#fff" />
              <Text style={styles.joinCallText}>JOIN CALL</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.downloadPrescriptionBtn} onPress={handleDownloadPrescription}>
              <Text style={styles.downloadPrescriptionText}>Download Prescription</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.uploadBtn}>
            <Ionicons name="attach" size={moderateScale(18)} color="#23238E" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type Here..."
              placeholderTextColor="#888"
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !message.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={moderateScale(20)} color={message.trim() ? "#fff" : "#888"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: '#fff',
  },
  headerTitle: { flex: 1, fontSize: moderateScale(18), fontWeight: '600', color: '#222', marginLeft: scale(12) },
  profileBtn: {
    padding: scale(4),
  },
  doctorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(4),
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 5,
  },
  doctorAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    marginRight: scale(12),
  },
  doctorName: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    color: '#23238E',
  },
  doctorSpecialty: {
    fontSize: moderateScale(12),
    color: '#888',
  },
  actionBtn: {
    padding: scale(8),
    marginRight: scale(8),
  },
  callBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: scale(16),
    paddingTop: hp(4),
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: verticalScale(16),
  },
  doctorMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    maxWidth: '70%',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: scale(18),
    marginHorizontal: scale(8),
  },
  doctorBubble: {
    backgroundColor: '#F0F0F0',
  },
  userBubble: {
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: moderateScale(14),
  },
  doctorText: {
    color: '#222',
  },
  userText: {
    color: '#222',
  },
  actionContainer: {
    paddingHorizontal: wp(4),
    marginBottom: hp(1),
  },
  joinCallBtn: {
    flexDirection: 'row',
    backgroundColor: '#23238E',
    borderRadius: scale(8),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  joinCallText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  downloadPrescriptionBtn: {
    backgroundColor: '#23238E',
    borderRadius: scale(8),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
  downloadPrescriptionText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    paddingBottom: hp(4),
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8F0',
    borderRadius: scale(20),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    marginRight: scale(8),
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: scale(20),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
  },
  textInput: {
    fontSize: moderateScale(14),
    color: '#222',
    padding: 0,
  },
  sendBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#23238E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
  },
  sendBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  messageTime: {
    fontSize: moderateScale(10),
    color: '#999',
    marginTop: verticalScale(4),
    alignSelf: 'flex-end',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
  },
  emptyChatText: {
    fontSize: moderateScale(16),
    color: '#888',
    marginTop: verticalScale(12),
  },
  emptyChatSub: {
    fontSize: moderateScale(13),
    color: '#BBB',
    marginTop: verticalScale(4),
  },
});
