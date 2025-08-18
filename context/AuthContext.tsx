import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

// ✅ AuthContext의 타입을 정의합니다.
interface AuthContextType {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ✅ AuthContext를 초기화할 때, null 대신 기본 값을 제공합니다.
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userToken, setUserToken] = useState<string | null>(null); // 사용자 토큰 상태
  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기 토큰 로딩 중인지 여부

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

  // 로그인 함수
  const signIn = async (token: string) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
    } catch (e) {
      console.error('AsyncStorage에 토큰 저장 실패:', e);
    }
  };

  // 로그아웃 함수
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

  return (
    <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) { // ✅ 여기를 context === null 로 변경합니다.
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다.');
  }
  return context;
};
