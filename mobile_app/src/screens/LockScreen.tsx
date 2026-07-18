// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, Image, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Fingerprint } from 'lucide-react-native';
// import PrimaryButton from '../components/ui/PrimaryButton';
// import { useAuth } from '../contexts/AuthContext';
// import { Images } from '../assets';
// import { Colors, Spacing } from '../styles';

// const LockScreen = () => {
//   const { unlockWithBiometric, logout } = useAuth();
//   const [status, setStatus] = useState<'idle' | 'checking' | 'failed'>('idle');
//   const hasTriggeredRef = useRef(false);

//   const tryUnlock = async () => {
//     setStatus('checking');
//     const success = await unlockWithBiometric();
//     // Kalau sukses, isLocked otomatis jadi false lewat AuthContext,
//     // RootNavigator langsung pindah ke MainNavigator -> LockScreen ini unmount.
//     // Jadi di sini kita cuma perlu handle kasus gagal.
//     if (!success) {
//       setStatus('failed');
//     }
//   };

//   // Auto-trigger prompt sekali saat screen ini pertama kali muncul
//   useEffect(() => {
//     if (!hasTriggeredRef.current) {
//       hasTriggeredRef.current = true;
//       tryUnlock();
//     }
//   }, []);

//   const handleFallbackLogin = () => {
//     // Hapus token sepenuhnya -> RootNavigator otomatis pindah ke AuthNavigator
//     logout();
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         <Image source={Images.logo} style={styles.logo} resizeMode="contain" />

//         <View style={styles.iconCircle}>
//           <Fingerprint size={48} color={Colors.primary} />
//         </View>

//         <Text style={styles.title}>
//           {status === 'failed' ? 'Verifikasi Gagal' : 'Aplikasi Terkunci'}
//         </Text>
//         <Text style={styles.subtitle}>
//           {status === 'failed'
//             ? 'Sidik jari tidak dikenali atau dibatalkan. Coba lagi.'
//             : 'Gunakan sidik jari untuk membuka TokoPrediksi'}
//         </Text>

//         <PrimaryButton
//           title="Coba Lagi"
//           loading={status === 'checking'}
//           loadingTitle="Memverifikasi..."
//           onPress={tryUnlock}
//         />

//         <Text style={styles.fallbackText} onPress={handleFallbackLogin}>
//           Masuk pakai Password
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.background,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: Spacing.xl,
//   },
//   logo: {
//     width: 90,
//     height: 90,
//     marginBottom: Spacing.xl,
//   },
//   iconCircle: {
//     width: 88,
//     height: 88,
//     borderRadius: 44,
//     backgroundColor: '#f1f5f9', // sesuaikan dengan palet Colors kamu kalau perlu
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: Spacing.lg,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.text,
//     marginBottom: Spacing.sm,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: Colors.textSecondary,
//     textAlign: 'center',
//     marginBottom: Spacing.xl,
//   },
//   fallbackText: {
//     marginTop: Spacing.lg,
//     color: Colors.primary,
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });

// export default LockScreen;
