// app/(tabs)/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Fix: Use correct path format
      router.replace("/(auth)/sign-in" as any);
    }
  }, [isLoaded, isSignedIn]);

  // Show loading indicator or return null while checking auth state
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
    </Stack>
  );
}