import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';

const COLORS = {
  bgLight: '#F3F4F6',
  bgDark: '#121212',
  textDark: '#111827',
  textLight: '#E0E0E0',
  cta: '#111827',          // CTA 버튼 배경 (퀴즈 UI와 통일)
  accent: '#06D16E',       // 포인트 그린
  borderLight: '#E5E7EB',
  borderDark: '#555555',
  inputLight: '#FFFFFF',
  inputDark: '#333333',
  placeholderLight: '#9FA6B2',
  placeholderDark: '#888888',
};

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isDarkMode } = useTheme();

  const containerBg = isDarkMode ? COLORS.bgDark : COLORS.bgLight;
  const titleColor = isDarkMode ? COLORS.textLight : COLORS.textDark;
  const inputBg = isDarkMode ? COLORS.inputDark : COLORS.inputLight;
  const inputBorder = isDarkMode ? COLORS.borderDark : COLORS.borderLight;
  const inputText = isDarkMode ? COLORS.textLight : '#333333';
  const placeholder = isDarkMode ? COLORS.placeholderDark : COLORS.placeholderLight;

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('입력 오류', '이름, 이메일, 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://40.233.103.122:8080/api/users/signup', {
        email,
        name,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        await AsyncStorage.setItem('user', JSON.stringify({ name, email }));
        Alert.alert('✅ 회원가입 성공', '로그인 페이지로 이동합니다.');
        router.push('/login');
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        Alert.alert('⚠️ 가입 실패', '이미 존재하는 이메일입니다.');
      } else {
        console.error('회원가입 오류:', error?.response || error);
        Alert.alert('❌ 서버 오류', error?.response?.data?.message || '회원가입 중 문제가 발생했습니다.');
      }
    }
  };

  const handleGoHome = () => router.push('/login');

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <Text style={[styles.title, { color: titleColor }]}>회원 가입</Text>

      <View style={styles.form}>
        <InputField
          value={name}
          onChangeText={setName}
          placeholder="이름"
          style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
          placeholderTextColor={placeholder}
        />

        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
          placeholderTextColor={placeholder}
        />

        <InputField
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
          style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: inputText }]}
          placeholderTextColor={placeholder}
        />
      </View>

      <TouchableOpacity onPress={handleSignUp} activeOpacity={0.9} style={styles.cta}>
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
    marginBottom: 24, // 과한 여백 줄임
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
