import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { savePendingRegistration } from '@/lib/auth-storage';

/** Formata apenas dígitos no padrão DD/MM/AAAA (máx. 8 dígitos). */
function formatBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Valida se a string DD/MM/AAAA é uma data de nascimento válida. */
function isValidBirthDate(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, error: 'Informe sua data de nascimento.' };
  const parts = trimmed.split('/');
  if (parts.length !== 3) return { valid: false, error: 'Use o formato DD/MM/AAAA.' };
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) {
    return { valid: false, error: 'Dia, mês e ano devem ser números.' };
  }
  if (day < 1 || day > 31) return { valid: false, error: 'Dia deve ser entre 01 e 31.' };
  if (month < 1 || month > 12) return { valid: false, error: 'Mês deve ser entre 01 e 12.' };
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return { valid: false, error: `Ano deve ser entre 1900 e ${currentYear}.` };
  }
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1) {
    return { valid: false, error: 'Data inválida (ex.: não existe 31/02).' };
  }
  if (date > new Date()) return { valid: false, error: 'A data não pode ser no futuro.' };
  return { valid: true };
}

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleBackPress() {
    router.back();
  }

  function handleBirthDateChange(text: string) {
    setBirthDate(formatBirthDateInput(text));
  }

  async function handleSubmitPress() {
    setSubmitted(true);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !cpf.trim() ||
      !password.trim() ||
      !passwordConfirm.trim()
    ) {
      return;
    }

    const birthValidation = isValidBirthDate(birthDate);
    if (!birthValidation.valid) return;

    if (password !== passwordConfirm) {
      return;
    }

    await savePendingRegistration({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      birthDate: birthDate.trim(),
      cpf: cpf.trim(),
      password,
    });
    router.push('/(auth)/profile-setup');
  }

  return (
    <ThemedView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Text style={styles.backIcon}>{'<'}</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.logoCircleOuter}>
                <View style={styles.logoCircleInner} />
              </View>
              <ThemedText style={styles.brand}>Orbit</ThemedText>
            </View>
          </View>

          <ThemedText type="title" style={styles.title}>
            Concluir Cadastro
          </ThemedText>

          <View style={styles.form}>
            <Text style={styles.label}>Primeiro Nome</Text>
            <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} />
            {submitted && !firstName.trim() && (
              <Text style={styles.errorText}>Informe o primeiro nome.</Text>
            )}

            <Text style={styles.label}>Sobrenome</Text>
            <TextInput value={lastName} onChangeText={setLastName} style={styles.input} />
            {submitted && !lastName.trim() && (
              <Text style={styles.errorText}>Informe o sobrenome.</Text>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
            />
            {submitted && !email.trim() && (
              <Text style={styles.errorText}>Informe um email válido.</Text>
            )}

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              value={birthDate}
              onChangeText={handleBirthDateChange}
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              maxLength={10}
              style={styles.input}
            />
            {submitted && !isValidBirthDate(birthDate).valid && (
              <Text style={styles.errorText}>{isValidBirthDate(birthDate).error}</Text>
            )}

            <Text style={styles.label}>CPF</Text>
            <TextInput
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              style={styles.input}
            />
            {submitted && !cpf.trim() && (
              <Text style={styles.errorText}>Informe seu CPF.</Text>
            )}

            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            {submitted && !password.trim() && (
              <Text style={styles.errorText}>Crie uma senha.</Text>
            )}

            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              style={styles.input}
            />
            {submitted && !passwordConfirm.trim() && (
              <Text style={styles.errorText}>Confirme a senha.</Text>
            )}
            {submitted && password && passwordConfirm && password !== passwordConfirm && (
              <Text style={styles.errorText}>As senhas precisam ser iguais.</Text>
            )}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitPress}>
            <Text style={styles.submitButtonText}>Avançar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const ORANGE = '#FF7A2A';
const INPUT_BG = '#F3F3F3';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircleOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircleInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: ORANGE,
  },
  brand: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  title: {
    marginTop: 8,
    marginBottom: 16,
    color: '#000000',
  },
  form: {
    marginTop: 8,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    color: '#111111',
  },
  input: {
    height: 40,
    borderBottomWidth: 1.5,
    borderBottomColor: ORANGE,
    backgroundColor: INPUT_BG,
    paddingHorizontal: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  submitButton: {
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: ORANGE,
    borderRadius: 24,
    paddingHorizontal: 48,
    paddingVertical: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
    color: ORANGE,
  },
});

