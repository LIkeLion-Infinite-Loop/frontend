import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// 스플래시 스크린 자동 숨김 방지
SplashScreen.preventAutoHideAsync();

function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color="#06D16E" />
      <Text style={loadingStyles.text}>로딩 중...</Text>
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
    // NotoSansKR-Regular 폰트를 사용하고 계시다면 여기에 추가해야 합니다.
    // 'NotoSansKRRegular': require('../assets/fonts/NotoSansKR-Regular.otf'),
  });
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        if (fontLoaded || fontError) {
          await SplashScreen.hideAsync();
        }
        console.log('앱 초기 데이터 로딩 시작...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        console.log('앱 초기 데이터 로딩 완료!');
        setInitialDataLoaded(true);
      } catch (e) {
        console.warn('앱 초기화 중 오류 발생:', e);
      }
    }

    if (fontLoaded || fontError) {
      prepareApp();
    }
  }, [fontLoaded, fontError]);

  if (fontError) {
    return (
      <View style={loadingStyles.container}>
        <Text style={loadingStyles.text}>폰트 로드 중 오류 발생: {fontError.message}</Text>
      </View>
    );
  }

  if (!fontLoaded || !initialDataLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}