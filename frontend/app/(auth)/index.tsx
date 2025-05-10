import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function AuthIndex() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/(tabs)/" as any);
    } else {
      // Use 'as any' to bypass TypeScript checking for now
      router.replace("/(auth)/sign-in" as any);
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <View className="flex-1 justify-center items-center bg-[#f0f4f8]">
      <ActivityIndicator size="large" color="#248bf5" />
      <Text className="mt-4 text-gray-600">Loading...</Text>
    </View>
  );
}