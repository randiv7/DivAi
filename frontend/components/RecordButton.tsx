// components/RecordButton.tsx
import React from "react";
import { TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface RecordButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  onPressRecord: () => void;
  onPressStop: () => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ 
  isRecording, 
  isTranscribing, 
  onPressRecord, 
  onPressStop 
}) => {
  const handlePress = () => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isRecording) {
      onPressStop();
    } else {
      onPressRecord();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.micButton,
        isRecording && styles.recordingActive
      ]}
      disabled={isTranscribing}
    >
      {isTranscribing ? (
        <ActivityIndicator size="small" color="#0077b6" />
      ) : (
        <MaterialIcons 
          name={isRecording ? "stop" : "mic"} 
          size={22} 
          color={isRecording ? "white" : "#374151"} 
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#b2f6f7',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  recordingActive: {
    backgroundColor: '#ef5350', // Red color when recording
  },
});

export default RecordButton;