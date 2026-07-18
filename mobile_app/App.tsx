// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// export default function MainMenu() {
//   const [activeTab, setActiveTab] = useState('dashboard');

//   const renderDashboard = () => (
//     <ScrollView style={styles.content}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Dashboard</Text>
//         <Text style={styles.headerSubtitle}>Ringkasan Hari Ini</Text>
//       </View>

//       <View style={styles.statsContainer}>
//         <View style={[styles.statCard, styles.statCard1]}>
//           <Icon name="cash-multiple" size={32} color="#fff" />
//           <Text style={styles.statLabel}>Penjualan</Text>
//           <Text style={styles.statValue}>Rp 2.450.000</Text>
//         </View>

//         <View style={[styles.statCard, styles.statCard2]}>
//           <Icon name="package-open" size={32} color="#fff" />
//           <Text style={styles.statLabel}>Transaksi</Text>
//           <Text style={styles.statValue}>24</Text>
//         </View>

//         <View style={[styles.statCard, styles.statCard3]}>
//           <Icon name="alert-circle" size={32} color="#fff" />
//           <Text style={styles.statLabel}>Stok Rendah</Text>
//           <Text style={styles.statValue}>5</Text>
//         </View>
//       </View>

//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
//         {[
//           { item: 'Mie Instan', qty: 5, total: 'Rp 40.000' },
//           { item: 'Gula Pasir', qty: 2, total: 'Rp 45.000' },
//           { item: 'Telur Ayam', qty: 1, total: 'Rp 32.000' },
//         ].map((tx, idx) => (
//           <View key={idx} style={styles.transactionItem}>
//             <View>
//               <Text style={styles.txItem}>{tx.item}</Text>
//               <Text style={styles.txQty}>Qty: {tx.qty}</Text>
//             </View>
//             <Text style={styles.txTotal}>{tx.total}</Text>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );

//   const renderInventory = () => (
//     <ScrollView style={styles.content}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Inventory</Text>
//         <Text style={styles.headerSubtitle}>Daftar Barang</Text>
//       </View>

//       <TouchableOpacity style={styles.addButton}>
//         <Icon name="plus" size={24} color="#fff" />
//         <Text style={styles.addButtonText}>Tambah Barang</Text>
//       </TouchableOpacity>

//       {[
//         { name: 'Mie Instan', stok: 150, harga: 'Rp 8.000', status: 'normal' },
//         { name: 'Gula Pasir 1kg', stok: 12, harga: 'Rp 22.500', status: 'low' },
//         { name: 'Telur Ayam', stok: 45, harga: 'Rp 32.000', status: 'normal' },
//         {
//           name: 'Minyak Goreng 2L',
//           stok: 3,
//           harga: 'Rp 48.000',
//           status: 'low',
//         },
//         {
//           name: 'Beras Premium',
//           stok: 200,
//           harga: 'Rp 15.000',
//           status: 'normal',
//         },
//       ].map((item, idx) => (
//         <View key={idx} style={styles.inventoryItem}>
//           <View style={styles.itemLeft}>
//             <Text style={styles.itemName}>{item.name}</Text>
//             <Text style={styles.itemPrice}>{item.harga}</Text>
//           </View>
//           <View style={styles.itemRight}>
//             <View
//               style={[
//                 styles.stokBadge,
//                 item.status === 'low' ? styles.stokLow : styles.stokNormal,
//               ]}
//             >
//               <Text style={styles.stokText}>Stok: {item.stok}</Text>
//             </View>
//           </View>
//         </View>
//       ))}
//     </ScrollView>
//   );

//   const renderTransaksi = () => (
//     <ScrollView style={styles.content}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Transaksi</Text>
//         <Text style={styles.headerSubtitle}>Kelola Penjualan</Text>
//       </View>

//       <TouchableOpacity style={styles.addButton}>
//         <Icon name="plus" size={24} color="#fff" />
//         <Text style={styles.addButtonText}>Transaksi Baru</Text>
//       </TouchableOpacity>

