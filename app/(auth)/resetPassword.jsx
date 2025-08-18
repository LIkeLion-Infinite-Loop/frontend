import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기

  // 다크 모드에 따른 동적 스타일 변수 정의
  const containerStyle = isDarkMode ? styles.darkContainer : styles.container;
  const titleColor = isDarkMode ? '#E0E0E0' : '#000000';
  const inputFieldBackgroundColor = isDarkMode ? '#333333' : '#FFFFFF';
  const inputFieldBorderColor = isDarkMode ? '#555555' : '#E0E0E0';
  const inputFieldTextColor = isDarkMode ? '#E0E0E0' : '#333333';

  const handleReset = async () => {
    if (!email) {
      return Alert.alert('⚠️', '이메일을 입력해주세요.');
    }

    try {
      const response = await axios.post('http://40.233.103.122:8080/api/users/reset-password', {
        email,
      });

      Alert.alert('✅', response.data?.message || '임시 비밀번호가 이메일로 전송되었습니다.');
      router.push('/login'); 
    } catch (err) {
      console.error('비밀번호 재설정 오류:', err);
      Alert.alert('❌', err.response?.data?.message || '서버 오류가 발생했습니다.');
    }
  };

  const handleGoHome = () => router.push('/login');

  return (
    <View style={containerStyle}> {/* 다크 모드 배경색 적용 */}
      <Text style={[styles.title, { color: titleColor }]}>비밀번호 재설정</Text> {/* 다크 모드 글자색 적용 */}

      <View style={styles.form}>
        <InputField 
          value={email} 
          onChangeText={setEmail} 
          placeholder="이메일 주소" 
          style={[
            styles.inputFieldCommon,
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
        />
      </View>
      <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>확인</Text>
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
    marginBottom: 180,
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
  resetButton: {
    backgroundColor: '#05D16E',
    paddingVertical: 12,
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 10, 
    width: '50%', 
    alignSelf: 'center'
  },
  resetButtonText: {
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