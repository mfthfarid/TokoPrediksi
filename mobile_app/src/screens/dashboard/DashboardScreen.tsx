import React from 'react';
import { Text, View } from 'react-native';
import { useDoubleBackExit } from '../../hooks/useDoubleBackExit';
import ScreenLayout from '../../layouts/ScreenLayout';

const Dashboard = () => {
  useDoubleBackExit();

  return (
    <ScreenLayout
      title="Dashboard"
      subtitle="Selamat datang di halaman dashboard"
    >
      <Text>Ini adalah halaman dashboard</Text>
    </ScreenLayout>

    // <View style={{ flex: 1 }}>
    //   <Text>Ini adalah halaman dashboard</Text>
    //   <Text>Header dan TabNavigator sekarang muncul!</Text>
    // </View>
  );
};

export default Dashboard;
