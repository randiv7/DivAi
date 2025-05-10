// components/PullToRefresh.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import PullToRefreshBackground from './PullToRefreshBackground';
import PullToRefreshContent, { 
  MAX_PULL_DISTANCE, 
  THRESHOLD 
} from './PullToRefreshContent';

interface PullToRefreshProps {
  onRefresh: () => void;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isRefreshed, setIsRefreshed] = useState(false);
  const [hasTriggeredMaxPullHaptic, setHasTriggeredMaxPullHaptic] = useState(false);
  
  // Animation values
  const pullY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  // Reset animation values when component remounts after refresh
  useEffect(() => {
    if (isRefreshed) {
      pullY.setValue(0);
      scale.setValue(1);
      opacity.setValue(1);
      rippleScale.setValue(0);
      rippleOpacity.setValue(0);
      setIsRefreshed(false);
      setHasTriggeredMaxPullHaptic(false);
    }
  }, [isRefreshed]);

  // Create pan responder to handle the pull gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !refreshing && gestureState.dy > 20 && gestureState.vy > 0.3;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          // Calculate pull distance with natural resistance
          const newPullDistance = Math.min(Math.pow(gestureState.dy, 0.85) * 1.3, MAX_PULL_DISTANCE);
          pullY.setValue(newPullDistance);
          
          // Trigger haptic feedback when reaching max pull distance
          if (newPullDistance >= MAX_PULL_DISTANCE * 0.95 && !hasTriggeredMaxPullHaptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setHasTriggeredMaxPullHaptic(true);
          } else if (newPullDistance < MAX_PULL_DISTANCE * 0.8) {
            // Reset the haptic trigger when pulled back
            setHasTriggeredMaxPullHaptic(false);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > THRESHOLD) {
          // User has pulled past threshold - trigger refresh
          setRefreshing(true);
          
          // Provide second haptic feedback on release
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          
          // Animate the cloth snap back
          Animated.sequence([
            // Quick snap back to create cloth effect
            Animated.spring(pullY, {
              toValue: 0,
              speed: 20,
              bounciness: 8,
              useNativeDriver: true,
            }),
            
            // Fade out and scale down current content
            Animated.parallel([
              Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 0.9,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
          
          // Create ripple effect
          Animated.sequence([
            Animated.timing(rippleOpacity, {
              toValue: 0.7,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.timing(rippleScale, {
                toValue: 1.8,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(rippleOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          ]).start();
          
          // Delay to allow animations to complete
          setTimeout(() => {
            // Call refresh callback
            onRefresh();
            
            // Reset animations
            rippleScale.setValue(0);
            opacity.setValue(1);
            scale.setValue(1);
            
            setRefreshing(false);
            setIsRefreshed(true);
            setHasTriggeredMaxPullHaptic(false);
          }, 700);
        } else {
          // Not pulled far enough, snap back
          Animated.spring(pullY, {
            toValue: 0,
            speed: 30,
            bounciness: 10,
            useNativeDriver: true,
          }).start();
          setHasTriggeredMaxPullHaptic(false);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Background with ripple effect */}
      <PullToRefreshBackground 
        rippleScale={rippleScale}
        rippleOpacity={rippleOpacity}
      />
      
      {/* Gesture handler and content */}
      <View {...panResponder.panHandlers} style={styles.pullContainer}>
        <PullToRefreshContent
          pullY={pullY}
          scale={scale}
          opacity={opacity}
          children={children}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  pullContainer: {
    flex: 1,
    position: 'relative',
  },
});

export default PullToRefresh;