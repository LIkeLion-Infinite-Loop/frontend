import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import { useTheme } from '@/context/ThemeContext';

const COLORS = {
  bgLight: '#F3F4F6',
  bgDark: '#121212',
  textDark: '#111827',
  textLight: '#E0E0E0',
  cta: '#111827',          // CTA 버튼 배경 (퀴즈화면과 통일)
  accent: '#06D16E',       // 포인트 그린
  borderLight: '#E5E7EB',
  borderDark: '#555555',
  inputLight: '#FFFFFF',
  inputDark: '#333333',
  placeholderLight: '#9FA6B2',
  placeholderDark: '#888888',
};

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const { isDarkMode } = useTheme();

  const containerBg = isDarkMode ? COLORS.bgDark : COLORS.bgLight;
  const titleColor = isDarkMode ? COLORS.textLight : COLORS.textDark;
  const inputBg = isDarkMode ? COLORS.inputDark : COLORS.inputLight;
  const inputBorder = isDarkMode ? COLORS.borderDark : COLORS.borderLight;
  const inputText = isDarkMode ? COLORS.textLight : '#333333';
  const placeholder = isDarkMode ? COLORS.placeholderDark : COLORS.placeholderLight;

  const handleReset = async () => {
    if (!email) return Alert.alert('⚠️', '이메일을 입력해주세요.');

    try {
      const response = await axios.post('http://40.233.103.122:8080/api/users/reset-password', { email });
      Alert.alert('✅', response.data?.message || '임시 비밀번호가 이메일로 전송되었습니다.');
      router.push('/login');
    } catch (err: any) {
      console.error('비밀번호 재설정 오류:', err?.response || err);
      Alert.alert('❌', err?.response?.data?.message || '서버 오류가 발생했습니다.');
    }
  };

  const handleGoHome = () => router.push('/login');

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <Text style={[styles.title, { color: titleColor }]}>비밀번호 재설정</Text>

      <View style={styles.form}>
        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="이메일 주소"
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor: inputBorder, color: inputText },
          ]}
          placeholderTextColor={placeholder}
        />
      </View>

      <TouchableOpacity onPress={handleReset} activeOpacity={0.9} style={styles.cta}>
        <Text style={styles.ctaText}>확인</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoHome} style={styles.homeButton} activeOpacity={0.8}>
        <Image source={require('../../assets/images/home_logo.png')} style={styles.homeLogo} />
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
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
    fontSize: 22,
    marginBottom: 24, // 과한 여백 제거
  },
  form: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'NotoSansKRRegular',
    borderRadius: 12, // 퀴즈 UI와 통일
    marginBottom: 10,
  },
  cta: {
    marginTop: 8,
    backgroundColor: COLORS.cta,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'NotoSansKRRegular',
    fontWeight: '800',
  },
  homeButton: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    alignItems: 'center',
  },
  homeLogo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
});
