import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import InputField from '../../components/InputField';

export default function LoginScreen() {
  // 🔹 상태값: 입력된 이메일, 비밀번호
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🔹 로그인 버튼 클릭 시 실행되는 함수
  const handleLogin = async () => {
    try {
      // 🔸 로그인 API 호출
      const res = await axios.post('https://your-backend-url.com/api/users/login', {
        email,
        password,
      });

      // 🔸 응답에서 토큰 추출
      const { accessToken, refreshToken } = res.data;

      // 🔸 토큰을 AsyncStorage에 저장 (앱 전역에서 사용 가능)
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      // 🔸 로그인 성공 알림 + 페이지 이동
      Alert.alert('✅ 로그인 성공', '환영합니다!');
      router.push('/success'); // 로그인 성공 시 이동할 페이지

    } catch (err) {
      // 🔸 로그인 실패 시 에러 메시지 출력
      console.error('로그인 오류:', err);
      Alert.alert(
        '❌ 로그인 실패',
        err.response?.data?.message || '서버와의 연결에 실패했습니다.'
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔸 상단 로고 (SVG 이미지 PNG 변환본) */}
      <Image
        source={require('../../assets/images/gr_biugo.png')}
        style={styles.logo}
      />

      {/* 🔸 입력 폼 */}
      <View style={styles.form}>
        <Text style={styles.label}>아이디</Text>
        <InputField
          placeholder="이메일 또는 아이디"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>비밀번호</Text>
        <InputField
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* 🔸 로그인 버튼 (지구 이미지 + 텍스트 오버레이) */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Image
          source={require('../../assets/images/earth.png')}
          style={styles.earth}
        />
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>

      {/* 🔸 하단 네비게이션 링크들 */}
      <View style={styles.links}>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.linkText}>가입하기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/findId')}>
          <Text style={styles.linkText}>아이디 찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/resetPassword')}>
          <Text style={styles.linkText}>비밀번호 재설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 🔹 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', // 🔸 배경색: 연한 회색
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 48,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 8,
    marginTop: 16,
  },
  loginButton: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earth: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    opacity: 0.1, // 🔸 10% 투명도
  },
  loginText: {
    position: 'absolute',
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    color: '#05D16E',
  },
  links: {
    marginTop: 32,
    gap: 12,
  },
  linkText: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    color: '#05D16E',
  },
});