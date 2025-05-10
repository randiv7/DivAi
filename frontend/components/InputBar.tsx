// components/InputBar.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import VoiceRecorder from "./VoiceRecorder";
import SendButton from "./SendButton";


interface InputBarProps {
  input: string;
  setInput: (text: string) => void;
  handleSend: () => void;
}

const InputBar: React.FC<InputBarProps> = ({ input, setInput, handleSend }) => {
  const [error, setError] = useState<string>("");

  const handleSendMessage = () => {
    if (input.trim()) {
      handleSend();
      setInput('');
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    setInput(text);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    console.error(errorMsg);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
      keyboardVerticalOffset={Platform.select({ ios: 15, android: 10 })}
    >
      <LinearGradient
        colors={['#cff5fc', '#d7fcd7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.inputContainer}
      >
        <VoiceRecorder 
          onTranscriptionComplete={handleTranscriptionComplete}
          onError={handleError}
        />

        <TextInput
          style={styles.textInput}
          placeholder="Message DIV-AI"
          placeholderTextColor="#9ca3af" 
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          blurOnSubmit={false}
        />

        <SendButton 
          isDisabled={!input.trim()} 
          onPress={handleSendMessage} 
        />
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    backgroundColor: '#FAF9F6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    maxHeight: 120,
    paddingRight: 8,
  },
});

export default InputBar;
