import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext';

SplashScreen.preventAutoHideAsync();

// --- Loading screen ----------------------------------------------------------
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

// --- Root Layout -------------------------------------------------------------
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [fontLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    NotoSansKRRegular: require('../assets/fonts/NotoSansKR-Regular.ttf'),
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
        <Text style={[loadingStyles.text, { color: errorTextColor }]}>
          폰트 로드 중 오류 발생: {fontError.message}
        </Text>
      </View>
    );
  }

  if (!fontLoaded || !appInitialLoadDone) return <LoadingScreen />;

  const headerBackgroundColor = isDarkMode ? '#1F1F1F' : '#06D16E';
  const headerTintColor = isDarkMode ? '#E0E0E0' : '#fff';
  const headerTitleColor = isDarkMode ? '#E0E0E0' : '#fff';

  return (
    <CustomThemeProvider>
      <AuthProvider>
        {/* AuthProvider가 단일 자식만 갖도록 래핑 */}
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: headerBackgroundColor },
              headerTintColor,
              headerTitleStyle: { fontWeight: 'bold', color: headerTitleColor },
              // iOS 뒤로가기 라벨 제거 (tabs 같은 라벨 숨김)
              headerBackTitle: '',
              // 기본 back 아이콘 숨기고 커스텀 버튼 제공
              headerBackVisible: false,
              headerLeft: () => (
                <Pressable
                  onPress={() => router.back()}
                  style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                  hitSlop={8}
                >
                  {/* 텍스트 화살표(에셋 필요 없음) */}
                  <Text style={{ fontSize: 20, color: headerTintColor }}>‹</Text>
                </Pressable>
              ),
            }}
          >
            {/* 라우트 구성 */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ title: '검색 결과' }} />
            <Stack.Screen name="scan-result/[barcode]" options={{ title: '스캔 결과' }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>

          <StatusBar style={isDarkMode ? 'light' : 'light'} />
        </View>
      </AuthProvider>
    </CustomThemeProvider>
  );
}