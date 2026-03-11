import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { findUserByIdentifierAndPassword, setCurrentUser } from '@/lib/auth-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState('');

  async function handleLoginPress() {
    setSubmitted(true);
    setLoginError('');

    if (!identifier.trim() || !password.trim()) {
      return;
    }

    const user = await findUserByIdentifierAndPassword(identifier.trim(), password);
    if (user) {
      await setCurrentUser(user);
      router.replace('/(tabs)');
    } else {
      setLoginError('Email/CPF ou senha incorretos. Verifique e tente novamente.');
    }
  }

  function handleSignUpPress() {
    router.push('/(auth)/register');
  }

  return (
    <ThemedView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner} />
          </View>

          <ThemedText type="title" style={styles.title}>
            Orbit
          </ThemedText>

          <View style={styles.form}>
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Email, celular ou CPF"
              placeholderTextColor="#B7B7B7"
              style={styles.input}
              keyboardType="email-address"
            />
            {submitted && !identifier.trim() && (
              <Text style={styles.errorText}>Preencha este campo para continuar.</Text>
            )}

            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Senha"
              placeholderTextColor="#B7B7B7"
              style={styles.input}
              secureTextEntry
            />
            {submitted && !password.trim() && (
              <Text style={styles.errorText}>Preencha este campo para continuar.</Text>
            )}
            {loginError ? (
              <Text style={styles.errorText}>{loginError}</Text>
            ) : null}

            <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
              <Text style={styles.loginButtonText}>Fazer login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Não possui uma conta? </Text>
            <TouchableOpacity onPress={handleSignUpPress}>
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialRow}>
            <View style={styles.socialCircle}>
              <Text style={styles.socialText}>G</Text>
            </View>
            <View style={styles.socialCircle}>
              <Text style={styles.socialText}></Text>
            </View>
            <View style={styles.socialSquare}>
              <Text style={styles.socialText}>IG</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const ORANGE = '#FF7A2A';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: ORANGE,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: ORANGE,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: ORANGE,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    fontSize: 13,
    color: '#111111',
  },
  signupLink: {
    fontSize: 13,
    color: ORANGE,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '55%',
    marginTop: 4,
  },
  socialCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialSquare: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
    color: ORANGE,
  },
});

