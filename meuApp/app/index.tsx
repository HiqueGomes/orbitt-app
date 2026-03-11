import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getCurrentUser, setCurrentUser } from '@/lib/auth-storage';
import { clearSelectedEvents } from '@/lib/event-storage';

export default function Index() {
  const [checked, setChecked] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    // Ao abrir o app, inicia deslogado e sem eventos (não persiste entre aberturas)
    Promise.all([setCurrentUser(null), clearSelectedEvents()]).then(() =>
      getCurrentUser().then((user) => {
        setHasUser(!!user);
        setChecked(true);
      })
    );
  }, []);

  if (!checked) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF7A2A" />
      </View>
    );
  }

  return <Redirect href={hasUser ? '/(tabs)' : '/(auth)/login'} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

