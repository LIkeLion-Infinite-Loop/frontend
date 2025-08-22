import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { isDarkMode } = useTheme();

  const tabBarStyle = {
    height: 70, 
    paddingBottom: 10, 
    backgroundColor: isDarkMode ? '#1F1F1F' : '#FAFAFA',
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: isDarkMode ? '#333333' : '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  };
  
  const centerButtonBackgroundStyle = {
    ...styles.centerButtonBackground,
    backgroundColor: isDarkMode ? '#04c75a' : '#06D16E',
  };

  const centerButtonIconColor = isDarkMode ? '#E0E0E0' : '#000000';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#06D16E',
        tabBarInactiveTintColor: isDarkMode ? '#AAAAAA' : '#888888',
        headerShown: false,

        tabBarStyle: tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 3, 
        },
      }}>

      <Tabs.Screen
        name="index" 
        options={{
          title: '홈', 
          tabBarIcon: ({ color }) => (
            // ✅ 수정: tintColor를 style 밖의 prop으로 이동
            <Image
              source={require('../../assets/images/home.png')} 
              style={styles.tabIcon} 
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="quiz" 
        options={{ 
          title: '퀴즈', 
          tabBarIcon: ({ color }) => (
            // ✅ 수정: tintColor를 style 밖의 prop으로 이동
            <Image
              source={require('../../assets/images/report.png')} 
              style={styles.tabIcon}
              tintColor={color}
            />
          ),
        }} 
      />

      <Tabs.Screen
        name="scan" 
        options={{
          title: '', 
          tabBarLabel: () => null, 
          tabBarIcon: () => (
            <View style={styles.centerButtonContainer}>
              <View style={centerButtonBackgroundStyle}>
                {/* ✅ 수정: tintColor를 style 밖의 prop으로 이동 */}
                <Image
                  source={require('../../assets/images/scan.png')} 
                  style={styles.centerButtonIcon}
                  tintColor={centerButtonIconColor}
                />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: '상점',
          tabBarIcon: ({ color }) => (
            // ✅ 수정: tintColor를 style 밖의 prop으로 이동
            <Image
              source={require('../../assets/images/shop.png')} 
              style={styles.tabIcon}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile" 
        options={{
          title: '내 정보',
          tabBarIcon: ({ color }) => (
            // ✅ 수정: tintColor를 style 밖의 prop으로 이동
            <Image
              source={require('../../assets/images/profile.png')} 
              style={styles.tabIcon}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  centerButtonContainer: {
    marginTop: -20, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  centerButtonBackground: {
    width: 55, 
    height: 55,
    borderRadius: 27.5, 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  centerButtonIcon: {
    width: 30, 
    height: 30,
    resizeMode: 'contain',
  },
});
