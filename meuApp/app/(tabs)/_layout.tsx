import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { CurtidasBadgeProvider, useCurtidasBadge } from '@/contexts/CurtidasBadgeContext';

const ORANGE = '#FF7A2A';

function CurtidasTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { count } = useCurtidasBadge();
  const filled = focused || color === ORANGE || color.toLowerCase().includes('ff7a2a');
  const heartColor = filled ? ORANGE : '#9CA3AF';
  const badgeLabel = count > 99 ? '99+' : String(count);
  return (
    <View style={styles.curtidasIconWrap}>
      <MaterialIcons name="favorite" size={28} color={heartColor} />
      <Text style={styles.curtidasIconBadge} numberOfLines={1}>
        {badgeLabel}
      </Text>
    </View>
  );
}

function OrbitTabIcon({ color }: { color: string }) {
  const isOrange = color === ORANGE || color.toLowerCase().includes('ff7a2a');
  const ring = isOrange ? ORANGE : '#9CA3AF';
  return (
    <View style={styles.orbitWrap}>
      <View style={[styles.orbitOuter, { borderColor: ring }]}>
        <View
          style={[
            styles.orbitInner,
            { borderColor: ring, borderWidth: 2, backgroundColor: 'transparent' },
          ]}
        />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <CurtidasBadgeProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ORANGE,
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <OrbitTabIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color }) => <MaterialIcons name="event" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Curtidas',
          tabBarIcon: ({ color, focused }) => <CurtidasTabIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ color }) => <MaterialIcons name="chat" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scheduled-events"
        options={{
          href: null,
          title: 'Eventos programados',
        }}
      />
      <Tabs.Screen
        name="event-detail"
        options={{
          href: null,
          title: 'Detalhe do evento',
        }}
      />
      <Tabs.Screen
        name="chat-conversation"
        options={{
          href: null,
          title: 'Conversa',
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
          title: 'Editar perfil',
        }}
      />
      <Tabs.Screen
        name="security-and-terms"
        options={{
          href: null,
          title: 'Segurança e Termos',
        }}
      />
    </Tabs>
    </CurtidasBadgeProvider>
  );
}

const styles = StyleSheet.create({
  curtidasIconWrap: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  curtidasIconBadge: {
    position: 'absolute',
    marginTop: 4,
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
    minWidth: 14,
    textAlign: 'center',
  },
  orbitWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
