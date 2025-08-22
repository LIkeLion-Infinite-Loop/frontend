import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useTheme } from '@/context/ThemeContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null); 
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { isDarkMode } = useTheme();

  const containerStyle = isDarkMode ? styles.darkContainer : styles.container;
  const inputFieldBackgroundColor = isDarkMode ? '#333333' : '#FFFFFF';
  const inputFieldBorderColor = isDarkMode ? '#555555' : '#E0E0E0';
  const inputFieldTextColor = isDarkMode ? '#E0E0E0' : '#333333';
  const rememberMeTextColor = isDarkMode ? '#BBBBBB' : '#666666';
  const linkTextColor = isDarkMode ? '#AAAAAA' : '#666666';
  const linkSeparatorColor = isDarkMode ? '#777777' : '#999999';
  const passwordToggleColor = isDarkMode ? '#BBBBBB' : '#9FA6B2';

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
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호 모두 입력해주세요.');
      return;
    }
    try {

      const response = await axios.post('http://40.233.103.122:8080/api/users/login', { email, password });
      console.log('응답 데이터:', response.data);

      if (response.status === 200 || response.status === 201) {
        const token = response.data.access_token; 
        const refreshToken = response.data.refresh_token;

        if (token && refreshToken) {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('refreshToken', refreshToken);
          if (response.data.email) {
            await AsyncStorage.setItem('userEmail', response.data.email);
          }
          if (rememberMe) {
            await AsyncStorage.setItem('rememberedEmail', email);
          } else {
            await AsyncStorage.removeItem('rememberedEmail');
          }
          Alert.alert('로그인 성공', '환영합니다!');
          await fetchUserInfo(token);
          router.replace('/(tabs)'); // 로그인 후 뒤로가기 방지를 위해 push 대신 replace 사용
        } else {
          Alert.alert('로그인 실패', '토큰을 찾을 수 없습니다.');
        }
      } else {
        Alert.alert('로그인 실패', '예상치 못한 응답 상태 코드입니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('로그인 오류', error.response?.data?.message || '서버에 문제가 발생했습니다.');
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
        {/* InputField를 TextInput으로 교체 */}
        <TextInput 
          placeholder="이메일 또는 아이디" 
          value={email} 
          onChangeText={setEmail} 
          style={[styles.inputFieldCommon, { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }]} 
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={styles.passwordInputContainer}>
          {/* InputField를 TextInput으로 교체 */}
          <TextInput
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} 
            style={[styles.inputFieldCommon, styles.passwordInputFieldSpecific, { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }]} 
            placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.togglePasswordVisibility}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={24} color={passwordToggleColor} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.rememberMeContainer}>
          <MaterialCommunityIcons name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={isDarkMode ? '#04c75a' : '#05D16E'} />
          <Text style={[styles.rememberMeText, { color: rememberMeTextColor }]}>아이디 저장하기</Text>
        </TouchableOpacity> 
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Image source={require('../../assets/images/earth.png')} style={styles.earth} />
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBox}>
          <Text style={[styles.linkText, { color: linkTextColor }]}>가입하기</Text>
        </TouchableOpacity>
        <Text style={[styles.linkSeparator, { color: linkSeparatorColor }]}>|</Text>
        <TouchableOpacity onPress={() => router.push('/findId')} style={styles.linkBox}>
          <Text style={[styles.linkText, { color: linkTextColor }]}>아이디 찾기</Text>
        </TouchableOpacity>
        <Text style={[styles.linkSeparator, { color: linkSeparatorColor }]}>|</Text>
        <TouchableOpacity onPress={() => router.push('/resetPassword')} style={styles.linkBox}>
          <Text style={[styles.linkText, { color: linkTextColor }]}>비밀번호 재설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- 스타일 시트는 변경사항 없습니다 ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 24,
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 80, 
    paddingBottom: 50, 
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#121212',
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
    marginTop: 30 
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
    backgroundColor: '#05D16E', 
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
    opacity: 0.1, 
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
