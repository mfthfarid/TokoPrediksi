import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Header from '../components/common/Header';

interface ScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  paddingHorizontal?: number;
  paddingVertical?: number;
  backgroundColor?: string;
  showHeader?: boolean;
}

export default function ScreenLayout({
  title,
  subtitle,
  children,
  scrollable = true,
  paddingHorizontal = 16,
  paddingVertical = 16,
  backgroundColor = '#F5F5F5',
  showHeader = true,
}: ScreenLayoutProps) {
  const Content = (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal,
          paddingVertical,
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior="padding"
    >
      {showHeader && <Header title={title} subtitle={subtitle} />}
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {Content}
        </ScrollView>
      ) : (
        Content
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
  },
});
