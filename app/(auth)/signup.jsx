import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('입력 오류', '이름, 이메일, 비밀번호를 모두 입력해주세요.');
      return('/login');
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



  const handleGoHome = () => router.push('/login');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원 가입</Text>

      <View style={styles.form}>
        {/* <Text style={styles.label}>이름</Text> */}
        <InputField value={name} onChangeText={setName} placeholder="이름" />

        {/* <Text style={styles.label}>이메일</Text> */}
        <InputField value={email} onChangeText={setEmail} placeholder="이메일" keyboardType="email-address" />

        {/* <Text style={styles.label}>비밀번호</Text> */}
        <InputField
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
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
    backgroundColor: '#05D16E',
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 30,
    borderRadius: 10, 
    width: '50%', 
    alignSelf: 'center'
  },
  signupButtonText: {
    fontSize: 20,
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