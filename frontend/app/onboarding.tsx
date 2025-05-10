import { StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';

const AboutUs = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>About DIV App</Text>

      <Text style={styles.paragraph}>
        DIV is an AI-powered educational mobile app specially designed for Sinhala-medium Grade 11 students in Sri Lanka. Our mission is to transform traditional learning by providing instant, accurate, and personalized answers to science questions.
      </Text>

      <Text style={styles.heading}>Key Features</Text>

      <Text style={styles.paragraph}>• AI-powered Sinhala chatbot for instant science Q&A.</Text>
      <Text style={styles.paragraph}>• Speech-to-Text feature for voice-based interaction.</Text>
      <Text style={styles.paragraph}>• Smart Retrieval-Augmented Generation (RAG) technology for accurate textbook content.</Text>
      <Text style={styles.paragraph}>• Sinhala language optimization for seamless user experience.</Text>

      <Text style={styles.heading}>Our Vision</Text>
      <Text style={styles.paragraph}>
        To empower Sri Lankan students with innovative technology that enhances educational outcomes and bridges gaps in accessibility to quality science education.
      </Text>

      <Text style={styles.heading}>Contact Us</Text>
      <Text style={styles.paragraph}>Email: support@divapp.lk</Text>
      <Text style={styles.paragraph}>Website: www.divapp.lk</Text>
    </ScrollView>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
});
