import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext'; // ThemeContext import

export default function TabLayout() {
  const { isDarkMode } = useTheme(); // useTheme 훅으로 isDarkMode 상태 가져오기

  // 다크 모드에 따른 동적 색상 정의
  const tabBarStyle = {
    height: 70, 
    paddingBottom: 10, 
    backgroundColor: isDarkMode ? '#1F1F1F' : '#FAFAFA', // 다크 모드 시 어두운 배경색
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: isDarkMode ? '#333333' : '#E0E0E0', // 다크 모드 시 어두운 경계선
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  };
  
  const centerButtonBackgroundStyle = {
    ...styles.centerButtonBackground,
    backgroundColor: isDarkMode ? '#04c75a' : '#06D16E', // 다크 모드 시 다른 버튼 색상
  };

  const centerButtonIconColor = isDarkMode ? '#E0E0E0' : '#000000';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#06D16E',
        tabBarInactiveTintColor: isDarkMode ? '#AAAAAA' : '#888888', // 다크 모드 시 비활성화 텍스트 색상
        headerShown: false,
        tabBarStyle: tabBarStyle, // 동적으로 정의한 tabBarStyle 적용
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 3, 
        },
      }}>

      <Tabs.Screen
        name="index" 
        options={{
          title: '홈', 
          tabBarIcon: ({ color, focused }) => (
            // focused 상태에 따라 아이콘 색상 변경
            <Image
              source={require('../../assets/images/home.png')} 
              style={[styles.tabIcon, { tintColor: color }]} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="help" 
        options={{
          title: '가이드', 
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/images/help.png')} 
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="scan" 
        options={{
          title: '', 
          tabBarLabel: () => null, 
          tabBarIcon: ({ focused }) => (
            <View style={styles.centerButtonContainer}>
              <View style={centerButtonBackgroundStyle}>
                <Image
                  source={require('../../assets/images/barcord.png')} 
                  style={[styles.centerButtonIcon, { tintColor: centerButtonIconColor }]}
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
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/images/shop.png')} 
              style={[styles.tabIcon, { tintColor: color }]}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile" 
        options={{
          title: '내 정보',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/images/profile.png')} 
              style={[styles.tabIcon, { tintColor: color }]}
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