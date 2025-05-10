// components/PullToRefreshContent.tsx
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { IMAGE_HEIGHT } from './PullToRefreshBackground';

// Set max pull distance based on image height
export const MAX_PULL_DISTANCE = IMAGE_HEIGHT;
export const THRESHOLD = 250; // Threshold to trigger refresh

interface PullToRefreshContentProps {
  pullY: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  children: React.ReactNode;
}

const PullToRefreshContent: React.FC<PullToRefreshContentProps> = ({ 
  pullY, 
  scale, 
  opacity, 
  children 
}) => {
  // Calculate transforms based on pull distance
  const contentTransform = {
    transform: [
      { 
        translateY: pullY.interpolate({
          inputRange: [0, MAX_PULL_DISTANCE],
          outputRange: [0, MAX_PULL_DISTANCE * 0.7],
          extrapolate: 'clamp',
        }) 
      },
      { 
        scale: pullY.interpolate({
          inputRange: [0, MAX_PULL_DISTANCE],
          outputRange: [1, 0.92],
          extrapolate: 'clamp',
        }) 
      },
      {
        perspective: 1000
      }
    ],
    borderRadius: pullY.interpolate({
      inputRange: [0, MAX_PULL_DISTANCE * 0.5],
      outputRange: [0, 25],
      extrapolate: 'clamp',
    })
  };

  // Create cloth "dip" effect in the middle
  const contentBowEffect = {
    transform: [{
      scaleX: pullY.interpolate({
        inputRange: [0, MAX_PULL_DISTANCE * 0.5],
        outputRange: [1, 0.95],
        extrapolate: 'clamp',
      })
    }]
  };

  return (
    <Animated.View 
      style={[
        styles.contentContainer, 
        contentTransform, 
        { opacity, transform: [...contentTransform.transform, { scale }] }
      ]}
    >
      <Animated.View style={[styles.bowEffect, contentBowEffect]}>
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FAF9F6',
  },
  bowEffect: {
    flex: 1,
  },
});

export default PullToRefreshContent;