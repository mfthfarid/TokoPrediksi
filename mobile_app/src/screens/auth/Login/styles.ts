import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },

  forgotLinkText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  errorText: {
    color: '#dc2626', // ganti ke Colors.error kalau sudah ada di colors.ts
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  loginButtonWrapper: {
    flex: 1,
  },

  fingerprintButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
