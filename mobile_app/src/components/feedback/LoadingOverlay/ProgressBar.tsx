import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Colors } from '../../../styles';

interface Props {
  progress: number;
}

const ProgressBar = ({ progress }: Props) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    marginTop: 20,
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
});

export default ProgressBar;
