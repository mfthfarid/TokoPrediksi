import { StyleSheet } from 'react-native';

export const PengaturanStyles = StyleSheet.create({
  settingsSection: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingsSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#999',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  settingVersion: {
    fontSize: 12,
    color: '#999',
  },
});
