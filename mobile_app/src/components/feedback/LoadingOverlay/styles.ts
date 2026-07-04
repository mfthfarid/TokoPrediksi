import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },

  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: Spacing.xl,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  loadingContainer: {
    alignItems: 'center',
  },

  title: {
    marginTop: Spacing.lg,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },

  message: {
    marginTop: Spacing.sm,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  progressText: {
    marginTop: Spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
});

export default styles;
