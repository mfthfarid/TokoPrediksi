import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './AuthLayoutStyles';
import { Images } from '../assets';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showLogo?: boolean;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {showLogo && (
            <Image
              source={Images.logo}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.form}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