//       {[
//         {
//           tanggal: '24 Nov 2024, 14:30',
//           total: 'Rp 120.000',
//           status: 'Selesai',
//         },
//         {
//           tanggal: '24 Nov 2024, 13:15',
//           total: 'Rp 87.500',
//           status: 'Selesai',
//         },
//         {
//           tanggal: '24 Nov 2024, 11:45',
//           total: 'Rp 156.000',
//           status: 'Selesai',
//         },
//         {
//           tanggal: '23 Nov 2024, 16:20',
//           total: 'Rp 92.000',
//           status: 'Selesai',
//         },
//       ].map((tx, idx) => (
//         <View key={idx} style={styles.transaksiCard}>
//           <View style={styles.transaksiLeft}>
//             <Icon name="receipt" size={24} color="#4CAF50" />
//             <View style={styles.transaksiInfo}>
//               <Text style={styles.transaksiTanggal}>{tx.tanggal}</Text>
//               <Text style={styles.transaksiStatus}>{tx.status}</Text>
//             </View>
//           </View>
//           <Text style={styles.transaksiTotal}>{tx.total}</Text>
//         </View>
//       ))}
//     </ScrollView>
//   );

//   const renderPrediksi = () => (
//     <ScrollView style={styles.content}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Prediksi Stok</Text>
//         <Text style={styles.headerSubtitle}>ML Forecast</Text>
//       </View>

//       {[
//         { barang: 'Mie Instan', prediksi: '7 hari', urgency: 'high' },
//         { barang: 'Gula Pasir 1kg', prediksi: '3 hari', urgency: 'critical' },
//         { barang: 'Minyak Goreng 2L', prediksi: '5 hari', urgency: 'high' },
//         { barang: 'Telur Ayam', prediksi: '12 hari', urgency: 'normal' },
//       ].map((pred, idx) => (
//         <View key={idx} style={styles.prediksiCard}>
//           <View style={styles.prediksiLeft}>
//             <Icon
//               name="chart-line"
//               size={24}
//               color={
//                 pred.urgency === 'critical'
//                   ? '#FF6B6B'
//                   : pred.urgency === 'high'
//                   ? '#FFA500'
//                   : '#4CAF50'
//               }
//             />
//             <Text style={styles.prediksiBarang}>{pred.barang}</Text>
//           </View>
//           <View
//             style={[
//               styles.prediksiPrediksi,
//               pred.urgency === 'critical'
//                 ? styles.urgencyCritical
//                 : pred.urgency === 'high'
//                 ? styles.urgencyHigh
//                 : styles.urgencyNormal,
//             ]}
//           >
//             <Text style={styles.prediksiText}>{pred.prediksi}</Text>
//           </View>
//         </View>
//       ))}
//     </ScrollView>
//   );

//   const renderPengaturan = () => (
//     <ScrollView style={styles.content}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Pengaturan</Text>
//         <Text style={styles.headerSubtitle}>Konfigurasi Aplikasi</Text>
//       </View>

//       <View style={styles.settingsSection}>
//         <Text style={styles.settingsSectionTitle}>Toko</Text>
//         <TouchableOpacity style={styles.settingItem}>
//           <Icon name="store" size={24} color="#666" />
//           <Text style={styles.settingText}>Informasi Toko</Text>
//           <Icon name="chevron-right" size={24} color="#ccc" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.settingsSection}>
//         <Text style={styles.settingsSectionTitle}>Data</Text>
//         <TouchableOpacity style={styles.settingItem}>
//           <Icon name="cloud-upload" size={24} color="#666" />
//           <Text style={styles.settingText}>Backup Data</Text>
//           <Icon name="chevron-right" size={24} color="#ccc" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.settingItem}>
//           <Icon name="file-export" size={24} color="#666" />
//           <Text style={styles.settingText}>Export Laporan</Text>
//           <Icon name="chevron-right" size={24} color="#ccc" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.settingsSection}>
//         <Text style={styles.settingsSectionTitle}>Tentang</Text>
//         <TouchableOpacity style={styles.settingItem}>
//           <Icon name="information" size={24} color="#666" />
//           <Text style={styles.settingText}>Versi</Text>
//           <Text style={styles.settingVersion}>v1.0.0</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return renderDashboard();
//       case 'inventory':
//         return renderInventory();
//       case 'transaksi':
//         return renderTransaksi();
//       case 'prediksi':
//         return renderPrediksi();
//       case 'pengaturan':
//         return renderPengaturan();
//       default:
//         return renderDashboard();
//     }
//   };

