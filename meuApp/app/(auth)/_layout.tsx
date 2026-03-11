import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack initialRouteName="login">
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Cadastro',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile-setup"
        options={{
          title: 'Perfil',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

