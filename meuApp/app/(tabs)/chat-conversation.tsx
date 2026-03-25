import { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMessages,
  addMessage,
  clearMessages,
  type ChatMessage,
} from '@/lib/message-storage';
import { updateMatchLastMessage, removeMatch } from '@/lib/match-storage';
import { getCurrentUser } from '@/lib/auth-storage';
import { notifyChatListRefresh } from '@/lib/chat-list-refresh';
import { matchEntryAvatarSource } from '@/lib/mock-profile-avatars';

const ORANGE = '#FF7A2A';

export default function ChatConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name: string; photoUri?: string }>();
  const matchId = (Array.isArray(params.id) ? params.id[0] : params.id) ?? '';
  const matchName = (Array.isArray(params.name) ? params.name[0] : params.name) ?? 'Contato';
  const photoUriParam = (() => {
    const raw = params.photoUri;
    const s = (Array.isArray(raw) ? raw[0] : raw) ?? '';
    const t = String(s).trim();
    return t.length > 0 ? t : null;
  })();
  const headerAvatarSrc = matchEntryAvatarSource({
    id: matchId,
    photoUri: photoUriParam,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getCurrentUser().then(async (user) => {
        if (!mounted || !user) return;
        setUserId(user.id);
        const list = await getMessages(user.id, matchId);
        if (!mounted) return;
        if (list.length === 0) {
          const welcome = await addMessage(user.id, matchId, false, 'Oi, tudo bem?');
          if (mounted) setMessages([welcome]);
        } else {
          setMessages(list);
        }
      });
      return () => {
        mounted = false;
      };
    }, [matchId])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || !matchId || !userId) return;
    setInputText('');
    const msg = await addMessage(userId, matchId, true, text);
    setMessages((prev) => [...prev, msg]);
    await updateMatchLastMessage(userId, matchId, text);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  function handleBack() {
    router.replace('/(tabs)/chat');
  }

  function openOptionsMenu() {
    setOptionsMenuVisible(true);
  }

  function closeOptionsMenu() {
    setOptionsMenuVisible(false);
  }

  async function handleUnmatch() {
    closeOptionsMenu();
    Alert.alert(
      'Desfazer match',
      `Tem certeza que deseja desfazer o match com ${matchName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desfazer',
          style: 'destructive',
          onPress: async () => {
            const uid = userId ?? (await getCurrentUser())?.id;
            const id = matchId.trim();
            if (uid && id) {
              await removeMatch(uid, id);
              await clearMessages(uid, id);
              notifyChatListRefresh();
            }
            router.replace('/(tabs)/chat');
          },
        },
      ]
    );
  }

  async function handleBlock() {
    closeOptionsMenu();
    Alert.alert(
      'Bloquear',
      `Tem certeza que deseja bloquear ${matchName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: async () => {
            const uid = userId ?? (await getCurrentUser())?.id;
            const id = matchId.trim();
            if (uid && id) {
              await removeMatch(uid, id);
              await clearMessages(uid, id);
              notifyChatListRefresh();
            }
            router.replace('/(tabs)/chat');
          },
        },
      ]
    );
  }

  function handleReport() {
    closeOptionsMenu();
    Alert.alert('Denunciar', 'Denúncia registrada. Analisaremos em breve.', [{ text: 'OK' }]);
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {headerAvatarSrc ? (
            <Image source={headerAvatarSrc} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarLetter}>{matchName.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {matchName}
          </Text>
        </View>
        <TouchableOpacity style={styles.infoButton} onPress={openOptionsMenu} hitSlop={12}>
          <MaterialIcons name="info-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
      <View style={styles.headerDivider} />

      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[styles.bubbleWrap, msg.fromMe ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
            <View style={[styles.bubble, msg.fromMe ? styles.bubbleSent : styles.bubbleReceived]}>
              <Text style={[styles.bubbleText, msg.fromMe && styles.bubbleTextSent]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={2000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          hitSlop={8}>
          <MaterialIcons
            name="send"
            size={24}
            color={inputText.trim() ? ORANGE : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={optionsMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeOptionsMenu}>
        <TouchableOpacity
          style={styles.optionsOverlay}
          activeOpacity={1}
          onPress={closeOptionsMenu}>
          <View style={styles.optionsCard} onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              style={styles.optionsRow}
              onPress={handleUnmatch}
              activeOpacity={0.7}>
              <View style={styles.optionsIconWrap}>
                <MaterialIcons name="favorite-border" size={22} color={ORANGE} />
              </View>
              <Text style={styles.optionsRowText}>Desfazer Match</Text>
            </TouchableOpacity>
            <View style={styles.optionsDivider} />
            <TouchableOpacity
              style={styles.optionsRow}
              onPress={handleBlock}
              activeOpacity={0.7}>
              <View style={styles.optionsIconWrap}>
                <MaterialIcons name="block" size={22} color={ORANGE} />
              </View>
              <Text style={styles.optionsRowText}>Bloquear {matchName}</Text>
            </TouchableOpacity>
            <View style={styles.optionsDivider} />
            <TouchableOpacity
              style={styles.optionsRow}
              onPress={handleReport}
              activeOpacity={0.7}>
              <View style={styles.optionsIconWrap}>
                <MaterialIcons name="flag" size={22} color={ORANGE} />
              </View>
              <Text style={styles.optionsRowText}>Denunciar usuário</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ORANGE,
  },
  headerAvatarLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  infoButton: {
    padding: 8,
    width: 40,
    alignItems: 'flex-end',
  },
  headerDivider: {
    height: 2,
    backgroundColor: ORANGE,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  bubbleWrap: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  bubbleWrapLeft: {
    alignSelf: 'flex-start',
  },
  bubbleWrapRight: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: '100%',
  },
  bubbleReceived: {
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  bubbleSent: {
    backgroundColor: ORANGE,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    color: '#1F2937',
  },
  bubbleTextSent: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 16,
    color: '#000000',
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {},
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionsIconWrap: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  optionsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 60,
  },
});
