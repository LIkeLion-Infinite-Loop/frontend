import {Stack} from 'expo-router';
import {useFonts} from 'expo-font';
import {useEffect} from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme'; //커스텀 훅
import { StatusBar } from 'expo-status-bar';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme(); // 현재 테마를 가져오는 커스텀 훅
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // 다른 폰트 파일도 여기에 추가 가능
  });

  useEffect(() => {
    if(loaded || error){
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  //폰트 로드 실패 시 에러
  if (error) throw error;
  if(!loaded) {
    return null; // 폰트가 로드되지 않았을 때 아무것도 렌더링하지 않음
  }

return (
  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <Stack
      screenOptions={{
        headerShown: false, // <-- 이 부분이 핵심! Stack Navigator의 모든 헤더를 비활성화합니다.
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
    <StatusBar style="auto" />
  </ThemeProvider>
);
}