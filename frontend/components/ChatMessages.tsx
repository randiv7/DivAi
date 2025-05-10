// components/ChatMessages.tsx
import React from "react";
import { View, Text, ScrollView, StyleSheet, Platform, TouchableWithoutFeedback, Alert, Clipboard } from "react-native";
import PullToRefresh from "./PullToRefresh";

interface Message {
  id: string;
  sender: "user" | "bot" | "bot-temp";
  content: string;
  timestamp?: number;
}

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  scrollRef: React.RefObject<ScrollView>;
  onRefresh: () => void; // New prop for refresh functionality
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping, scrollRef, onRefresh }) => {

  const handleCopyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied!", "The message has been copied to clipboard.");
  };

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => {
          const messageContent = (
            <View
              style={[
                styles.messageBubble,
                message.sender === "user" ? styles.userBubble : styles.botBubble,
                Platform.OS === 'android' && { elevation: 2 }
              ]}
            >
              <Text style={message.sender === "user" ? styles.userMessageText : styles.botMessageText}>
                {message.content}
              </Text>
              {message.timestamp && (
                <Text style={message.sender === "user" ? styles.userTimestamp : styles.botTimestamp}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </Text>
              )}
            </View>
          );

          return (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.sender === "user" ? styles.userMessageRow : styles.botMessageRow
              ]}
            >
              {message.sender === "bot" ? (
                <TouchableWithoutFeedback
                  onLongPress={() => handleCopyToClipboard(message.content)}
                >
                  {messageContent}
                </TouchableWithoutFeedback>
              ) : (
                messageContent
              )}
            </View>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <View style={styles.dotsContainer}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </PullToRefresh>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent', // Changed to transparent so background shows through
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 90 : 70,
  },
  messageRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 16,
  },
  userBubble: {
    backgroundColor: '#d7fcd7', // Updated user message color
    borderBottomRightRadius: 4,
    shadowColor: '#adf7ad',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  botBubble: {
    backgroundColor: '#cff5fc', // Updated bot message color
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  userMessageText: {
    color: '#1f2937', 
    fontSize: 16,
  },
  botMessageText: {
    color: '#1f2937',
    fontSize: 16,
  },
  userTimestamp: {
    fontSize: 12,
    marginTop: 4,
    color: '#6b7280', 
  },
  botTimestamp: {
    fontSize: 12,
    marginTop: 4,
    color: '#6b7280',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    justifyContent: 'flex-start', 
  },
  typingBubble: {
    backgroundColor: '#cff5fc',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    width: 30,
    justifyContent: 'space-between',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
  },
  dot1: {
    opacity: 0.4,
    transform: [{ translateY: -2 }],
  },
  dot2: {
    opacity: 0.6,
    transform: [{ translateY: 0 }],
  },
  dot3: {
    opacity: 0.8,
    transform: [{ translateY: -2 }],
  },
});

export default ChatMessages;