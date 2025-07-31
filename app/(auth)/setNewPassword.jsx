import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField'; // 커스텀 인풋 필드 컴포넌트
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

export default function SetNewPassword() {
  // 입력된 비밀번호와 확인값 상태 관리
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기

  // 다크 모드에 따른 동적 스타일 변수 정의
  const containerStyle = isDarkMode ? styles.darkContainer : styles.container;
  const titleColor = isDarkMode ? '#E0E0E0' : '#05D16E';
  const labelColor = isDarkMode ? '#BBBBBB' : '#000000'; // 라벨 색상
  const inputFieldBackgroundColor = isDarkMode ? '#333333' : '#FFFFFF';
  const inputFieldBorderColor = isDarkMode ? '#555555' : '#E0E0E0';
  const inputFieldTextColor = isDarkMode ? '#E0E0E0' : '#333333';
  const submitButtonTextColor = isDarkMode ? '#04c75a' : '#05D16E'; // '변경하기' 버튼 텍스트 색상

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
    <View style={containerStyle}> {/* 다크 모드 배경색 적용 */}
      <Text style={[styles.title, { color: titleColor }]}>비밀번호 재설정</Text> {/* 다크 모드 글자색 적용 */}

      {/* 입력 폼 */}
      <View style={styles.form}>
        <Text style={[styles.label, { color: labelColor }]}>새 비밀번호</Text> {/* 다크 모드 글자색 적용 */}
        <InputField
          placeholder="새 비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // 비밀번호 숨김 처리
          style={[
            styles.inputFieldCommon,
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
        />

        <Text style={[styles.label, { color: labelColor }]}>비밀번호 확인</Text> {/* 다크 모드 글자색 적용 */}
        <InputField
          placeholder="비밀번호 확인"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          style={[
            styles.inputFieldCommon,
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
        />
      </View>

      {/* 비밀번호 변경 버튼 */}
      <TouchableOpacity onPress={handleReset}>
        <Text style={[styles.submit, { color: submitButtonTextColor }]}>변경하기</Text> {/* 다크 모드 글자색 적용 */}
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
    backgroundColor: '#F2F2F2', // 라이트 모드 배경색
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center', // 추가: 컨테이너 내부 요소 중앙 정렬
  },
  darkContainer: {
    flex: 1,
    backgroundColor: '#121212', // 다크 모드 배경색
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center', // 추가: 컨테이너 내부 요소 중앙 정렬
  },
  title: {
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
    fontSize: 20,
    // color는 동적으로 설정
    marginBottom: 24,
  },
  form: {
    gap: 8,
    width: '100%', // 추가: 폼 너비를 100%로 설정
    alignItems: 'center', // 추가: 폼 내부 요소 중앙 정렬
  },
  label: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 4,
    marginTop: 12,
    alignSelf: 'flex-start', // 라벨은 왼쪽 정렬
    paddingLeft: 10, // 인풋 필드와 동일한 패딩
  },
  inputFieldCommon: {
    width: '100%', // 인풋 필드 너비 100%
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderWidth: 1, 
    fontSize: 16, 
    fontFamily: 'NotoSansKRRegular', 
    borderRadius: 8, // 둥근 모서리
  },
  submit: {
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    textAlign: 'center',
    // color는 동적으로 설정
    marginTop: 24,
    backgroundColor: '#05D16E', // 버튼 배경색 추가
    color: '#FFFFFF', // 버튼 텍스트 색상
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    overflow: 'hidden', // 텍스트가 튀어나오지 않도록
  },
  homeButton: {
    position: 'absolute', // 하단에 고정
    bottom: 80, // 하단에서 80px 위
    alignSelf: 'center', // 가로 중앙 정렬
    alignItems: 'center',
  },
  homeLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});