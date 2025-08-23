import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSinglePress } from '@/hooks/useSinglePress';

const COLORS = {
  bgLight: '#F3F4F6',
  bgDark: '#121212',
  textDark: '#111827',
  textLight: '#E0E0E0',
  accent: '#06D16E',       // 포인트 그린
  cta: '#111827',          // CTA 버튼 배경
  borderLight: '#E5E7EB',
  borderDark: '#555555',
  inputLight: '#FFFFFF',
  inputDark: '#333333',
  placeholderLight: '#9FA6B2',
  placeholderDark: '#888888',
};

export default function FindIdScreen() {
  const { userToken } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundId, setFoundId] = useState('');
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const single = useSinglePress();

  const containerBg = isDarkMode ? COLORS.bgDark : COLORS.bgLight;
  const titleColor = isDarkMode ? COLORS.textLight : COLORS.textDark;
  const inputBg = isDarkMode ? COLORS.inputDark : COLORS.inputLight;
  const inputBorder = isDarkMode ? COLORS.borderDark : COLORS.borderLight;
  const inputText = isDarkMode ? COLORS.textLight : '#333333';
  const placeholder = isDarkMode ? COLORS.placeholderDark : COLORS.placeholderLight;
  const resultBg = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const resultText = isDarkMode ? COLORS.textLight : COLORS.textDark;

  const handleFindId = async () => {
    if (isLoading) return;
    try {
      if (!name || !email) {
        return Alert.alert('⚠️', '이름과 이메일을 모두 입력해주세요.');
      }
      const headers = userToken ? { Authorization: `Bearer ${String(userToken)}` } : {};
      const response = await axios.post(
        'http://40.233.103.122:8080/api/users/find-id',
        { name, email },
        { headers }
      );

      if (response.data?.user_id) {
        setFoundId(response.data.user_id);
      } else {
        Alert.alert('❌', '아이디를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      console.error('아이디 찾기 오류:', err?.response || err);
      Alert.alert('⚠️', err?.response?.data?.message || '서버 오류가 발생했습니다.');
    }
  };

  const handleGoHome = () => router.push('/login');

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <Text style={[styles.title, { color: titleColor }]}>아이디 찾기</Text>

      <View style={styles.form}>
        <InputField
          value={name}
          onChangeText={setName}
          placeholder="이름"
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor: inputBorder, color: inputText },
          ]}
          placeholderTextColor={placeholder}
        />

        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="이메일"
          style={[
            styles.input,
            { backgroundColor: inputBg, borderColor: inputBorder, color: inputText },
          ]}
          placeholderTextColor={placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity onPress={handleFindId} activeOpacity={0.9} style={styles.cta}>
        <Text style={styles.ctaText}>확인</Text>
      </TouchableOpacity>

      {foundId !== '' && (
        <View style={[styles.resultBox, { backgroundColor: resultBg }]}>
          <Text style={[styles.resultText, { color: resultText }]}>🔍 찾은 아이디: {foundId}</Text>
        </View>
      )}

      <TouchableOpacity onPress={handleGoHome} style={styles.homeButton} activeOpacity={0.8}>
        <Image
          source={require('../../assets/images/home_logo.png')}
          style={styles.homeLogo}
        />
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
    borderRadius: 12, // 퀴즈 UI와 곡률 통일
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
  resultBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderLight,
  },
  resultText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
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
