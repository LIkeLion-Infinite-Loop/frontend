import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';

export default function FindIdScreen() {
  const { userToken } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundId, setFoundId] = useState('');

  const handleFindId = async () => {
    try {   
      if (!name || !email) {
        return Alert.alert('⚠️', '이름과 이메일을 모두 입력해주세요.');
      }

      const response = await axios.post('http://40.233.103.122:8080/api/users/find-id',
      { name, email },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
      if (response.data?.user_id) {
        setFoundId(response.data.user_id);
      } else {
        Alert.alert('❌', '아이디를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('아이디 찾기 오류:', err);
      Alert.alert('⚠️', err.response?.data?.message || '서버 오류가 발생했습니다.');
    }
  };

  const handleGoHome = () => router.push('/');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>아이디 찾기</Text>

      <View style={styles.form}>
        <Text style={styles.label}>이름</Text>
        <InputField value={name} onChangeText={setName} placeholder="이름" />

        <Text style={styles.label}>이메일</Text>
        <InputField value={email} onChangeText={setEmail} placeholder="이메일" />
      </View>

      <TouchableOpacity onPress={handleFindId} style={styles.findButton}>
        <Text style={styles.findButtonText}>아이디 찾기</Text>
      </TouchableOpacity>


      {foundId !== '' && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>🔍 찾은 아이디: {foundId}</Text>
        </View>
      )}

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
  findButton: {
    backgroundColor: '#05D16E',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  findButtonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultText: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
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