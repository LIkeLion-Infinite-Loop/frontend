import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router'; 
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from '../context/AuthContext.js'; 

SplashScreen.preventAutoHideAsync();

// 로딩 화면 컴포넌트
function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color="#06D16E" />
      <Text style={loadingStyles.text}>앱을 준비 중입니다...</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
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

  // 폰트 로딩 오류 발생 시
  if (fontError) {
    return (
      <View style={loadingStyles.container}>
        <Text style={loadingStyles.text}>폰트 로드 중 오류 발생: {fontError.message}</Text>
      </View>
    );
  }

  // 폰트 로딩 또는 앱 초기화가 완료되지 않았을 때 로딩 화면 표시
  if (!fontLoaded || !appInitialLoadDone) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider> 
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#00D16E',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerBackTitle: '', 
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
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
