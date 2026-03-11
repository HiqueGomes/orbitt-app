import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@orbit_users';
const PENDING_REG_KEY = '@orbit_pending_registration';
const CURRENT_USER_KEY = '@orbit_current_user';

export interface PendingRegistration {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  cpf: string;
  password: string;
}

export interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  cpf: string;
  password: string;
  photoUris: string[];
  about: string;
}

export async function savePendingRegistration(data: PendingRegistration): Promise<void> {
  await AsyncStorage.setItem(PENDING_REG_KEY, JSON.stringify(data));
}

export async function getPendingRegistration(): Promise<PendingRegistration | null> {
  const raw = await AsyncStorage.getItem(PENDING_REG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRegistration;
  } catch {
    return null;
  }
}

export async function clearPendingRegistration(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_REG_KEY);
}

export async function getUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export async function saveUser(user: StoredUser): Promise<void> {
  const users = await getUsers();
  users.push(user);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function updateUser(updated: StoredUser): Promise<void> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === updated.id);
  if (index === -1) return;
  users[index] = updated;
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  const current = await getCurrentUser();
  if (current?.id === updated.id) {
    await setCurrentUser(updated);
  }
}

function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase().replace(/\D/g, '');
}

export async function findUserByIdentifierAndPassword(
  identifier: string,
  password: string
): Promise<StoredUser | null> {
  const users = await getUsers();
  const idNorm = identifier.trim().toLowerCase();
  const idDigits = normalizeIdentifier(identifier);

  for (const user of users) {
    const emailMatch = user.email.trim().toLowerCase() === idNorm;
    const cpfMatch = normalizeIdentifier(user.cpf) === idDigits;
    if ((emailMatch || cpfMatch) && user.password === password) {
      return user;
    }
  }
  return null;
}

export async function setCurrentUser(user: StoredUser | null): Promise<void> {
  if (user === null) {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } else {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

export async function getCurrentUser(): Promise<StoredUser | null> {
  const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
