// sign-up.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignUpScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();

  const onSignUpWithGoogle = async () => {
    try {
      // Fix: Type assertion to avoid "possibly undefined" error
      const startFlow = startOAuthFlow as () => Promise<{
        createdSessionId?: string;
        setActive: (params: { session: string }) => Promise<void>;
      }>;
      
      const result = await startFlow();
      
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
        <View style={styles.contentContainer}>
          <View style={styles.innerContainer}>
            <Image
              source={require('../../assets/images/div-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.titleText}>
              Create an Account
            </Text>
            
            <Text style={styles.subtitleText}>
              Sign up to access DIV-AI, your Sinhala Educational Assistant
            </Text>
            
            <TouchableOpacity
              onPress={onSignUpWithGoogle}
              style={styles.googleButton}
            >
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>
                Sign up with Google
              </Text>
            </TouchableOpacity>
            
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-in" as any)}>
                <Text style={styles.signInLink}>Sign in</Text>
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  logo: {
    width: isIphone16Pro ? 140 : 128,
    height: isIphone16Pro ? 140 : 128,
    marginBottom: 32,
  },
  titleText: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 24,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 40,
  },
  googleButton: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginLeft: 12,
  },
  signInContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  signInText: {
    color: '#6b7280',
  },
  signInLink: {
    color: '#248bf5',
    fontWeight: '500',
    marginLeft: 4,
  },
});