// app/_layout.js

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// 직접 만드신 ThemeProvider를 가져옵니다.
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext'; 

import { useFonts } from 'expo-font';
import { AuthProvider } from '../context/AuthContext'; 
import { useColorScheme } from '@/hooks/useColorScheme'; // 또는 'react-native'에서 가져온 useColorScheme

SplashScreen.preventAutoHideAsync();

// 로딩 화면 컴포넌트
function LoadingScreen() {
  // useColorScheme 훅을 여기서 사용하여 로딩 화면도 다크 모드 지원 가능
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const containerBackgroundColor = isDarkMode ? '#121212' : '#f2f2f2';
  const textColor = isDarkMode ? '#E0E0E0' : '#333333';
  const indicatorColor = isDarkMode ? '#04c75a' : '#06D16E'; // 다크 모드 시 약간 어둡게

  return (
    <View style={[loadingStyles.container, { backgroundColor: containerBackgroundColor }]}>
      <ActivityIndicator size="large" color={indicatorColor} />
      <Text style={[loadingStyles.text, { color: textColor }]}>앱을 준비 중입니다...</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme(); // 앱의 현재 테마를 가져옵니다.
  const isDarkMode = colorScheme === 'dark'; // 현재 테마가 'dark'인지 확인합니다.

  const [fontLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'NotoSansKRRegular': require('../assets/fonts/NotoSansKR-Regular.ttf'),
  });

  const [appInitialLoadDone, setAppInitialLoadDone] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        if (!fontLoaded && !fontError) {
          return;
        }

        await SplashScreen.hideAsync();
        console.log('스플래시 화면 숨김');

        setAppInitialLoadDone(true);

      } catch (e) {
        console.warn('앱 초기화 중 오류 발생:', e);
        await SplashScreen.hideAsync();
        setAppInitialLoadDone(true);
      }
    }

    prepareApp();
  }, [fontLoaded, fontError]);

  // 폰트 로드 오류 발생 시 화면
  if (fontError) {
    const errorTextColor = isDarkMode ? '#E0E0E0' : '#FF0000'; // 오류 텍스트 색상
    return (
      <View style={[loadingStyles.container, { backgroundColor: isDarkMode ? '#121212' : '#f2f2f2' }]}>
        <Text style={[loadingStyles.text, { color: errorTextColor }]}>폰트 로드 중 오류 발생: {fontError.message}</Text>
      </View>
    );
  }

  // 폰트 로드 및 초기 앱 준비 중 화면
  if (!fontLoaded || !appInitialLoadDone) {
    return <LoadingScreen />;
  }

  // 다크 모드에 따른 헤더 색상 정의
  const headerBackgroundColor = isDarkMode ? '#1F1F1F' : '#00D16E'; // 다크 모드 시 어두운 배경
  const headerTintColor = isDarkMode ? '#E0E0E0' : '#fff'; // 다크 모드 시 밝은 텍스트/아이콘
  const headerTitleColor = isDarkMode ? '#E0E0E0' : '#fff'; // 다크 모드 시 제목 텍스트

  return (
    // 직접 만드신 CustomThemeProvider로 앱 전체를 감싸줍니다.
    <CustomThemeProvider> 
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: headerBackgroundColor, // 다크 모드에 따라 변경
            },
            headerTintColor: headerTintColor, // 다크 모드에 따라 변경
            headerTitleStyle: {
              fontWeight: 'bold',
              color: headerTitleColor, // 다크 모드에 따라 변경
            },
            headerBackTitle: '', // 뒤로가기 버튼 텍스트 숨김
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false, title: '' }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, title: ''}} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />

          <Stack.Screen name="search" options={{ title: '검색 결과' }} />
          <Stack.Screen name="scan-result/[barcode]" options={{ title: '스캔 결과' }} />

          {/* 404 Not Found 화면 */}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} /> {/* 상태바 아이콘 색상도 다크 모드에 따라 변경 */}
    </CustomThemeProvider>
  );
}