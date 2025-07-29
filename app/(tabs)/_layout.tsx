import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#888888', 
        headerShown: false,

        tabBarStyle: {
          height: 70, 
          paddingBottom: 10, 
          backgroundColor: '#f2f2f2', 
          borderTopWidth: StyleSheet.hairlineWidth, 
          borderTopColor: '#e0e0e0', 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 5, 
        },
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

            <Image
              source={require('../../assets/images/home.png')} 
              style={styles.tabIcon} 
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
              style={styles.tabIcon}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="scan" 
        options={{
          title: '', 
          tabBarLabel: () => null, 
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.centerButtonContainer}>
              <View style={styles.centerButtonBackground}>
                <Image
                  source={require('../../assets/images/barcord.png')} 
                  style={styles.centerButtonIcon}
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
              style={styles.tabIcon}
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
              style={styles.tabIcon}
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
    backgroundColor: '#06D16E', 
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // 그림자 (iOS)
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // 그림자 (Android)
  },
  centerButtonIcon: {
    width: 30, 
    height: 30,
    resizeMode: 'contain',
    tintColor: '#000000', 
  },
});