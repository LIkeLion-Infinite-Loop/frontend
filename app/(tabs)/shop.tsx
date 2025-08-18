// app/(tabs)/shop.tsx
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

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
    image: require('../../assets/images/tree.png'),
  },
  {
    id: '2',
    name: '친환경 수세미',
    price: '1500P',
    type: 'purchase',
    image: require('../../assets/images/sponge.png'),
  },
  {
    id: '3',
    name: '친환경 대나무 칫솔',
    price: '1500P',
    type: 'purchase',
    image: require('../../assets/images/toothbrush.png'),
  },
  {
    id: '4',
    name: '친환경 천연 수제 비누',
    price: '2000P',
    type: 'purchase',
    image: require('../../assets/images/soap.png'),
  },
];

export default function ShopScreen() {
  const [myPoints, setMyPoints] = React.useState(0);
  const { isDarkMode } = useTheme();

  // 다크 모드에 따른 동적 스타일 변수
  const containerBackgroundColor = isDarkMode ? '#121212' : '#FFFFFF';
  const pointsLabelColor = isDarkMode ? '#E0E0E0' : '#333';
  const pointsValueColor = isDarkMode ? '#FFFFFF' : '#000';
  const dividerColor = isDarkMode ? '#444444' : '#DBDBDB';
  const exchangeTitleColor = isDarkMode ? '#E0E0E0' : '#333';
  const itemCardBackgroundColor = isDarkMode ? '#1E1E1E' : '#fdfdfdff';
  const itemNameColor = isDarkMode ? '#E0E0E0' : '#333333';
  const itemPriceColor = isDarkMode ? '#BBBBBB' : '#666666';
  const actionButtonBackgroundColor = isDarkMode ? '#333333' : '#ffffffff';
  const actionButtonBorderColor = isDarkMode ? '#555555' : '#f2f2f2';
  const actionButtonTextColor = isDarkMode ? '#04c75a' : '#06D16E';

  const handleAction = (item: ShopItem) => {
    if (item.type === 'donation') {
      router.push('/shopDetail');
    } else {
      Alert.alert('구매하기', `${item.name}을(를) ${item.price}에 구매하시겠습니까?`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.pointsSection}>
          <Text style={[styles.pointsLabel, { color: pointsLabelColor }]}>내 포인트</Text>
          {/* --- 수정된 부분 --- */}
          <Text style={[styles.pointsValue, { color: pointsValueColor }]}>{`${myPoints}원`}</Text>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        </View>

        <View style={styles.exchangeSection}>
          <Text style={[styles.exchangeTitle, { color: exchangeTitleColor }]}>포인트로 바꿔요</Text>
          {shopItems.map((item) => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: itemCardBackgroundColor }]}>
              <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
              <View style={styles.itemDetails}>
                <Text
                    style={[styles.itemName, { color: itemNameColor }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {item.name}
                </Text>
                <Text style={[styles.itemPrice, { color: itemPriceColor }]}>{item.price}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: actionButtonBackgroundColor,
                    borderColor: actionButtonBorderColor,
                  }
                ]}
                onPress={() => handleAction(item)}
              >
                <Text style={[styles.actionButtonText, { color: actionButtonTextColor }]}>
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
    // backgroundColor는 동적으로 설정
  },
  scrollViewContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  pointsSection: {
    marginTop: 70,
    marginBottom: 30,
  },
  pointsLabel: {
    fontSize: 14,
    // color는 동적으로 설정
    marginBottom: 5,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'normal',
    // color는 동적으로 설정
    marginBottom: 20,
  },
  divider: {
    height: 1,
    // backgroundColor는 동적으로 설정
    marginVertical: 15,
  },
  exchangeSection: {
    marginBottom: 30,
  },
  exchangeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    // color는 동적으로 설정
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor는 동적으로 설정
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 5,
    marginRight: 20,
    // resizeMode: 'cover', -> 'contain'으로 변경
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    // color는 동적으로 설정
    marginBottom: 10,
  },
  itemPrice: {
    fontSize: 16,
    // color는 동적으로 설정
  },
  actionButton: {
    // backgroundColor는 동적으로 설정
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    // borderColor는 동적으로 설정
    borderWidth: 1,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    // color는 동적으로 설정
    fontSize: 14,
      fontWeight: 'bold',
  },
});
