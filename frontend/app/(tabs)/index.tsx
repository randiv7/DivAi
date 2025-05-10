// (tabs)/index.tsx
import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Platform, 
  Text, 
  StatusBar,
  KeyboardAvoidingView
} from "react-native";
import Header from "../../components/Header";
import ChatMessages from "../../components/ChatMessages";
import InputBar from "../../components/InputBar";
import ProfileScreen from "./profile";
import LoadingScreen from "../../components/LoadingScreen";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKEND_URL = "http://172.20.10.3:5000/chat";

interface Message {
  id: string;
  sender: "user" | "bot" | "bot-temp";
  content: string;
  timestamp?: number;
}

const generateId = (): string => Math.random().toString(36).substring(7);

// Device detection for scaling
const { width, height } = Dimensions.get('window');
const isIphone16Pro = Platform.OS === 'ios' && 
  (width === 393 || width === 390) && 
  (height === 852 || height === 844);

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0); // Add a key to force re-render
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Initialize the app and hide loading screen after a 4 second delay
    const initializeApp = async () => {
      // Show loading screen for 4 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 4000);
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    // Only scroll to end if there are messages
    if (messages.length > 0) {
      scrollRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    setError("");
    const userMessage: Message = {
      id: generateId(),
      sender: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    let botMessageId = generateId();
    let lastProcessedLength = 0;

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', BACKEND_URL);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      let buffer = '';
      let botMessageContent = '';

      setMessages(prev => [...prev, {
        id: botMessageId,
        sender: "bot-temp",
        content: ""
      }]);

      xhr.onprogress = () => {
        if (xhr.responseText) {
          const newData = xhr.responseText.slice(lastProcessedLength);
          buffer += newData;
          lastProcessedLength = xhr.responseText.length;
          
          while (buffer.includes('\n\n')) {
            const eventEnd = buffer.indexOf('\n\n');
            const event = buffer.substring(0, eventEnd);
            buffer = buffer.substring(eventEnd + 2);
            
            const data = event.replace(/^data: /gm, '');
            botMessageContent += data;
            
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId 
                ? {...msg, content: botMessageContent} 
                : msg
            ));
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setMessages(prev => prev.map(msg =>
            msg.id === botMessageId
              ? {...msg, sender: "bot", timestamp: Date.now()}
              : msg
          ));
          // Scroll to the latest message when received
          scrollRef.current?.scrollToEnd({ animated: true });
        } else {
          throw new Error(`Server error: ${xhr.status} - ${xhr.responseText || 'No response'}`);
        }
      };

      xhr.onerror = () => {
        throw new Error('Network request failed. Check connection.');
      };

      xhr.send(JSON.stringify({ 
        messages: updatedMessages.map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content
        }))
      }));

    } catch (err) {
      console.error('Request error:', err);
      setError(err instanceof Error ? err.message : 'Request failed');
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
    } finally {
      setIsTyping(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Add this function to handle refresh
  const handleRefresh = () => {
    // Clear messages and start fresh
    setMessages([]);
    setInput("");
    setError("");
    
    // Force re-render of the component tree
    setKey(prevKey => prevKey + 1);
  };

  // If app is still loading, show the loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 5}
    >
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="dark-content"
      />
      
      <Header title="DIV" onMenuPress={toggleSidebar} />
      
      <View style={styles.content}>
        <ChatMessages 
          key={key}
          messages={messages}
          isTyping={isTyping}
          scrollRef={scrollRef}
          onRefresh={handleRefresh}
        />
        
        <View style={styles.inputContainer}>
          <InputBar 
            input={input}
            setInput={setInput}
            handleSend={handleSend}
          />
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>
      
      <ProfileScreen 
        isVisible={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  content: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  inputContainer: {
    marginBottom: Platform.OS === 'ios' ? 8 : 5, // Reduced margin to match ChatGPT app
  },
  errorContainer: {
    position: 'absolute',
    bottom: 90,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
  }
});