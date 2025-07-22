import { router } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';

export default function FindIdScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundId, setFoundId] = useState(null);

  const handleFindId = () => {
    // ✅ 실제론 API로 사용자 확인 후 결과 반환
    if (name === '홍길동' && email === 'test@example.com') {
      setFoundId('gildong123');
    } else {
      setFoundId(''); // 결과 없음
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>아이디 찾기</Text>

      {foundId === null ? (
        <View style={styles.form}>
          <Text style={styles.label}>이름</Text>
          <InputField value={name} onChangeText={setName} placeholder="이름" />

          <Text style={styles.label}>이메일</Text>
          <InputField value={email} onChangeText={setEmail} placeholder="이메일" />

          <TouchableOpacity onPress={handleFindId}>
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>사용자님의 아이디는</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultIdText}>{foundId || '일치하는 정보가 없습니다.'}</Text>
          </View>
          <Text style={styles.resultText}>입니다.</Text>
        </View>
      )}

      <TouchableOpacity onPress={handleGoHome} style={styles.homeButton}>
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
  confirmText: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    color: '#05D16E',
    textAlign: 'center',
    marginTop: 24,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 12,
  },
  resultBox: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: '70%',
    alignItems: 'center',
  },
  resultIdText: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
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