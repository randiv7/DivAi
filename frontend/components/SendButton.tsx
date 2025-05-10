// components/SendButton.tsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SendButtonProps {
  isDisabled: boolean;
  onPress: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({ isDisabled, onPress }) => {
  const handlePress = () => {
    if (!isDisabled) {
      Haptics.selectionAsync();
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.sendButton, isDisabled && styles.sendButtonDisabled]}
      disabled={isDisabled}
    >
      <Ionicons name="send" size={18} color={isDisabled ? "#7d7f80" : "white"} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#38b1c9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#b2f6f7',
  },
});

export default SendButton;