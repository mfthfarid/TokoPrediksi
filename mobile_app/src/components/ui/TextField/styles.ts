import { StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../../styles';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  error: {
    color: Colors.error,
    marginTop: 6,
    fontSize: 12,
  },
  focused: {
    borderColor: Colors.primary,
  },
  multilineContainer: {
    height: 'auto',
    minHeight: 64,
    paddingVertical: 6,
  },
  multilineInput: {
    minHeight: 50,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  multilineIcon: {
    marginTop: 2,
  },
  iconContainer: {
    marginRight: 8,
  },
  multilineIconContainer: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});

export default styles;
