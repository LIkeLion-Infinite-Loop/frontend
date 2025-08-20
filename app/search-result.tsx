import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { RECYCLING_DATA } from '@/constants/recyclingInfo';
import RecyclingInfoModal from '@/components/modals/RecyclingInfoModal';

// RECYCLING_DATA 객체를 검색에 용이한 배열 형태로 미리 변환해 둡니다.
const searchableData = Object.values(RECYCLING_DATA);

export default function SearchResultScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);

  useEffect(() => {
    if (query) {
      const searchTerm = query.toLowerCase().trim();
      
      const searchResults = searchableData.filter(category => {
        const matchCategoryName = category.koreanName.toLowerCase().includes(searchTerm);
        
        // ⭐️ 안정성 강화: category.items가 없을 경우를 대비해 안전장치 추가
        const matchItems = category.items && category.items.some(item => 
          item.name.toLowerCase().includes(searchTerm) || 
          item.description.toLowerCase().includes(searchTerm)
        );

        return matchCategoryName || matchItems;
      });
      
      setResults(searchResults);
    }
  }, [query]);

  const handleResultPress = (categoryData: any) => {
    setSelectedCategoryData(categoryData);
    setModalVisible(true);
  };

  // 이 부분이 화면에 결과를 그리는 부분입니다.
  const renderResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleResultPress(item)}>
      <Image source={item.items[0]?.icon} style={styles.resultIcon} contentFit="contain" />
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultName}>{item.koreanName}</Text>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.items.map((subItem: any) => subItem.name).join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: `'${query}' 검색 결과` }} />
      
      <View style={styles.content}>
        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.koreanName}
            renderItem={renderResultItem}
          />
        ) : (
          <Text style={styles.noResultText}>'{query}'에 대한 검색 결과가 없습니다.</Text>
        )}
      </View>

      <RecyclingInfoModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        categoryData={selectedCategoryData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  resultIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
  },
  noResultText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});