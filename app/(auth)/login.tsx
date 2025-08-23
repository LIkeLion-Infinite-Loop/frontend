import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useSinglePress } from '@/hooks/useSinglePress';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { isDarkMode } = useTheme();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const single = useSinglePress();

  const containerStyle = isDarkMode ? styles.darkContainer : styles.container;
  const inputFieldBackgroundColor = isDarkMode ? '#111317' : '#FFFFFF';
  const inputFieldBorderColor     = isDarkMode ? '#26272B' : '#E5E7EB';
  const inputFieldTextColor       = isDarkMode ? '#E5E7EB' : '#111827';
  const rememberMeTextColor       = isDarkMode ? '#9CA3AF' : '#6B7280';
  const linkTextColor             = isDarkMode ? '#A1A1AA' : '#374151';
  const linkSeparatorColor        = isDarkMode ? '#6B7280' : '#9CA3AF';
  const passwordToggleColor       = isDarkMode ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('저장된 이메일 불러오기 오류:', error);
      }
    };
    loadRememberedEmail();
  }, []);

const handleLogin = async () => {
  // 🔒 연타/중복 호출 방지
  if (isLoggingIn) return;

  if (!email || !password) {
    Alert.alert('입력 오류', '이메일과 비밀번호 모두 입력해주세요.');
    return;
  }

  setIsLoggingIn(true);
  try {
    const response = await axios.post(
      'http://40.233.103.122:8080/api/users/login',
      { email: email.trim(), password }
    );

    if (response.status === 200 || response.status === 201) {
      const token = response.data?.access_token;
      const refreshToken = response.data?.refresh_token;

      if (!token || !refreshToken) {
        Alert.alert('로그인 실패', '토큰을 찾을 수 없습니다.');
        return;
      }

      // 토큰/이메일 저장(멀티셋으로 I/O 최소화)
      const emailForStore = response.data?.email ?? email.trim();
      await AsyncStorage.multiSet([
        ['userToken', token],
        ['refreshToken', refreshToken],
        ['userEmail', emailForStore],
      ]);

      // (선택) api 인스턴스에 바로 Authorization 주입
      try { api.defaults.headers.common.Authorization = `Bearer ${token}`; } catch {}

      // 유저 정보 갱신
      await fetchUserInfo();

      Alert.alert('로그인 성공', '환영합니다!');
      // 스택 중복 방지
      router.replace('/(tabs)');
      
      // 아이디 저장 옵션 반영
      if (rememberMe) await AsyncStorage.setItem('rememberedEmail', emailForStore);
      else await AsyncStorage.removeItem('rememberedEmail');
    } else {
      Alert.alert('로그인 실패', `예상치 못한 상태 코드: ${response.status}`);
    }
  } catch (error: any) {
    console.error('로그인 오류:', error);
    Alert.alert('로그인 오류', error?.response?.data?.message || '서버에 문제가 발생했습니다.');
  } finally {
    setIsLoggingIn(false);
  }
};


  const fetchUserInfo = async () => {
    const res = await api.get('/api/users/me');
    await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
  };

  return (
    <View style={containerStyle}>
      <Image source={require('../../assets/images/gr_biugo.png')} style={styles.logo} />

      <View style={styles.form}>
        <TextInput
          placeholder="이메일 또는 아이디"
          value={email}
          onChangeText={setEmail}
          style={[
            styles.inputFieldCommon,
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor },
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordInputContainer}>
          <TextInput
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[
              styles.inputFieldCommon,
              styles.passwordInputFieldSpecific,
              { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor },
            ]}
            placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.togglePasswordVisibility}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color={passwordToggleColor} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.rememberMeContainer}>
          <MaterialCommunityIcons
            name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={20}
            color="#06D16E" // 포인트 그린 고정
          />
          <Text style={[styles.rememberMeText, { color: rememberMeTextColor }]}>아이디 저장하기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.loginButton, { backgroundColor: '#111827' }]} onPress={handleLogin}>
        {/* <Image source={require('../../assets/images/earth.png')} style={styles.earth} /> */}
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={single(() => router.push('/signup'))} style={styles.linkBox}>
          <Text style={[styles.linkText, { color: linkTextColor }]}>가입하기</Text>
        </TouchableOpacity>
        <Text style={[styles.linkSeparator, { color: linkSeparatorColor }]}>|</Text>
        <TouchableOpacity onPress={single(() => router.push('/findId'))} style={styles.linkBox}>
          <Text style={[styles.linkText, { color: linkTextColor }]}>아이디 찾기</Text>
        </TouchableOpacity>
        <Text style={[styles.linkSeparator, { color: linkSeparatorColor }]}>|</Text>
        <TouchableOpacity onPress={single(() => router.push('/resetPassword'))} style={styles.linkBox}>
          <Text style={[styles.linkText, { color: linkTextColor }]}>비밀번호 재설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =================== Styles =================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', 
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 50,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#0B0B0D', 
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 50,
  },
  logo: {
    width: 260,
    height: 200,
    resizeMode: 'contain',
    marginTop: 30,
  },
  form: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  inputFieldCommon: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'NotoSansKRRegular',
    borderRadius: 8,
  },
  passwordInputContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInputFieldSpecific: {
    paddingRight: 50,
  },
  togglePasswordVisibility: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 5,
    zIndex: 1,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'NotoSansKRRegular',
  },
  loginButton: {
    paddingVertical: 15,
    borderRadius: 10,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 30,
  },
  earth: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    opacity: 0.08,
    position: 'absolute',
  },
  loginButtonText: {
    fontSize: 22,
    fontFamily: 'NotoSansKRRegular',
    color: '#FFFFFF',
    fontWeight: 'bold',
    zIndex: 1,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  linkBox: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'NotoSansKRRegular',
  },
  linkSeparator: {
    fontSize: 14,
    marginHorizontal: 5,
  },
});
