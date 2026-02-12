import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale, moderateScale, wp, hp } from '../../Utils/responsive';
import { getMedicalConsultation } from '../../Utils/geminiService';
import LinearGradient from 'react-native-linear-gradient';

const AIAssistantScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Hello! I'm your MediQzy AI Assistant. How can I help you today? (e.g., 'What are the symptoms of a cold?' or 'Explain the importance of hydration')",
            sender: 'ai',
            timestamp: new Date().toISOString(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef();

    const handleSend = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const aiResponseText = await getMedicalConsultation(inputText);

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userContainer : styles.aiContainer
        ]}>
            {item.sender === 'ai' && (
                <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={moderateScale(12)} color="#fff" />
                </View>
            )}

            {item.sender === 'ai' ? (
                <LinearGradient
                    colors={['#F0F4FF', '#E1E9FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.messageBubble, styles.aiBubble]}
                >
                    <Text style={[styles.messageText, styles.aiText]}>{item.text}</Text>
                    <Text style={styles.timestamp}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </LinearGradient>
            ) : (
                <View style={[styles.messageBubble, styles.userBubble]}>
                    <Text style={[styles.messageText, styles.userText]}>{item.text}</Text>
                    <Text style={[styles.timestamp, { color: 'rgba(255,255,255,0.7)' }]}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={moderateScale(24)} color="#1E3A8A" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Ionicons name="sparkles" size={moderateScale(20)} color="#4361EE" />
                        <Text style={styles.headerTitle}>AI Assistant</Text>
                    </View>
                    <View style={{ width: scale(40) }} />
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type your health query..."
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Ionicons name="send" size={moderateScale(20)} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

export default AIAssistantScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: scale(8),
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: '#1E3A8A',
        marginLeft: scale(8),
    },
    messageList: {
        padding: wp(4),
        paddingBottom: hp(2),
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: verticalScale(16),
        alignItems: 'flex-end',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    aiContainer: {
        justifyContent: 'flex-start',
    },
    aiAvatar: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        backgroundColor: '#4361EE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(8),
        marginBottom: verticalScale(4),
    },
    messageBubble: {
        maxWidth: '80%',
        padding: scale(14),
        borderRadius: scale(20),
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    userBubble: {
        backgroundColor: '#23238E',
        borderBottomRightRadius: 2,
    },
    aiBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    messageText: {
        fontSize: moderateScale(15),
        lineHeight: moderateScale(22),
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: '#1E293B',
    },
    timestamp: {
        fontSize: moderateScale(10),
        color: '#94A3B8',
        marginTop: verticalScale(4),
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    input: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: scale(24),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        maxHeight: hp(12),
        fontSize: moderateScale(15),
        color: '#1E293B',
    },
    sendButton: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: '#23238E',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scale(10),
    },
    sendButtonDisabled: {
        backgroundColor: '#CBD5E1',
    },
});
