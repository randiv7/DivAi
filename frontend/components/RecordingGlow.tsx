// components/RecordingGlow.tsx
import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  Easing,
  cancelAnimation
} from 'react-native-reanimated';

interface RecordingGlowProps {
  isRecording: boolean;
}

const RecordingGlow: React.FC<RecordingGlowProps> = ({ isRecording }) => {
  // Animation values
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  
  // Start/stop animation based on recording state
  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation when recording
      glowOpacity.value = withTiming(0.7, { duration: 300 });
      glowScale.value = withRepeat(
        withTiming(1.2, { // Reduced scale for smaller glow effect
          duration: 1000,
          easing: Easing.inOut(Easing.ease)
        }), 
        -1, // Infinite repeat
        true // Reverse animation
      );
    } else {
      // Stop animation and shrink when not recording
      glowOpacity.value = withTiming(0, { duration: 300 });
      glowScale.value = withTiming(1, { duration: 200 });
    }
    
    return () => {
      // Cleanup animations
      cancelAnimation(glowOpacity);
      cancelAnimation(glowScale);
    };
  }, [isRecording]);
  
  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: glowScale.value }],
    };
  });

  return (
    <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
      <View style={styles.glow} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  glowContainer: {
    position: 'absolute',
    width: 38, // Smaller glow container (~3mm around the 32px button)
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  glow: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
    backgroundColor: 'rgba(239, 83, 80, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#ef5350',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default RecordingGlow;