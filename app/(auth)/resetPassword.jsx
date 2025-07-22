import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function ResetPassword() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  const handleVerify = () => {
    // 예시 조건 (실제 API 연동 필요)
    if (name === '홍길동' && email === 'test@example.com' && userId === 'gildong123') {
      router.push('/setNewPassword');
    } else {
      alert('일치하는 사용자 정보가 없습니다.');
    }
  };

  const goHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>

      <View style={styles.form}>
        <Text style={styles.label}>이름</Text>
        <InputField placeholder="이름" value={name} onChangeText={setName} />

        <Text style={styles.label}>이메일</Text>
        <InputField placeholder="이메일" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>아이디</Text>
        <InputField placeholder="아이디" value={userId} onChangeText={setUserId} />
      </View>

      <TouchableOpacity onPress={handleVerify}>
        <Text style={styles.submit}>확인</Text>
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