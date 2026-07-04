import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginVertical: Spacing.sm,
  },

  disabled: {
    backgroundColor: '#BDBDBD',
  },

  text: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
