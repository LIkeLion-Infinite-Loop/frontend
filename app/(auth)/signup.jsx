import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

const handleSignUp = async () => {
  if (!name || !email || !userId || !password) {
    Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
    return;
  }

  try {
    // 'YOUR_LOCAL_IP' 부분에 위에서 찾은 IP 주소를 넣으세요.
    const response = await fetch('http://119.206.86.243:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,       
        password: password, 
        name: name,         
      }),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert('성공', '회원가입이 완료되었습니다.');
      router.replace('/(tabs)');
    } else {
      Alert.alert('오류', data.message);
    }
  } catch (error) {
    console.error('회원가입 요청 오류:', error);
  }
};

  const handleGoHome = () => {
    router.push('/'); // 첫 화면 (index.jsx)
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