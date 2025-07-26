import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function LoginScreen() {
  // ✅ 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /*
  // <<<<<<< csy (상대방이 작성했던 원본 코드)
  //   // ✅ 로그인 처리 함수
  //   const handleLogin = async () => {
  //     console.log('입력된 이메일:', email);
  //     console.log('입력된 비밀번호:', password);
  //
  //     try {
  //       const response = await axios.post('http://192.168.0.36:3000/login', {
  //         email,
  //         password,
  //       });
  //
  //       if (response.status === 200) {
  //         Alert.alert('✅ 로그인 성공!');
  //         router.push('/success');
  //       }
  //     } catch (err) {
  //       console.error('로그인 오류:', err); // ❗️콘솔에서 에러 확인
  //       Alert.alert(
  //         '❌ 로그인 실패',
  //         err.response?.data?.message || '서버와의 연결에 실패했습니다.'
  //       );
  //     }
  //   };
  */

  // ✅ 로그인 처리 함수 (충돌 해결 및 수정 완료)
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // ❗️서버 주소는 실제 서버를 실행 중인 컴퓨터의 내부 IP로 변경해야 합니다.
      const response = await axios.post('http://40.233.103.122:8080/login', {

        email,
        password,
      });

      if (response.status === 200) {
        Alert.alert('✅ 로그인 성공!');
        // ✅ 로그인 성공 후 이동할 화면 경로를 확인하세요. (예: '/(tabs)')
        router.push('/(tabs)');
      }
    } catch (err) {
      console.error('로그인 오류:', err); // ❗️콘솔에서 에러 확인
      Alert.alert(
        '❌ 로그인 실패',
        err.response?.data?.message || '서버와의 연결에 실패했습니다.'
      );
    }
  };


  return (
    <View style={styles.container}>
      {/* 상단 로고 */}
      <Image
        source={require('../../assets/images/gr_biugo.png')}
        style={styles.logo}
      />

      {/* 이메일, 비밀번호 입력 */}
      <View style={styles.form}>
        <Text style={styles.label}>아이디</Text>
        <InputField placeholder="이메일 또는 아이디" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>비밀번호</Text>
        <InputField
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* 로그인 버튼 */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Image source={require('../../assets/images/earth.png')} style={styles.earth} />
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>

      {/* 하단 링크 */}
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
    backgroundColor: '#F2F2F2',
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
    opacity: 0.1,
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