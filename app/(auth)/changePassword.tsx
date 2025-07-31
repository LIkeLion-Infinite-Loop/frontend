import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { AppNavigationProp } from '../../types/navigation.d';
import axios from 'axios';

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

    const payload = {
      current_password: currentPassword,
      new_password: newPassword,
    };

    console.log('[🔐 요청 데이터]', payload);
    console.log('[🔐 토큰 Raw]', JSON.stringify(userToken));
    console.log('[🔐 Authorization 헤더]', `Bearer ${userToken}`);

    setIsLoading(true);

    try {
      const res = await axios.post(
        'http://40.233.103.122:8080/api/users/change-password',
        payload,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const message = res.data?.message || '비밀번호가 성공적으로 변경되었습니다.';
      Alert.alert('✅ 성공', message);
      setCurrentPassword('');
      setNewPassword('');
      navigation.goBack();

    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      console.error('❌ 응답 오류:', status, message);
      Alert.alert('❌ 실패', `에러 ${status || ''}: ${message}`);
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
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#05D16E',
    paddingVertical: 12,
    marginTop: 24,
    marginBottom: 30,
    borderRadius: 10,
    width: '50%',
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NotoSansKRRegular',
  },
});
