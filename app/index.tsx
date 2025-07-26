import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function IntroScreen() {

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
    backgroundColor: '#06D16E',
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
