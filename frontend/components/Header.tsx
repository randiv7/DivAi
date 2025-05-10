// components/Header.tsx
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, StatusBar, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuPress }) => {
  const handleMenuPress = () => {
    // Add haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onMenuPress();
  };

  // Get status bar height
  const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

  return (
    <LinearGradient
      colors={['#cff5fc', '#d7fcd7']}
      style={[styles.gradient, { paddingTop: STATUSBAR_HEIGHT }]}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../assets/images/div-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
            <Ionicons name="menu" size={30} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 5,
  },
  logo: {
    width: 70,
    height: 70,
  },
  menuButton: {
    padding: 4,
  }
});

export default Header;