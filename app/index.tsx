import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function IntroScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoGroup}>
        <Image source={require('../assets/images/earth.png')} style={styles.image} />
        
        {/* ✅ Biugo 로고를 Image 컴포넌트와 require로 수정 */}
        <Image 
          source={require('../assets/images/biugo.png')} 
          style={{ width: 144, height: 48, resizeMode: 'contain' }} 
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
        <Text style={styles.buttonText}>START</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05D16E',
    justifyContent: 'center',
    alignItems: 'center',
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