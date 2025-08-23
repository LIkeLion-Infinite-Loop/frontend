import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { AppNavigationProp } from '../../types/navigation.d';
import axios from 'axios';
import InputField from '../../components/InputField';
import { useTheme } from '@/context/ThemeContext';

const API_BASE_URL = 'http://40.233.103.122:8080/api';

// 공통 팔레트 (퀴즈 화면과 통일)
const COLORS = {
  bgLight: '#F3F4F6',
  bgDark: '#121212',
  textDark: '#111827',
  textLight: '#E0E0E0',
  accent: '#06D16E',      // 포인트 그린
  cta: '#111827',         // CTA 버튼 배경
  borderLight: '#E5E7EB',
  borderDark: '#555555',
  inputLight: '#FFFFFF',
  inputDark: '#333333',
  placeholderLight: '#9FA6B2',
  placeholderDark: '#888888',
};

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<AppNavigationProp>();
  const { userToken } = useAuth();
  const { isDarkMode } = useTheme();

  // 다크/라이트 동적 색상
  const containerBg = isDarkMode ? COLORS.bgDark : COLORS.bgLight;
  const titleColor = isDarkMode ? COLORS.textLight : COLORS.textDark;
  const inputBg = isDarkMode ? COLORS.inputDark : COLORS.inputLight;
  const inputBorder = isDarkMode ? COLORS.borderDark : COLORS.borderLight;
  const inputText = isDarkMode ? COLORS.textLight : '#333333';
  const placeholder = isDarkMode ? COLORS.placeholderDark : COLORS.placeholderLight;

  useLayoutEffect(() => {
    const headerBgColor = isDarkMode ? '#1F1F1F' : '#FFFFFF';
    const headerTint = isDarkMode ? COLORS.textLight : '#000000';

    navigation.setOptions({
      title: '비밀번호 재설정',
      headerStyle: { backgroundColor: headerBgColor },
      headerTintColor: headerTint,
      headerTitleStyle: { fontWeight: 'bold', color: headerTint },
      headerBackTitle: '',
    });
  }, [navigation, isDarkMode]);

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
    if (!validatePassword()) return;

    if (!userToken) {
      Alert.alert('인증 오류', '인증 정보가 없습니다. 다시 로그인해주세요.');
      navigation.navigate('(auth)', { screen: 'login' });
      return;
    }

    const payload = { current_password: currentPassword, new_password: newPassword };
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/users/change-password`, payload, {
        headers: {
          Authorization: `Bearer ${String(userToken).replace(/"/g, '')}`,
          'Content-Type': 'application/json',
        },
      });

      const message = res.data?.message || '비밀번호가 성공적으로 변경되었습니다.';
      Alert.alert('성공', message, [{ text: '확인', onPress: () => navigation.goBack() }]);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        (status === 401
          ? '인증이 만료되었습니다. 다시 로그인해주세요.'
          : status === 400
          ? '요청 형식을 확인해주세요.'
          : status === 403
          ? '비밀번호 변경 권한이 없습니다.'
          : '알 수 없는 오류가 발생했습니다.');
      console.error('비밀번호 변경 오류:', error.response || error);
      Alert.alert('실패', `오류가 발생했습니다: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <Text style={[styles.title, { color: titleColor }]}>비밀번호 재설정</Text>

      <InputField
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="현재 비밀번호"
        secureTextEntry
        editable={!isLoading}
        style={[
          styles.input,
          { backgroundColor: inputBg, borderColor: inputBorder, color: inputText },
        ]}
        placeholderTextColor={placeholder}
      />

      <InputField
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="새 비밀번호 (8자 이상)"
        secureTextEntry
        editable={!isLoading}
        style={[
          styles.input,
          { backgroundColor: inputBg, borderColor: inputBorder, color: inputText },
        ]}
        placeholderTextColor={placeholder}
      />

      <InputField
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        placeholder="새 비밀번호 확인"
        secureTextEntry
        editable={!isLoading}
        style={[
          styles.input,
          { backgroundColor: inputBg, borderColor: inputBorder, color: inputText },
        ]}
        placeholderTextColor={placeholder}
      />

      <TouchableOpacity
        style={[styles.cta, { opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleChangePassword}
        disabled={isLoading}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaText}>확인</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 24, // 과한 마진 제거
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 12,
    borderRadius: 12, // 퀴즈 UI 곡률과 통일
  },
  cta: {
    marginTop: 8,
    backgroundColor: COLORS.cta,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'NotoSansKRRegular',
    fontWeight: '800',
  },
});
