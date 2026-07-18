import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  errorText: {
    color: '#dc2626', // ganti ke Colors.error kalau sudah ada di colors.ts
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  infoText: {
    color: Colors.primary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  changeEmailLink: {
    alignSelf: 'center',
    marginTop: Spacing.md,
  },

  changeEmailText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default styles;
