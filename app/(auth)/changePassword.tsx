import React, { useState, useLayoutEffect } from 'react'; // useLayoutEffect 추가
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // useNavigation 가져오기
import { useAuth } from '../../context/AuthContext';
import { AppNavigationProp } from '../../types/navigation.d';
import axios from 'axios';
import InputField from '../../components/InputField';
import { useTheme } from '@/context/ThemeContext';

// API 기본 URL을 상수로 정의하여 유지보수 용이성을 높입니다.
// 중요: 프로덕션 환경에서는 반드시 'https'를 사용해야 합니다.
const API_BASE_URL = 'http://40.233.103.122:8080/api';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // 새 비밀번호 확인 필드 추가
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<AppNavigationProp>();
  const { userToken } = useAuth();
  const { isDarkMode } = useTheme();

  // 다크 모드에 따른 동적 스타일 변수 정의 (화면 본문)
  const containerBackgroundColor = isDarkMode ? '#121212' : '#f2f2f2';
  const titleColor = isDarkMode ? '#E0E0E0' : '#000000';
  const inputFieldBackgroundColor = isDarkMode ? '#333333' : '#FFFFFF';
  const inputFieldBorderColor = isDarkMode ? '#555555' : '#E0E0E0';
  const inputFieldTextColor = isDarkMode ? '#E0E0E0' : '#333333';
  const buttonBackgroundColor = isDarkMode ? '#04c75a' : '#05D16E';
  const buttonTextColor = isDarkMode ? '#FFFFFF' : '#fff';
  const placeholderTextColor = isDarkMode ? '#888888' : '#9FA6B2';

  // useLayoutEffect를 사용하여 헤더 디자인을 동적으로 설정
  useLayoutEffect(() => {
    const headerBgColor = isDarkMode ? '#1F1F1F' : '#FFFFFF'; // 다크 모드 시 어둡게, 라이트 모드 시 흰색
    const headerTint = isDarkMode ? '#E0E0E0' : '#000000'; // 뒤로가기 버튼 및 제목 색상
    const headerTitleTxtColor = isDarkMode ? '#E0E0E0' : '#000000'; // 헤더 제목 텍스트 색상

    navigation.setOptions({
      title: '비밀번호 재설정', // 헤더 제목
      headerStyle: {
        backgroundColor: headerBgColor, // 동적 배경색
      },
      headerTintColor: headerTint, // 동적 틴트 색상
      headerTitleStyle: {
        fontWeight: 'bold',
        color: headerTitleTxtColor, // 동적 제목 텍스트 색상
      },
      headerBackTitle: '', // 뒤로가기 버튼 옆 텍스트 숨김
    });
  }, [navigation, isDarkMode]); // isDarkMode가 변경될 때마다 헤더 스타일 업데이트

  const validatePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('입력 오류', '모든 비밀번호 필드를 입력해주세요.');
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert('비밀번호 오류', '새 비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('비밀번호 오류', '새 비밀번호가 일치하지 않습니다.');
      return false;
    }
    if (currentPassword === newPassword) {
      Alert.alert('비밀번호 오류', '현재 비밀번호와 다른 비밀번호를 사용해주세요.');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    if (!userToken) {
      Alert.alert('인증 오류', '인증 정보가 없습니다. 다시 로그인해주세요.');
      navigation.navigate('(auth)', { screen: 'login' });
      return;
    }

    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    setIsLoading(true);

    try {
      // 중요: 실제 서비스에서는 반드시 https를 사용해야 합니다.
      const res = await axios.post(
        `${API_BASE_URL}/users/change-password`,
        payload,
        {
          headers: {
            // 토큰에서 불필요한 따옴표를 제거해야 할 수 있습니다.
            // useAuth에서 토큰을 저장하고 가져오는 방식을 확인해보세요.
            Authorization: `Bearer ${userToken.replace(/"/g, '')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const message = res.data?.message || '비밀번호가 성공적으로 변경되었습니다.';
      Alert.alert('성공', message, [
        { text: '확인', onPress: () => navigation.goBack() }
      ]);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
      
      console.error('비밀번호 변경 오류:', error.response || error);
      Alert.alert('실패', `오류가 발생했습니다: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <Text style={[styles.title, { color: titleColor }]}>비밀번호 재설정</Text>

      <InputField
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="현재 비밀번호"
        secureTextEntry
        editable={!isLoading}
        style={[
            styles.input, 
            { 
              backgroundColor: inputFieldBackgroundColor, 
              borderColor: inputFieldBorderColor, 
              color: inputFieldTextColor 
            }
        ]}
        placeholderTextColor={placeholderTextColor}
      />

      <InputField
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="새 비밀번호 (8자 이상)"
        secureTextEntry
        editable={!isLoading}
        style={[
            styles.input, 
            { 
              backgroundColor: inputFieldBackgroundColor, 
              borderColor: inputFieldBorderColor, 
              color: inputFieldTextColor 
            }
        ]}
        placeholderTextColor={placeholderTextColor}
      />
      
      {/* 새 비밀번호 확인 필드 추가 */}
      <InputField
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        placeholder="새 비밀번호 확인"
        secureTextEntry
        editable={!isLoading}
        style={[
            styles.input, 
            { 
              backgroundColor: inputFieldBackgroundColor, 
              borderColor: inputFieldBorderColor, 
              color: inputFieldTextColor 
            }
        ]}
        placeholderTextColor={placeholderTextColor}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackgroundColor, opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>확인</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 150,
    marginTop: -80,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 16,
    width: '100%',
    borderRadius: 8,
  },
  button: {
    paddingVertical: 12,
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 10,
    width: '50%',
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
  },
});