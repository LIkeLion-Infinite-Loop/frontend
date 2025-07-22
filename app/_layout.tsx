import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react'; // useState 훅 임포트 확인
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// 앱 로딩 시 스플래시 스크린이 자동으로 숨겨지는 것을 방지 (가장 먼저 실행됩니다)
SplashScreen.preventAutoHideAsync();

function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color="#06D16E" /> 
      <Text style={loadingStyles.text}>로딩 중...</Text>
    </View>
  );
}

// 로딩 화면 컴포넌트의 스타일
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

  const [fontLoaded, fontError] = useFonts({ // 폰트 로딩 상태 변수
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // 다른 폰트 파일도 여기에 추가 가능
  });

  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // 초기 데이터 로딩 상태

  useEffect(() => {
    async function prepareApp() {
      try {
        // 폰트 로드 완료되거나 에러 발생 시 스플래시 스크린 숨김
        if (fontLoaded || fontError) {
          await SplashScreen.hideAsync();
        }

        // --- 여기에 앱의 초기 데이터 로딩 로직 추가 ---
        // 예시: 사용자 인증 상태 확인, API에서 앱 설정 데이터 가져오기 등
        // 실제 앱에서는 여기에 비동기 작업을 수행합니다.
        console.log('앱 초기 데이터 로딩 시작...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2초간 로딩 시뮬레이션 (로딩 화면을 보여주기 위해 다시 추가)
        console.log('앱 초기 데이터 로딩 완료!');

        setInitialDataLoaded(true); // 초기 데이터 로딩 완료 상태 업데이트
      } catch (e) {
        console.warn('앱 초기화 중 오류 발생:', e);
        // 오류 발생 시 사용자에게 알리거나, 앱 종료 등의 처리
      }
    }

    // 폰트 로드가 완료되거나 에러가 발생했을 때만 prepareApp 함수 호출
    if (fontLoaded || fontError) {
      prepareApp(); // <-- prepareApp 함수를 호출하도록 괄호 () 추가
    }
  }, [fontLoaded, fontError]); // 의존성 배열에 fontLoaded, fontError 추가

  // 폰트 로드 실패 시 에러 화면 표시
  if (fontError) {
    return (
      <View style={loadingStyles.container}>
        <Text style={loadingStyles.text}>폰트 로드 중 오류 발생: {fontError.message}</Text>
      </View>
    );
  }

  // 폰트가 아직 로드되지 않았거나 초기 데이터 로딩이 완료되지 않았다면 로딩 화면 표시
  if (!fontLoaded || !initialDataLoaded) {
    return <LoadingScreen />; // 로딩 중이면 커스텀 로딩 화면 표시
  }

  // 모든 준비가 완료되면 메인 앱 콘텐츠 렌더링
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" /> 

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}