//   const navItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: 'home' },
//     { id: 'inventory', label: 'Inventory', icon: 'package-multiple' },
//     { id: 'transaksi', label: 'Transaksi', icon: 'receipt' },
//     { id: 'prediksi', label: 'Prediksi', icon: 'brain' },
//     { id: 'pengaturan', label: 'Pengaturan', icon: 'cog' },
//   ];

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//       {renderContent()}
//       <View style={styles.navbar}>
//         {navItems.map(item => (
//           <TouchableOpacity
//             key={item.id}
//             style={[
//               styles.navItem,
//               activeTab === item.id && styles.navItemActive,
//             ]}
//             onPress={() => setActiveTab(item.id)}
//           >
//             <Icon
//               name={item.icon}
//               size={24}
//               color={activeTab === item.id ? '#35ffabff' : '#999'}
//             />
//             <Text
//               style={[
//                 styles.navLabel,
//                 activeTab === item.id && styles.navLabelActive,
//               ]}
//             >
//               {item.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   content: {
//     flex: 1,
//     paddingBottom: 70,
//   },
//   header: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     padding: 12,
//     gap: 10,
//   },
//   statCard: {
//     flex: 1,
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   statCard1: {
//     backgroundColor: '#4CAF50',
//   },
//   statCard2: {
//     backgroundColor: '#2196F3',
//   },
//   statCard3: {
//     backgroundColor: '#FF9800',
//   },
//   statLabel: {
//     color: '#fff',
//     fontSize: 12,
//     marginTop: 8,
//   },
//   statValue: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 4,
//   },
//   section: {
//     padding: 16,
//     backgroundColor: '#fff',
//     marginTop: 12,
//     marginHorizontal: 12,
//     borderRadius: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//   },
//   transactionItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   txItem: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },
//   txQty: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 4,
//   },
//   txTotal: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#4CAF50',
//   },
//   addButton: {
//     flexDirection: 'row',
//     margin: 16,
//     padding: 12,
//     backgroundColor: '#FF6B35',
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   inventoryItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     marginHorizontal: 12,
//     marginVertical: 6,
//     borderRadius: 8,
//   },
//   itemLeft: {
//     flex: 1,
//   },
//   itemName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },
//   itemPrice: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 4,
//   },
//   itemRight: {
//     marginLeft: 12,
//   },
//   stokBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   stokNormal: {
//     backgroundColor: '#E8F5E9',
//   },
//   stokLow: {
//     backgroundColor: '#FFEBEE',
//   },
//   stokText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#333',
//   },
//   transaksiCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     marginHorizontal: 12,
//     marginVertical: 6,
//     borderRadius: 8,
//   },
//   transaksiLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   transaksiInfo: {
//     gap: 4,
//   },
//   transaksiTanggal: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#333',
//   },
//   transaksiStatus: {
//     fontSize: 12,
//     color: '#666',
//   },
//   transaksiTotal: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#2196F3',
//   },
//   prediksiCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     marginHorizontal: 12,
//     marginVertical: 6,
//     borderRadius: 8,
//   },
//   prediksiLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     flex: 1,
//   },
//   prediksiBarang: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },
//   prediksiPrediksi: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   urgencyCritical: {
//     backgroundColor: '#FFEBEE',
//   },
//   urgencyHigh: {
//     backgroundColor: '#FFF3E0',
//   },
//   urgencyNormal: {
//     backgroundColor: '#E8F5E9',
//   },
//   prediksiText: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   settingsSection: {
//     marginTop: 12,
//     marginHorizontal: 12,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   settingsSectionTitle: {
//     fontSize: 13,
//     fontWeight: 'bold',
//     color: '#999',
//     paddingHorizontal: 16,
//     paddingTop: 12,
//   },
//   settingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     gap: 12,
//   },
//   settingText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#333',
//   },
//   settingVersion: {
//     fontSize: 12,
//     color: '#999',
//   },
//   navbar: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingBottom: 8,
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 12,
//   },
//   navItemActive: {
//     borderTopWidth: 3,
//     borderTopColor: '#FF6B35',
//   },
//   navLabel: {
//     fontSize: 11,
//     marginTop: 4,
//     color: '#999',
//   },
//   navLabelActive: {
//     color: '#FF6B35',
//     fontWeight: '600',
//   },
// });

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStack } from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SystemBars } from 'react-native-edge-to-edge';

export default function App() {
  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <SystemBars style="light" />
        <AuthProvider>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}
