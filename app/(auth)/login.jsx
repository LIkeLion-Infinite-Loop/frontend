import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function LoginScreen() {
  // ✅ 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleLogin = async () => {
    if(!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호 모두 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://40.233.103.122:8080/api/users/login' , {
        email,
        password,
      });
      console.log('응답 데이터:', response.data);
      if(response.status === 200 || response.status === 201) {
        const token = response.data.access_token; // 토큰 추출

        if(token) {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('refreshToken', response.data.refresh_token);

          console.log('로그인 성공:', token);
          Alert.alert('로그인 성공', '환영합니다!');
          router.push('/(tabs)'); // 홈으로 이동
        }else {
          Alert.alert('로그인 실패', '토큰을 찾을 수 없습니다.');
          console.error('로그인 실패: 토큰이 없습니다.');
        }
      } else {
        Alert.alert('로그인 실패', '예상치 못한 응답 상태 코드입니다.');
        console.error('로그인 실패:', response.status);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('로그인 오류', '서버에 문제가 발생했습니다. 네트워크 상태를 확인하세요.');
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
      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBox}>
          <Text style={styles.linkText}>가입하기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/findId')} style={styles.linkBox}>
          <Text style={styles.linkText}>아이디 찾기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/resetPassword')} style={styles.linkBox}>
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
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  linkBox: {
    width: 100, // 👈 동일한 너비
    alignItems: 'center',
  },

  linkText: {
    fontSize: 13,
    color: '#9FA6B2', // 예시 색상
  },

});