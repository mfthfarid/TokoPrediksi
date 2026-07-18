import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  logo: {
    width: 130,
    height: 130,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 15,
  },

  form: {
    marginTop: Spacing.md,
  },
});

export default styles;
