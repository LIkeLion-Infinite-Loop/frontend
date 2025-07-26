import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// AuthContext 관련 임포트 및 useAuth 훅 사용은 이 화면에서 더 이상 필요 없습니다.
// 왜냐하면 이 화면은 로그인 여부와 관계없이 항상 먼저 표시되고,
// 사용자가 'START' 버튼을 눌러야 다음 단계로 진행하기 때문입니다.

export default function IntroScreen() {
  // useEffect나 useAuth 훅 사용은 제거됩니다.
  // 이 화면에서는 단순히 UI를 표시하고 버튼 클릭을 기다립니다.

  return (
    <View style={styles.container}>
      <View style={styles.logoGroup}>
        <Image source={require('../assets/images/earth.png')} style={styles.image} />
        
        {/* Biugo 로고 */}
        <Image 
          source={require('../assets/images/biugo.png')} 
          style={{ width: 144, height: 48, resizeMode: 'contain' }} 
        />
      </View>

      {/* ✅ START 버튼을 누르면 로그인 화면으로 이동 */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.buttonText}>START</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#05D16E',
    paddingHorizontal: 24,
  },
  logoGroup: {
    alignItems: 'center',
    marginBottom: 64,
    transform: [{ translateY: -40 }],
  },
  image: {
    width: 260,
    height: 260,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginTop: 32,
  },
  buttonText: {
    color: '#05D16E',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
