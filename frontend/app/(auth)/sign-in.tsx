// app/(auth)/sign-in.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignInScreen() {
  const oauthProps = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const onSignInWithGoogle = async () => {
    try {
      // TypeScript fix: Using type assertion to tell TypeScript this function exists
      const startOAuthFlow = oauthProps.startOAuthFlow as () => Promise<{
        createdSessionId?: string;
        setActive: (params: { session: string }) => Promise<void>;
      } | undefined>;
      
      const result = await startOAuthFlow();
      
      if (result?.createdSessionId) {
        await result.setActive({ session: result.createdSessionId });
        router.replace("/(tabs)/" as any);
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  return (
    <LinearGradient
      colors={['#cff5fc', '#d7fcd7']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <View style={styles.cardContainer}>
            <Image
              source={require('../../assets/images/div-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>
            ආයුබෝවන්!
            </Text>
            
            <Text style={styles.subtitle}>
            Welcome to DIV-AI
            </Text>
            
            <TouchableOpacity
              onPress={onSignInWithGoogle}
              style={styles.button}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.buttonText}>
                Sign in with Google
              </Text>
            </TouchableOpacity>
            
            <View style={styles.footerText}>
              <Text style={styles.footerLabel}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-up" as any)}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Create styles specifically for iPhone 16 Pro dimensions
const { width, height } = Dimensions.get('window');
const isIphone16Pro = Platform.OS === 'ios' && 
  (width === 393 || width === 390) && 
  (height === 852 || height === 844);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  logo: {
    width: isIphone16Pro ? 140 : 128,
    height: isIphone16Pro ? 140 : 128,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 32,
  },
  button: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  footerText: {
    flexDirection: 'row',
    marginTop: 24,
  },
  footerLabel: {
    color: '#6b7280',
  },
  footerLink: {
    color: '#248bf5',
    fontWeight: '500',
    marginLeft: 4,
  }
});