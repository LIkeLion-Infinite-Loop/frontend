import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { AppNavigationProp } from '../../types/navigation.d';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<AppNavigationProp>();
  const { userToken } = useAuth();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('오류', '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!userToken) {
      Alert.alert('오류', '인증 정보가 없습니다. 다시 로그인해주세요.');
      navigation.navigate('(auth)', { screen: 'login' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://40.233.103.122:8080/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const responseText = await response.text();
      let data = null;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.warn('응답이 JSON 형식이 아님:', responseText);
        data = { message: responseText || '알 수 없는 응답 형식' };
      }

      if (response.ok) {
        Alert.alert('성공', data.message || '비밀번호가 성공적으로 변경되었습니다.');
        setCurrentPassword('');
        setNewPassword('');
        navigation.goBack();
      } else {
        Alert.alert('실패', data.message || `비밀번호 변경 실패: ${response.status} ${response.statusText}`);
        console.error('비밀번호 변경 실패 응답:', response.status, data);
      }
    } catch (error) {
      console.error('비밀번호 변경 에러 (네트워크 또는 기타):', error);
      Alert.alert('에러', '서버 통신 중 문제가 발생했습니다. 네트워크 연결 또는 서버 상태를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="현재 비밀번호"
        placeholderTextColor="#888" 
        value={currentPassword}
        onChangeText={setCurrentPassword}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="새 비밀번호"
        placeholderTextColor="#888" 
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>확인</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f2f2f2', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'semibold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 16, fontSize: 16,
    color: '#333', // 입력된 텍스트 색상도 명시적으로 설정할 수 있습니다.
  },
    button: {
    backgroundColor: '#05D16E',
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 30,
    borderRadius: 10, 
    width: '50%', 
    alignSelf: 'center'
  },
    buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
  },
});
