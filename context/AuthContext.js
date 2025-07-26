import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router'; // 로그아웃 시 리다이렉션을 위해 필요할 수 있습니다.
import { createContext, useContext, useEffect, useState } from 'react';

// 1. AuthContext 생성
const AuthContext = createContext(null);

// 2. AuthProvider 컴포넌트 정의
export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null); // 사용자 토큰 상태
  const [isLoading, setIsLoading] = useState(true); // 초기 토큰 로딩 중인지 여부

  // 앱 시작 시 AsyncStorage에서 토큰 로드
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token); // 토큰이 있으면 상태에 설정
        }
      } catch (e) {
        console.error('AsyncStorage에서 토큰 로드 실패:', e);
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };
    loadToken();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 로그인 함수: 토큰을 받아 AsyncStorage에 저장하고 상태 업데이트
  const signIn = async (token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      // 로그인 성공 후 특정 화면으로 이동하는 로직은 로그인 컴포넌트에서 처리
    } catch (e) {
      console.error('AsyncStorage에 토큰 저장 실패:', e);
    }
  };

  // 로그아웃 함수: AsyncStorage에서 토큰 삭제하고 상태 업데이트
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
      // 로그아웃 후 로그인 화면으로 이동
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('AsyncStorage에서 토큰 삭제 실패:', e);
    }
  };

  // Context Provider를 통해 자식 컴포넌트에 userToken, isLoading, signIn, signOut 제공
  return (
    <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. useAuth 훅 정의: 다른 컴포넌트에서 AuthContext를 쉽게 사용할 수 있도록 함
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다.');
  }
  return context;
};
