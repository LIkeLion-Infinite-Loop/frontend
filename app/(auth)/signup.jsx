import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = () => {
    // 여기에 API 연결 예정
    router.push('/success');
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

      <TouchableOpacity onPress={handleSignup}>
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