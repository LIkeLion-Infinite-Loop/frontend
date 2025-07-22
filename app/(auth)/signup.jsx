// app/signup.jsx

import axios from 'axios'; // ✅ axios import
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function SignupScreen() {
  // ✅ 사용자 입력값 상태 선언
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(''); // UI에서만 사용됨
  const [password, setPassword] = useState('');

  // ✅ 회원가입 요청 처리 함수
  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/users/signup', {
        email,
        name,
        password,
      });

      if (response.data.message === '회원가입 완료') {
        Alert.alert('✅', '회원가입이 완료되었습니다.');
        router.push('/login');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        Alert.alert('⚠️', '이미 존재하는 이메일입니다.');
      } else {
        console.error(error);
        Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
      }
    }
  };

  // ✅ 홈(인트로)으로 이동
  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원 가입</Text>

      <View style={styles.form}>
        <Text style={styles.label}>이름</Text>
        <InputField value={name} onChangeText={setName} placeholder="이름" />

        <Text style={styles.label}>이메일</Text>
        <InputField value={email} onChangeText={setEmail} placeholder="이메일" />

        <Text style={styles.label}>아이디</Text>
        <InputField value={userId} onChangeText={setUserId} placeholder="아이디" />

        <Text style={styles.label}>비밀번호</Text>
        <InputField
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
        />
      </View>

      {/* ✅ 가입하기 버튼 */}
      <TouchableOpacity onPress={handleSignup}>
        <Text style={styles.signupButton}>가입하기</Text>
      </TouchableOpacity>

      {/* ✅ 홈으로 이동하는 하단 버튼 */}
      <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
        <Image
          source={require('../../assets/images/home_logo.png')}
          style={styles.homeLogo}
        />
      </TouchableOpacity>
    </View>
  );
}

// ✅ 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
    fontSize: 20,
    color: '#05D16E',
    marginBottom: 24,
  },
  form: {
    gap: 8,
  },
  label: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 4,
    marginTop: 12,
  },
  signupButton: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    textAlign: 'center',
    color: '#05D16E',
    marginTop: 24,
    marginBottom: 16,
  },
  homeButton: {
    alignItems: 'center',
  },
  homeLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});