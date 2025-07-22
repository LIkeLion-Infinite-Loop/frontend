// app/resetPassword.jsx
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function ResetPasswordScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // ✅ 비밀번호 재설정 요청
  const handleReset = async () => {
    try {
      // 실제 서버는 user_id 없이 이름, 이메일만 받도록 수정돼 있어야 함
      const response = await axios.post('http://192.168.0.36:3000/api/auth/reset-password', {
        name,
        email,
      });

      if (response.data?.message?.includes('인증코드')) {
        Alert.alert('✅', '인증코드 전송 완료');
        router.push('/setNewPassword'); // 비밀번호 재설정 화면 이동
      } else {
        Alert.alert('❌', '일치하는 사용자를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('재설정 요청 오류:', err);
      Alert.alert('⚠️', '서버 오류가 발생했습니다.');
    }
  };

  const handleGoHome = () => router.push('/');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>

      <View style={styles.form}>
        <Text style={styles.label}>이름</Text>
        <InputField value={name} onChangeText={setName} placeholder="이름" />

        <Text style={styles.label}>이메일</Text>
        <InputField value={email} onChangeText={setEmail} placeholder="이메일" />
      </View>

      <TouchableOpacity onPress={handleReset}>
        <Text style={styles.resetButton}>확인</Text>
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
  resetButton: {
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