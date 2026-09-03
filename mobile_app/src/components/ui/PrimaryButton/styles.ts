import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  disabled: {
    backgroundColor: '#9ca3af',
  },
});

export default styles;
