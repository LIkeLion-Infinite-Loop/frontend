import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // const [userId, setUserId] = useState(''); // 서버에서 사용하지 않으므로 주석 처리
  const [password, setPassword] = useState('');

  /*
  // <<<<<<< csy (상대방이 작성했던 원본 코드)
  //   // ✅ 회원가입 처리
  //   const handleSignup = async () => {
  //     try {
  //       const response = await axios.post('http://192.168.0.36:3000/register', {
  //         email,
  //         name,
  //         password,
  //       });
  //
  //       if (response.status === 201) {
  //         Alert.alert('✅', '회원가입이 완료되었습니다.');
  //         router.push('/login');
  //       }
  //     } catch (error) {
  //       if (error.response?.status === 409) {
  //         Alert.alert('⚠️', '이미 존재하는 이메일입니다.');
  //       } else {
  //         console.error(error);
  //         Alert.alert('❌', '서버 오류가 발생했습니다.');
  //       }
  //     }
  //   };
  */

  // ✅ 회원가입 처리 함수 (충돌 해결 및 수정 완료)
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('입력 오류', '이름, 이메일, 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      // ❗️서버 주소는 실제 서버를 실행 중인 컴퓨터의 내부 IP로 변경해야 합니다.
      const response = await axios.post('http://119.206.86.243:3000/register', {
        email,
        name,
        password,
      });

      if (response.status === 201) {
        Alert.alert('✅ 회원가입 성공', '로그인 페이지로 이동합니다.');
        router.push('/login');
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



  const handleGoHome = () => router.push('/');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원 가입</Text>

      <View style={styles.form}>
        <Text style={styles.label}>이름</Text>
        <InputField value={name} onChangeText={setName} placeholder="이름" />

        <Text style={styles.label}>이메일</Text>
        <InputField value={email} onChangeText={setEmail} placeholder="이메일" keyboardType="email-address" />

        <Text style={styles.label}>비밀번호</Text>
        <InputField
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
        />
      </View>

      <TouchableOpacity onPress={handleSignUp}>
        <Text style={styles.signupButton}>가입하기</Text>
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