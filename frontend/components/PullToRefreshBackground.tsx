// components/PullToRefreshBackground.tsx
import React from 'react';
import { View, StyleSheet, Animated, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Image height constant
export const IMAGE_HEIGHT = 300; // Adjust to match your back.jpeg image height

interface PullToRefreshBackgroundProps {
  rippleScale: Animated.Value;
  rippleOpacity: Animated.Value;
}

const PullToRefreshBackground: React.FC<PullToRefreshBackgroundProps> = ({ 
  rippleScale, 
  rippleOpacity 
}) => {
  // Create ripple animation style
  const rippleStyle = {
    transform: [{ scale: rippleScale }],
    opacity: rippleOpacity,
  };

  return (
    <>
      {/* Background image */}
      <View style={styles.backgroundContainer}>
        <Image 
          source={require('../assets/images/back.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>
      
      {/* Ripple effect at the top */}
      <Animated.View style={[styles.ripple, rippleStyle]} />
    </>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'absolute',
    top: 0,
  },
  ripple: {
    position: 'absolute',
    top: 0,
    left: width / 2 - 120,
    right: 0,
    width: 240,
    height: 120,
    borderRadius: 120,
    backgroundColor: '#5900ff',
    zIndex: 100,
  },
});

export default PullToRefreshBackground;