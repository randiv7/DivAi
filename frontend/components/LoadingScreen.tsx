// components/LoadingScreen.tsx
import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const LoadingScreen = () => {
  return (
    <LinearGradient
      colors={['#cff5fc', '#d7fcd7']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/div-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.poweredBy}>Powered by DIV-AI</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  poweredBy: {
    fontSize: 16,
    color: '#333',
    marginBottom: 30,
    fontWeight: '500',
  },
});

export default LoadingScreen;