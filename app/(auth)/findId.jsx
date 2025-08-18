import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

export default function FindIdScreen() {
  const { userToken } = useAuth(); // userToken은 AuthContext에서 가져옴
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [foundId, setFoundId] = useState('');
  const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기

  // 다크 모드에 따른 동적 스타일 변수 정의
  const containerStyle = isDarkMode ? styles.darkContainer : styles.container;
  const titleColor = isDarkMode ? '#E0E0E0' : '#000000';
  const inputFieldBackgroundColor = isDarkMode ? '#333333' : '#FFFFFF';
  const inputFieldBorderColor = isDarkMode ? '#555555' : '#E0E0E0';
  const inputFieldTextColor = isDarkMode ? '#E0E0E0' : '#333333';
  const resultBoxBackgroundColor = isDarkMode ? '#222222' : '#FFFFFF';
  const resultTextColor = isDarkMode ? '#E0E0E0' : '#000000';

  const handleFindId = async () => {
    try {   
      if (!name || !email) {
        return Alert.alert('⚠️', '이름과 이메일을 모두 입력해주세요.');
      }

      // userToken이 필요 없는 API 호출이라면 헤더에서 제거하거나,
      // userToken이 없을 경우에도 호출되도록 로직을 수정해야 합니다.
      // 현재 아이디 찾기 API는 인증이 필요 없을 수 있으므로, userToken이 null일 경우 헤더를 보내지 않도록 수정합니다.
      const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};

      const response = await axios.post('http://40.233.103.122:8080/api/users/find-id',
        { name, email },
        { headers }
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

  const handleGoHome = () => router.push('/login');

  return (
    <View style={containerStyle}> {/* 다크 모드 배경색 적용 */}
      <Text style={[styles.title, { color: titleColor }]}>아이디 찾기</Text> {/* 다크 모드 글자색 적용 */}

      <View style={styles.form}>
        <InputField 
          value={name} 
          onChangeText={setName} 
          placeholder="이름" 
          style={[
            styles.inputFieldCommon, 
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
        />

        <InputField 
          value={email} 
          onChangeText={setEmail} 
          placeholder="이메일" 
          style={[
            styles.inputFieldCommon, 
            { backgroundColor: inputFieldBackgroundColor, borderColor: inputFieldBorderColor, color: inputFieldTextColor }
          ]}
          placeholderTextColor={isDarkMode ? '#888888' : '#9FA6B2'}
        />
      </View>

      <TouchableOpacity onPress={handleFindId} style={styles.findButton}>
        <Text style={styles.findButtonText}>확인</Text>
      </TouchableOpacity>

      {foundId !== '' && (
        <View style={[styles.resultBox, { backgroundColor: resultBoxBackgroundColor }]}> {/* 다크 모드 배경색 적용 */}
          <Text style={[styles.resultText, { color: resultTextColor }]}>🔍 찾은 아이디: {foundId}</Text> {/* 다크 모드 글자색 적용 */}
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
    fontSize: 25,
    // color는 동적으로 설정
    marginBottom: 150,
    marginTop: -80,
  },
  form: {
    gap: 8,
    width: '100%', // 추가: 폼 너비를 100%로 설정
    alignItems: 'center', // 추가: 폼 내부 요소 중앙 정렬
  },
  label: { // 이 스타일은 사용되지 않는 것 같습니다.
    fontSize: 20,
    fontFamily: 'NotoSansKRRegular',
    marginBottom: 4,
    marginTop: 12,
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
  findButton: {
    backgroundColor: '#05D16E',
    paddingVertical: 12,
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 10, 
    width: '50%', 
    alignSelf: 'center'
  },
  findButtonText: {
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
  },
  resultBox: {
    // backgroundColor는 동적으로 설정
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%', // 결과 박스 너비 조정
    alignItems: 'center', // 결과 텍스트 중앙 정렬
  },
  resultText: {
    fontSize: 20,
    // color는 동적으로 설정
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