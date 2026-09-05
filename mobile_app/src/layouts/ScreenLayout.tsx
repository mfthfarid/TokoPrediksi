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
  onNotificationPress?: () => void;
  footer?: React.ReactNode;
}

export default function ScreenLayout({
  title,
  // subtitle,
  children,
  scrollable = true,
  paddingHorizontal = 16,
  paddingVertical = 16,
  backgroundColor = '#F5F5F5',
  showHeader = true,
  onNotificationPress,
  footer,
}: ScreenLayoutProps) {
  const Content = (
    <View
      style={[
        styles.content,
        {
          paddingHorizontal,
          // Selalu gunakan paddingVertical (default 16) untuk atas
          paddingTop: paddingVertical,
          // Jika ada footer, padding bawah jadi 0. Jika tidak, gunakan paddingVertical
          paddingBottom: footer ? 0 : paddingVertical,
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
      {showHeader && (
        <Header
          title={title}
          // subtitle={subtitle}
          onNotificationPress={onNotificationPress}
        />
      )}
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {Content}
        </ScrollView>
      ) : (
        Content
      )}
      {footer}
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

  scrollView: {
    flex: 1,
  },
});
