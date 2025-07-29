import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email) {
      return Alert.alert('⚠️', '이메일을 입력해주세요.');
    }

    try {
      const response = await axios.post('http://40.233.103.122:8080/api/users/reset-password', {
        email,
      });

      Alert.alert('✅', response.data?.message || '임시 비밀번호가 이메일로 전송되었습니다.');
      router.push('/login'); 
    } catch (err) {
      console.error('비밀번호 재설정 오류:', err);
      Alert.alert('❌', err.response?.data?.message || '서버 오류가 발생했습니다.');
    }
  };

  const handleGoHome = () => router.push('/login');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>

      <View style={styles.form}>
        <InputField value={email} onChangeText={setEmail} placeholder="이메일 주소" />
      </View>
      <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>확인</Text>
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
    backgroundColor: '#05D16E',
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 30,
    borderRadius: 10, 
    width: '50%', 
    alignSelf: 'center'
  },
  resetButtonText: {
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
