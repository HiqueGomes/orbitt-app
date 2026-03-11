import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';

const ORANGE = '#FF7A2A';

function OrbitTabIcon({ color }: { color: string }) {
  const isOrange = color === ORANGE || color.toLowerCase().includes('ff7a2a');
  return (
    <View style={styles.orbitWrap}>
      <View style={[styles.orbitOuter, { borderColor: isOrange ? ORANGE : '#9CA3AF' }]}>
        <View style={[styles.orbitInner, { backgroundColor: isOrange ? ORANGE : 'transparent' }]} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
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
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <MaterialIcons name="favorite" size={26} color={color} />,
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
  );
}

const styles = StyleSheet.create({
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
