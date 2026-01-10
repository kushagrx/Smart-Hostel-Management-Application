import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlert } from '../context/AlertContext';
import { useTheme } from '../utils/ThemeContext';
import { setStoredUser } from '../utils/authUtils';
import { getAuthSafe, getDbSafe } from '../utils/firebase';
import { getRoleFromEmail } from '../utils/roleUtils';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const { colors } = useTheme();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Force use of the Expo Auth Proxy to avoid "invalid_request" with local IPs
  const redirectUri = 'https://auth.expo.io/@shaswat2004/smarthostel';

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (request) {
      console.log('Redirect URI:', request.redirectUri);
    }
  }, [request]);



  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Error', 'Please enter both email and password', [], 'error');
      return;
    }

    setIsLoading(true);
    try {
      const a = getAuthSafe();
      if (!a) {
        showAlert('Config error', 'Firebase is not configured.', [], 'error');
        return;
      }

      let cred;

      try {
        // 1. Try to sign in first
        cred = await signInWithEmailAndPassword(a, email.trim(), password.trim());
      } catch (signInError: any) {
        // 2. If user not found OR invalid-credential (email enumeration protection), try to Create Account
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          // Attempt creation
          try {
            const { createUserWithEmailAndPassword, deleteUser } = await import('firebase/auth');
            cred = await createUserWithEmailAndPassword(a, email.trim(), password.trim());

            // We are now Authenticated. Safe to read DB.
            const db = getDbSafe();
            if (!db || !cred.user) throw new Error('System verification failed.');

            const { doc, getDoc } = await import('firebase/firestore');
            const allocationRef = doc(db, 'allocations', email.toLowerCase().trim());
            const allocationSnap = await getDoc(allocationRef);

            // 3. Verify Allocation
            if (allocationSnap.exists()) {
              const data = allocationSnap.data();
              // Check if the entered password matches the Temp Password assigned
              if (data.tempPassword !== password.trim()) {
                // WRONG Temp Password. 
                // Rollback: Delete the auth user we just created.
                await deleteUser(cred.user);
                throw new Error('Invalid Credentials: Password does not match your assigned temporary password.');
              }
              // If match: Proceed (cred is valid, user is staying)
            } else {
              // Not Allotted (Stranger). 
              // Rollback: Delete the auth user.
              await deleteUser(cred.user);
              throw new Error('Access Denied: You have not been allotted a room.');
            }

          } catch (createError: any) {
            // If creation failed because email is in use, it means the user DID exist and 'invalid-credential' was just hiding it.
            // So it's a wrong password case.
            if (createError.code === 'auth/email-already-in-use') {
              throw new Error('Invalid Credentials');
            }
            // For other errors (network, etc), throw them.
            throw createError;
          }
        } else {
          // Wrong Password (explicit) or other error for EXISTING user
          throw signInError;
        }
      }

      if (!cred || !cred.user) {
        throw new Error('Authentication failed');
      }

      const u = cred.user;
      const role = getRoleFromEmail(u.email || '');

      const db = getDbSafe();

      if (role !== 'admin') {
        if (!db) throw new Error('Database not initialized');

        const { doc, getDoc, setDoc } = await import('firebase/firestore');
        const allocationRef = doc(db, 'allocations', u.email?.toLowerCase().trim() || 'unknown');
        const allocationSnap = await getDoc(allocationRef);

        if (!allocationSnap.exists()) {
          const { signOut } = await import('firebase/auth');
          await signOut(a);
          await setStoredUser(null);
          showAlert('Access Denied', 'You have not been allotted a room yet.\nPlease contact the Admin.', [], 'error');
          return;
        }

        // Sync allocation data to user profile
        const allocationData = allocationSnap.data();
        const userRef = doc(db, 'users', u.uid);

        await setDoc(userRef, {
          email: u.email,
          name: allocationData.name || u.displayName || u.email,
          role: 'student',
          room: allocationData.room,
          rollNo: allocationData.rollNo,
          collegeName: allocationData.collegeName,
          age: allocationData.age,
          phone: allocationData.phone,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }, { merge: true });

        await setStoredUser({
          id: u.uid,
          name: allocationData.name || u.displayName || u.email || '',
          role: 'student'
        });

        router.replace('/(tabs)');
      } else {
        // Admin Login
        if (db) {
          const { doc, setDoc } = await import('firebase/firestore');
          const userRef = doc(db, 'users', u.uid);
          await setDoc(userRef, {
            email: u.email,
            name: u.displayName || u.email,
            role: 'admin',
            lastLogin: new Date().toISOString(),
          }, { merge: true });
        }

        await setStoredUser({ id: u.uid, name: u.displayName || u.email || '', role: 'admin' });
        router.replace('/admin');
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Login failed. Please try again.', [], 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await promptAsync();
      if (res?.type === 'success' && res.authentication?.idToken) {
        const idToken = res.authentication.idToken;
        // Import Firestore functions
        const { collection, query, where, getDocs, doc, getDoc, setDoc } = await import('firebase/firestore');
        const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');

        const a = getAuthSafe();
        if (!a) {
          showAlert('Config error', 'Firebase is not configured.', [], 'error');
          return;
        }

        // 1. Sign In to Firebase with Google Credential
        const credential = GoogleAuthProvider.credential(idToken);
        const cred = await signInWithCredential(a, credential);
        const u = cred.user;
        const googleEmail = u.email?.toLowerCase();

        // 2. Identify Student via Allocation
        const db = getDbSafe();

        if (db && googleEmail) {

          // Check Admin first (Hardcoded for safety)
          if (googleEmail === 'shaswatrastogi91@gmail.com') {
            // Admin Logic
            await setDoc(doc(db, 'users', u.uid), {
              email: u.email,
              name: u.displayName || u.email,
              role: 'admin',
              lastLogin: new Date().toISOString(),
            }, { merge: true });
            await setStoredUser({ id: u.uid, name: u.displayName || u.email || '', role: 'admin' });
            router.replace('/admin');
            return;
          }

          let allocationData = null;
          let allocationId = null; // This is the official email

          // A. Try Direct Match (e.g., Student logged in with Official Email on Google)
          const directRef = doc(db, 'allocations', googleEmail);
          const directSnap = await getDoc(directRef);

          if (directSnap.exists()) {
            allocationData = directSnap.data();
            allocationId = googleEmail;
          } else {
            // B. Try Secondary Match (Personal Email Link)
            const q = query(collection(db, 'allocations'), where('personalEmail', '==', googleEmail));
            const querySnap = await getDocs(q);

            if (!querySnap.empty) {
              const matchDoc = querySnap.docs[0]; // Assuming 1:1 mapping
              allocationData = matchDoc.data();
              allocationId = matchDoc.id; // Their official email
            }
          }

          if (allocationData && allocationId) {
            // 3. User is Allotted (Authorized)
            const userRef = doc(db, 'users', u.uid);

            // Sync Official Details to their User Profile (even if they used Personal Email)
            await setDoc(userRef, {
              email: u.email, // The email they used to login (Google)
              officialEmail: allocationId, // Link to official record
              name: allocationData.name || u.displayName,
              role: 'student',
              room: allocationData.room,
              rollNo: allocationData.rollNo,
              collegeName: allocationData.collegeName,
              age: allocationData.age,
              phone: allocationData.phone,
              personalEmail: allocationData.personalEmail,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            }, { merge: true });

            await setStoredUser({
              id: u.uid,
              name: allocationData.name || u.displayName || '',
              role: 'student'
            });

            router.replace('/(tabs)');
          } else {
            // 4. Not Allotted
            const { signOut } = await import('firebase/auth');
            await signOut(a);
            showAlert(
              'Access Denied',
              'This email is not linked to any allotted student.\n\nIf this is your personal email, ask the Admin to link it to your profile.',
              [], 'error'
            );
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      showAlert('Error', 'Google sign-in failed: ' + e.message, [], 'error');
    }
  };


  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#000428', '#004e92']} // Matching Deep Royal Blue Gradient
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.container}>
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="home-city" size={40} color="#004e92" />
                  </View>
                  <Text style={styles.title}>Smart Hostel</Text>
                  <Text style={styles.subtitle}>Welcome Back</Text>
                </View>

                <View style={styles.loginCard}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="email-outline" size={20} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="name@example.com"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialCommunityIcons
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#64748b"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.divider} />
                  </View>

                  <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleLogin}
                    disabled={isLoading || !request}
                  >
                    <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
                    <Text style={styles.googleButtonText}>Google</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b', // Slate 800
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // Slate 50
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0', // Slate 200
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a', // Slate 900
  },
  loginButton: {
    backgroundColor: '#004e92', // Brand Blue
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#004e92',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b', // Slate 500
    fontWeight: '500',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  googleButtonText: {
    color: '#334155', // Slate 700
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
