import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InputField from '../../components/InputField';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null); 
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('저장된 이메일 불러오기 오류:', error);
      }
    };
    loadRememberedEmail();
  }, []);
  
  const handleLogin = async () => {
    if(!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호 모두 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('http://40.233.103.122:8080/api/users/login' , {
        email,
        password,
      });
      console.log('응답 데이터:', response.data);

      if(response.status === 200 || response.status === 201) {
        const token = response.data.access_token; 
        const refreshToken = response.data.refresh_token;

        if(token && refreshToken) {
          await AsyncStorage.setItem('userToken', token);
          await AsyncStorage.setItem('refreshToken', refreshToken);

          if (response.data.email) {
            await AsyncStorage.setItem('userEmail', response.data.email);
          }

          if (rememberMe) {
            await AsyncStorage.setItem('rememberedEmail', email);
          } else {
            await AsyncStorage.removeItem('rememberedEmail');
          }
          Alert.alert('로그인 성공', '환영합니다!');

          await fetchUserInfo(token);

          router.push('/(tabs)'); 
        } else {
          Alert.alert('로그인 실패', '토큰을 찾을 수 없습니다.');
          console.error('로그인 실패: 토큰이 없습니다.');
        }
      } else {
        Alert.alert('로그인 실패', '예상치 못한 응답 상태 코드입니다.');
        console.error('로그인 실패:', response.status);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('로그인 오류', error.response?.data?.message || '서버에 문제가 발생했습니다. 네트워크 상태를 확인하세요.');
    }
  };

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get('http://40.233.103.122:8080/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUserInfo(response.data);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
        console.log('내 정보 조회 성공:', response.data);
      } else {
        console.error('내 정보 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('내 정보 조회 오류:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/gr_biugo.png')}
        style={styles.logo}
      />

      <View style={styles.form}>
        <InputField 
          placeholder="이메일 또는 아이디" 
          value={email} 
          onChangeText={setEmail} 
          style={styles.inputFieldCommon} 
        />

        <View style={styles.passwordInputContainer}>
          <InputField
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword} 
            style={[styles.inputFieldCommon, styles.passwordInputFieldSpecific]} 
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)} 
            style={styles.togglePasswordVisibility}
          >
            <MaterialCommunityIcons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color="#9FA6B2" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => setRememberMe(!rememberMe)} 
          style={styles.rememberMeContainer}
        >
          <MaterialCommunityIcons 
            name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'} 
            size={20} 
            color="#05D16E" 
          />
          <Text style={styles.rememberMeText}>아이디 저장하기</Text>
        </TouchableOpacity> 
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Image source={require('../../assets/images/earth.png')} style={styles.earth} />
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBox}>
          <Text style={styles.linkText}>가입하기</Text>
        </TouchableOpacity>
        
        <Text style={styles.linkSeparator}>|</Text> 

        <TouchableOpacity onPress={() => router.push('/findId')} style={styles.linkBox}>
          <Text style={styles.linkText}>아이디 찾기</Text>
        </TouchableOpacity>

        <Text style={styles.linkSeparator}>|</Text> 

        <TouchableOpacity onPress={() => router.push('/resetPassword')} style={styles.linkBox}>
          <Text style={styles.linkText}>비밀번호 재설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 24,
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 80, 
    paddingBottom: 50, 
  },
  logo: {
    width: 180, 
    height: 54, 
    resizeMode: 'contain',
    marginBottom: 40,
    marginTop: 40 
  },
  form: {
    width: '100%',
    gap: 16, 
    marginBottom: 20,
  },
  inputFieldCommon: {
    width: '100%', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 50, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    fontSize: 16, 
    fontFamily: 'NotoSansKRRegular', 
    color: '#333333', 
  },
  passwordInputContainer: {
    position: 'relative', 
    width: '100%', 
  },
  passwordInputFieldSpecific: {
    paddingRight: 50, 
  },
  togglePasswordVisibility: {
    position: 'absolute',
    right: 15, 
    top: '50%', 
    transform: [{ translateY: -25 }], 
    padding: 5, 
    zIndex: 1, 
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    paddingLeft: 10,
    alignSelf: 'flex-start', 
  }, 
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'NotoSansKRRegular',
    color: '#666666',
  },
  loginButton: {
    backgroundColor: '#05D16E', 
    paddingVertical: 15, 
    borderRadius: 10, 
    width: '50%', 
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', 
    overflow: 'hidden', 
    marginBottom: 30, 
  },
  earth: {
    width: '100%', 
    height: 120, 
    resizeMode: 'contain',
    opacity: 0.1, 
    position: 'absolute', 
  },
  loginButtonText: {
    fontSize: 22, 
    fontFamily: 'NotoSansKRRegular',
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    zIndex: 1, 
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', 
    alignItems: 'center',
    width: '100%', 
    marginTop: 20, 
  },
  linkBox: {
    alignItems: 'center',
    paddingHorizontal: 5, 
  },
  linkText: {
    fontSize: 14, 
    color: '#666666', 
    fontFamily: 'NotoSansKRRegular',
  },
  linkSeparator: {
    fontSize: 14,
    color: '#999999', 
    marginHorizontal: 5, 
  },
});
