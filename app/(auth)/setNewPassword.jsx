import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField'; // 커스텀 인풋 필드 컴포넌트

export default function SetNewPassword() {
  // 입력된 비밀번호와 확인값 상태 관리
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // ✅ 비밀번호 재설정 요청 함수
  const handleReset = async () => {
    // 비밀번호 불일치 확인
    if (password !== confirm) {
      return Alert.alert('❌', '비밀번호가 일치하지 않습니다.');
    }

    // 비밀번호 길이 유효성 검사
    if (password.length < 6) {
      return Alert.alert('❌', '비밀번호는 최소 6자 이상이어야 합니다.');
    }

    try {
      // 서버에 새 비밀번호 전송 (백엔드 엔드포인트 주소로 교체 필요)
      const response = await axios.post('http://40.233.103.122:8080/api/auth/set-password', {
        password,
      });

      // 성공 응답 처리
      if (response.data?.message?.includes('완료')) {
        Alert.alert('✅', '비밀번호가 재설정되었습니다.');
        router.push('/login'); // 로그인 화면으로 이동
      } else {
        Alert.alert('⚠️', '비밀번호 변경 실패');
      }
    } catch (err) {
      // 예외 처리
      console.error('비밀번호 재설정 오류:', err);
      Alert.alert('⚠️', err.response?.data?.message || '서버 오류가 발생했습니다.');
    }
  };

  // ✅ 홈(인트로) 화면으로 이동
  const goHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>

      {/* 입력 폼 */}
      <View style={styles.form}>
        <Text style={styles.label}>새 비밀번호</Text>
        <InputField
          placeholder="새 비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // 비밀번호 숨김 처리
        />

        <Text style={styles.label}>비밀번호 확인</Text>
        <InputField
          placeholder="비밀번호 확인"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />
      </View>

      {/* 비밀번호 변경 버튼 */}
      <TouchableOpacity onPress={handleReset}>
        <Text style={styles.submit}>변경하기</Text>
      </TouchableOpacity>

      {/* 하단 홈 버튼 */}
      <TouchableOpacity onPress={goHome} style={styles.homeButton}>
        <Image
          source={require('../../assets/images/home_logo.png')}
          style={styles.homeLogo}
        />
      </TouchableOpacity>
    </View>
  );
}

// ✅ 스타일 정의
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