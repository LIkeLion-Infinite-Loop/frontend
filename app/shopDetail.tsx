import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ShopDetailScreen() {
  const handleDonate = () => {
    Alert.alert('기부되었습니다.');
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={require('../assets/images/treeshop.png')}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>자연을 위한 한 걸음, 지속 가능한 지구 만들기</Text>
        <Text style={styles.description}>
          우리가 공존할 수 있는 지구를 만들기 위해 나무심기에 동참해주세요.
          {'\n'}기부금은 모두 산림 재생을 위한 나무심기에 사용됩니다.
        </Text>

        <View style={styles.statsContainer}>
          <Text style={styles.participants}>
            <Text style={styles.highlight}>209</Text>명 참여
          </Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>26,574,000</Text>
            <Text style={styles.unit}>원 달성</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>5,314% 달성</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.donateButton} onPress={handleDonate}>
          <Text style={styles.donateButtonText}>기부하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 24,
    lineHeight: 22,
  },
  statsContainer: {
    marginBottom: 20,
  },
  participants: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 12,
  },
  highlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06D16E',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 6,
  },
  unit: {
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  progressBadge: {
    backgroundColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#444',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 24,
  },
  donateButton: {
    backgroundColor: '#06D16E',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  donateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});