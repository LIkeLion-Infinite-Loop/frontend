import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router'; // router 임포트 제거 (여기서 직접 리다이렉션 안함)
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
// ✅ AuthProvider 임포트 (AuthContext.js 파일 경로에 맞게 수정)
import { AuthProvider } from '../context/AuthContext.js'; // .js 확장자 명시

// 스플래시 화면이 자동으로 숨겨지는 것을 방지하여, 앱 초기화 로직이 완료될 때까지 표시되도록 합니다.
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
    // ✅ NotoSansKRRegular 폰트 경로를 실제 프로젝트에 맞게 수정해주세요.
    'NotoSansKRRegular': require('../assets/fonts/NotoSansKR-Regular.ttf'), // 예시 경로
  });

  // ✅ 앱 초기 데이터 로딩 완료 상태 (폰트 로딩만 확인)
  const [appInitialLoadDone, setAppInitialLoadDone] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // 1. 폰트 로딩 대기
        if (!fontLoaded && !fontError) {
          // 폰트가 로드되지 않았으면 대기
          return;
        }

        // 2. 스플래시 화면 숨기기 (폰트 로딩 완료 후)
        await SplashScreen.hideAsync();
        console.log('스플래시 화면 숨김');

        // 3. 앱 초기 로딩 완료 상태 설정 (여기서는 폰트 로딩만으로 판단)
        setAppInitialLoadDone(true);

      } catch (e) {
        console.warn('앱 초기화 중 오류 발생:', e);
        await SplashScreen.hideAsync();
        setAppInitialLoadDone(true);
      }
    }

    prepareApp();
  }, [fontLoaded, fontError]); // 폰트 로드 상태가 변경될 때마다 prepareApp 실행

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

  // ✅ AuthProvider로 앱의 메인 스택을 감싸줍니다.
  // 이렇게 하면 모든 자식 컴포넌트에서 useAuth 훅을 통해 인증 상태에 접근할 수 있습니다.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider> {/* ✅ AuthProvider로 감싸기 */}
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#00D16E',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerBackTitle: '', // iOS에서 뒤로가기 버튼 옆 텍스트 제거
          }}
        >
          {/*
            ✅ index 화면이 앱의 초기 진입점(인트로 화면)이 됩니다.
            이 화면에서 사용자가 'START' 버튼을 눌러야 다음 화면으로 이동합니다.
          */}
          <Stack.Screen name="index" options={{ headerShown: false, title: '' }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, title: ''}} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />

          {/* 기타 화면들 */}
          <Stack.Screen name="search" options={{ title: '검색 결과' }} />
          <Stack.Screen name="scan-result/[barcode]" options={{ title: '스캔 결과' }} />

          {/* 404 Not Found 화면 */}
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider> {/* ✅ AuthProvider 닫기 */}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
