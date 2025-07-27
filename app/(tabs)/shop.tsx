import React from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShopItem {
  id: string;
  name: string;
  price: string;
  type: 'donation' | 'purchase'; 
  image: ImageSourcePropType; 
}
const shopItems: ShopItem[]  = [
  {
    id: '1',
    name: '자연을 위한 한 걸음, \n나무 심기',
    price: '기부하기',
    type: 'donation',
    image: require('../../assets/images/tree.png'), },
  {
    id: '2',
    name: '친환경 수세미',
    price: '1500P',
    type: 'purchase',
    image: require('../../assets/images/sponge.png'), },
  {
    id: '3',
    name: '친환경 대나무 칫솔',
    price: '1500P',
    type: 'purchase',
    image: require('../../assets/images/toothbrush.png'), },
  {
    id: '4',
    name: '친환경 천연 수제 비누',
    price: '2000P',
    type: 'purchase',
    image: require('../../assets/images/soap.png'), },
];

export default function ShopScreen() {
  const [myPoints, setMyPoints] = React.useState(0);

  const handleAction = (item : ShopItem) => {
    if (item.type === 'donation') {
      alert(`${item.name}에 기부하기`); 
    } else {
      alert(`${item.name}을(를) ${item.price}에 구매하기`); 
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollViewContent}>
        {/* 내 포인트 섹션 */}
        <View style={styles.pointsSection}>
          <Text style={styles.pointsLabel}>내 포인트</Text>
          <Text style={styles.pointsValue}>{myPoints}원</Text>
          <View style={styles.divider} />
        </View>

        {/* 포인트로 바꿔요 섹션 */}
        <View style={styles.exchangeSection}>
          <Text style={styles.exchangeTitle}>포인트로 바꿔요</Text>
          {shopItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction(item)}
              >
                <Text style={styles.actionButtonText}>
                  {item.type === 'donation' ? '기부하기' : '구매하기'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollViewContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pointsSection: {
    marginTop: 70,
    marginBottom: 30,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'normal',
    color: '#000',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#DBDBDB',
    marginVertical: 15,
  },
  exchangeSection: {
    marginBottom: 30,
  },
  exchangeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
   // borderRadius: 10,
    padding: 10,
    marginBottom: 15,
   // shadowColor: '#000',
   // shadowOffset: { width: 0, height: 1 },
   // shadowOpacity: 0.1,
   // shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 5,
    marginRight: 20,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 16,
    color: '#666666',
  },
  actionButton: {
    backgroundColor: '#f2f2f2', 
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#06D16E', 
    fontSize: 14,
    fontWeight: 'bold',
  },
});
