// 파일: app/_layout.js

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
// View를 import 목록에 추가합니다.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext'; 
import { useFonts } from 'expo-font';
import { AuthProvider } from '../context/AuthContext'; 
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

// LoadingScreen 컴포넌트는 변경사항 없습니다.
function LoadingScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const containerBackgroundColor = isDarkMode ? '#121212' : '#f2f2f2';
  const textColor = isDarkMode ? '#E0E0E0' : '#333333';
  const indicatorColor = isDarkMode ? '#04c75a' : '#06D16E';

  return (
    <View style={[loadingStyles.container, { backgroundColor: containerBackgroundColor }]}>
      <ActivityIndicator size="large" color={indicatorColor} />
      <Text style={[loadingStyles.text, { color: textColor }]}>앱을 준비 중입니다...</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 10, fontSize: 16 },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [fontLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'NotoSansKRRegular': require('../assets/fonts/NotoSansKR-Regular.ttf'),
  });

  const [appInitialLoadDone, setAppInitialLoadDone] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        if (!fontLoaded && !fontError) return;
        await SplashScreen.hideAsync();
        setAppInitialLoadDone(true);
      } catch (e) {
        console.warn('앱 초기화 중 오류 발생:', e);
        await SplashScreen.hideAsync();
        setAppInitialLoadDone(true);
      }
    }
    prepareApp();
  }, [fontLoaded, fontError]);

  if (fontError) {
    const errorTextColor = isDarkMode ? '#E0E0E0' : '#FF0000';
    return (
      <View style={[loadingStyles.container, { backgroundColor: isDarkMode ? '#121212' : '#f2f2f2' }]}>
        <Text style={[loadingStyles.text, { color: errorTextColor }]}>폰트 로드 중 오류 발생: {fontError.message}</Text>
      </View>
    );
  }

  if (!fontLoaded || !appInitialLoadDone) {
    return <LoadingScreen />;
  }

  const headerBackgroundColor = isDarkMode ? '#1F1F1F' : '#00D16E';
  const headerTintColor = isDarkMode ? '#E0E0E0' : '#fff';
  const headerTitleColor = isDarkMode ? '#E0E0E0' : '#fff';

  return (
    <CustomThemeProvider> 
      <AuthProvider>
        {/* ✅ 가장 중요한 수정사항입니다!
          <Stack>과 <StatusBar>를 <View>로 감싸서 AuthProvider가
          항상 단 하나의 자식만 갖도록 보장합니다.
          이렇게 하면 컴포넌트 사이의 공백이 텍스트 노드로 인식되는
          문제를 완벽하게 방지할 수 있습니다.
        */}
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: headerBackgroundColor },
              headerTintColor: headerTintColor,
              headerTitleStyle: { fontWeight: 'bold', color: headerTitleColor },
              headerBackTitle: '',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ title: '검색 결과' }} />
            <Stack.Screen name="scan-result/[barcode]" options={{ title: '스캔 결과' }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </View>
      </AuthProvider>
    </CustomThemeProvider>
  );
}
