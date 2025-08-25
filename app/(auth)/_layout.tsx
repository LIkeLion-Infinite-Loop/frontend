import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

export default function AuthLayout() {
  const { isDarkMode } = useTheme();

  const headerBg = isDarkMode ? '#121212' : '#FFFFFF';
  const iconColor = isDarkMode ? '#E0E0E0' : '#111827';
  const titleColor = isDarkMode ? '#E0E0E0' : '#000000';

  // 공통 헤더 옵션 (뒤로가기 아이콘을 '<'로)
  const commonScreenOptions = {
    headerStyle: { backgroundColor: headerBg },
    headerTintColor: iconColor,
    headerTitleStyle: { color: titleColor, fontWeight: '600' as const },
    headerBackTitleVisible: false, // iOS에서 'Back' 텍스트 제거
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <Ionicons name="chevron-back" size={24} color={iconColor} />
      </TouchableOpacity>
    ),
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        {/* 비밀번호 변경 화면 */}
        <Stack.Screen
          name="changePassword"
          options={{
            ...commonScreenOptions,
            title: '',
          }}
        />

        {/* 로그인은 헤더 숨김(전체 화면) */}
        <Stack.Screen name="login" options={{ headerShown: false }} />

        {/* 나머지 화면도 동일한 백 아이콘을 사용하도록 공통 옵션 적용 */}
        <Stack.Screen
          name="findId"
          options={{
            ...commonScreenOptions,
            title: '아이디 찾기',
          }}
        />
        <Stack.Screen
          name="resetPassword"
          options={{
            ...commonScreenOptions,
            title: '비밀번호 재설정',
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            ...commonScreenOptions,
            title: '회원가입',
          }}
        />
      </Stack>
    </View>
  );
}