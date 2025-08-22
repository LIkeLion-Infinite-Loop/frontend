import { Stack } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';

export default function AuthLayout() {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();

  // 다크 모드에 따른 동적 색상 정의
  const buttonTextColor = isDarkMode ? '#E0E0E0' : '#000000';
  const headerBackgroundColor = isDarkMode ? '#121212' : '#FFFFFF'; // 헤더 배경색
  const headerTitleColor = isDarkMode ? '#E0E0E0' : '#000000'; // 헤더 제목 색상

  return (
    <Stack>
      <Stack.Screen 
        name="changePassword" 
        options={{ 
          title: '', 
          headerStyle: {
            backgroundColor: headerBackgroundColor,
          },
          headerTitleStyle: {
            color: headerTitleColor,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 15 }}>
              <Text style={{ color: buttonTextColor }}>Back</Text>
            </TouchableOpacity>
          ),
        }} 
      /> 
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="findId" options={{ title: '아이디 찾기' }} />
      <Stack.Screen name="resetPassword" options={{ title: '비밀번호 재설정' }} />
      <Stack.Screen name="signup" options={{ title: '회원가입' }} /> 
    </Stack>
  );
}