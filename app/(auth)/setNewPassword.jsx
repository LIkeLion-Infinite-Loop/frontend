import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function SetNewPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleReset = () => {
    if (password === confirm && password.length >= 6) {
      // 비밀번호 재설정 API 연결 예정
      alert('비밀번호가 재설정되었습니다.');
      router.push('/login');
    } else {
      alert('비밀번호가 일치하지 않거나 너무 짧습니다.');
    }
  };

  const goHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>

      <View style={styles.form}>
        <Text style={styles.label}>새 비밀번호</Text>
        <InputField placeholder="새 비밀번호" value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>비밀번호 확인</Text>
        <InputField placeholder="비밀번호 확인" value={confirm} onChangeText={setConfirm} secureTextEntry />
      </View>

      <TouchableOpacity onPress={handleReset}>
        <Text style={styles.submit}>변경하기</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goHome} style={styles.homeButton}>
        <Image source={require('../../assets/images/home_logo.png')} style={styles.homeLogo} />
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
  submit: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    textAlign: 'center',
    color: '#05D16E',
    marginTop: 24,
  },
  homeButton: {
    alignItems: 'center',
    marginTop: 32,
  },
  homeLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});