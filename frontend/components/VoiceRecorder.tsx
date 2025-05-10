// components/VoiceRecorder.tsx
import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, Platform, View } from "react-native";
import { Audio } from 'expo-av';
import { OPENAI_API_KEY } from '../utils/ApiKeys';
import * as FileSystem from 'expo-file-system';
import RecordingGlow from './RecordingGlow';
import RecordButton from './RecordButton';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onError: (error: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscriptionComplete, 
  onError 
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Please grant microphone permissions to record audio');
        return;
      }

      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
        if (timer) clearInterval(timer);
        setTimer(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        }
      });

      setRecording(newRecording);
      setRecordingDuration(0);
      const intervalId = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setTimer(intervalId);

    } catch (err) {
      console.error('Start recording error:', err);
      onError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      setIsTranscribing(true);

      if (recordingDuration < 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        await sendToWhisper(uri);
      } else {
        onError('Failed to get recording URI');
        setIsTranscribing(false);
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      onError('Failed to process recording. Please try again.');
      setIsTranscribing(false);
    }
  };

  const sendToWhisper = async (uri: string) => {
    try {
      const fileExtension = uri.split('.').pop() || 'wav';
      const mimeType = fileExtension === 'wav' ? 'audio/wav' : 'audio/m4a';

      const whisperFormData = new FormData();
      whisperFormData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: `audio.${fileExtension}`,
        type: mimeType,
      } as any);

      whisperFormData.append('model', 'whisper-1');
      whisperFormData.append('response_format', 'json');
      whisperFormData.append('temperature', '0.0');
      whisperFormData.append('prompt', 'This is spoken Sinhala audio from Sri Lanka. Transcribe it accurately in Sinhala script only, preserving the original language. Do not translate. Maintain correct spelling, grammar, and punctuation as used in formal Sinhala.');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: whisperFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Whisper API error:', errorData);
        onError(`API Error: ${errorData.error?.message || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      const whisperText = data.text || '';

      if (whisperText.trim()) {
        try {
          const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: 'You are a Sinhala language expert. Your task is to accurately transcribe Sinhala spoken input into written Sinhala text. Do not translate to English. Maintain the original Sinhala language exactly as spoken. Output should be pure text without any additional explanations or formatting.'
                },
                {
                  role: 'user',
                  content: `This is a Sinhala speech-to-text transcription that may have errors. Please correct it: "${whisperText}"`
                }
              ],
              temperature: 0.3,
              max_tokens: 500
            })
          });

          if (gptResponse.ok) {
            const gptData = await gptResponse.json();
            const correctedText = gptData.choices[0]?.message?.content || whisperText;
            onTranscriptionComplete(correctedText);
          } else {
            onTranscriptionComplete(whisperText);
          }
        } catch (err) {
          onTranscriptionComplete(whisperText);
        }
      } else {
        onError('No speech detected. Please try again.');
      }

    } catch (err) {
      onError('Failed to transcribe audio. Please check your internet connection and try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated glow effect */}
      <RecordingGlow isRecording={recording !== null} />
      
      {/* Mic button */}
      <RecordButton 
        isRecording={recording !== null}
        isTranscribing={isTranscribing}
        onPressRecord={startRecording}
        onPressStop={stopRecording}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  }
});

export default VoiceRecorder;