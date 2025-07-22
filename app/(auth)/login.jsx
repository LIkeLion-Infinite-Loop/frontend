import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async () => {
  try {
    // 1. 로컬 서버에 로그인 요청
    const response = await fetch('http://119.206.86.243:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // 2. 서버로부터 성공 응답을 받으면
    if (response.ok) {
      // 3. 홈 화면으로 이동
      router.replace('/(tabs)'); // ✅ 이 코드를 추가하세요!
    } else {
      // 로그인 실패 시
      alert(data.message);
    }
  } catch (error) {
    console.error('로그인 요청 오류:', error);
    alert('로그인 중 문제가 발생했습니다.');
  }
};

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/gr_biugo.png')}
        style={styles.logo}
      />
      <View style={styles.form}>
        <Text style={styles.label}>아이디</Text>
        <InputField placeholder="이메일 또는 아이디" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>비밀번호</Text>
        <InputField placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Image source={require('../../assets/images/earth.png')} style={styles.earth} />
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', // ✅ UIColor(0.95, 0.95, 0.95)
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 48,
    resizeMode: 'contain', // 이미지가 잘리지 않도록
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 20, // ✅ 글씨 크기 통일
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
    opacity: 0.1, // ✅ 10% 투명도
  },
  loginText: {
    position: 'absolute',
    fontSize: 20, // ✅ 동일한 사이즈
    fontFamily: 'NotoSansKRRegular',
    color: '#05D16E',
  },
  links: {
    marginTop: 32,
    gap: 12,
  },
  linkText: {
    textAlign: 'center',
    fontSize: 20, // ✅ 동일하게 적용
    fontFamily: 'NotoSansKRRegular',
    color: '#05D16E',
  },
});