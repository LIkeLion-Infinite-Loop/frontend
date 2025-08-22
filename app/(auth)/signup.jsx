import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기

  // 다크 모드에 따른 동적 스타일 변수 정의
  const containerStyle = isDarkMode ? styles.darkContainer : styles.container;
  const titleColor = isDarkMode ? '#E0E0E0' : '#000000';
  const inputFieldBackgroundColor = isDarkMode ? '#333333' : '#FFFFFF';
  const inputFieldBorderColor = isDarkMode ? '#555555' : '#E0E0E0';
  const inputFieldTextColor = isDarkMode ? '#E0E0E0' : '#333333';

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('입력 오류', '이름, 이메일, 비밀번호를 모두 입력해주세요.');
      return; // 여기서는 router.push('/login') 대신 return으로 함수를 종료하는 것이 좋습니다.
    }

    try {
      const response = await axios.post('http://40.233.103.122:8080/api/users/signup', {
        email,
        name,
        password,
      });

      console.log('서버 응답 받음:', response.status);

      if (response.status === 200 || response.status === 201) {
        await AsyncStorage.setItem('user', JSON.stringify({ name, email }));
        Alert.alert('✅ 회원가입 성공', '로그인 페이지로 이동합니다.');
        router.push('(auth)/login');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        Alert.alert('⚠️ 가입 실패', '이미 존재하는 이메일입니다.');
      } else {
        console.error('회원가입 오류:', error);
        Alert.alert('❌ 서버 오류', '회원가입 중 문제가 발생했습니다.');
      }
    }
  };

  const handleGoHome = () => router.push('/login'); // 로그인 페이지로 이동

  return (
    <View style={containerStyle}> {/* 다크 모드 배경색 적용 */}
      <Text style={[styles.title, { color: titleColor }]}>회원 가입</Text> {/* 다크 모드 글자색 적용 */}

      <View style={styles.form}>
        <InputField 
          value={name} 
          onChangeText={setName} 
          placeholder="이름" 
          style={[
            styles.inputFieldCommon,
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
        />

        <InputField 
          value={email} 
          onChangeText={setEmail} 
          placeholder="이메일" 
          keyboardType="email-address" 
          style={[
            styles.inputFieldCommon,
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
        />

        <InputField
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
          style={[
            styles.inputFieldCommon,
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
        />
      </View>

      <TouchableOpacity onPress={handleSignUp} style={styles.signupButton}>
        <Text style={styles.signupButtonText}>확인</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
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
    backgroundColor: '#F2F2F2', // 라이트 모드 배경색
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center', // 추가: 컨테이너 내부 요소 중앙 정렬
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#121212', // 다크 모드 배경색
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center', // 추가: 컨테이너 내부 요소 중앙 정렬
  },
  title: {
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
    fontSize: 25,
    // color는 동적으로 설정
    marginBottom: 130,
    marginTop: -80,
  },
  form: {
    gap: 8,
    width: '100%', // 추가: 폼 너비를 100%로 설정
    alignItems: 'center', // 추가: 폼 내부 요소 중앙 정렬
  },
  label: { // 이 스타일은 현재 사용되지 않는 것 같습니다.
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 4,
    marginTop: 12,
  },
  inputFieldCommon: {
    width: '100%', // 인풋 필드 너비 100%
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderWidth: 1, 
    fontSize: 16, 
    fontFamily: 'NotoSansKRRegular', 
    borderRadius: 8, // 둥근 모서리
  },
  signupButton: {
    backgroundColor: '#05D16E',
    paddingVertical: 12,
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 10, 
    width: '50%', 
    alignSelf: 'center'
  },
  signupButtonText: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
  },
  homeButton: {
    position: 'absolute',    
    bottom: 80,                
    alignSelf: 'center',        
    alignItems: 'center',
  },
  homeLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});