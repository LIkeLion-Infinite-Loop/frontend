import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { RECYCLING_DATA, RecyclingItem } from '@/constants/recyclingData';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

interface SearchResultItem extends RecyclingItem {
  score: number;
}

export default function SearchResultsScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const { isDarkMode } = useTheme(); // useTheme 훅으로 isDarkMode 상태 가져오기

  useEffect(() => {
    if (query) {
      const searchTerm = query.toLowerCase();
      const searchResults: SearchResultItem[] = [];
      const addedItems = new Set<string>();

      Object.entries(RECYCLING_DATA).forEach(([categoryKey, category]) => {
        const categoryNameLower = category.koreanName.toLowerCase();

        category.items.forEach(item => {
          const itemNameLower = item.name.toLowerCase();
          const descriptionLower = item.description.toLowerCase();
          let score = 0;

          if (categoryNameLower === searchTerm) {
            score = 5;
          } else if (itemNameLower === searchTerm) {
            score = 4;
          } else if (categoryNameLower.includes(searchTerm)) {
            score = 3;
          } else if (itemNameLower.includes(searchTerm)) {
            score = 2;
          } else if (descriptionLower.includes(searchTerm)) {
            score = 1;
          }

          if (score > 0 && !addedItems.has(item.name)) {
            searchResults.push({ ...item, score });
            addedItems.add(item.name);
          }
        });
      });

      searchResults.sort((a, b) => b.score - a.score);

      setResults(searchResults);
    }
  }, [query]);
  
  // 다크 모드에 따른 동적 스타일 변수
  const safeAreaBackgroundColor = isDarkMode ? '#121212' : '#ffffff';
  const resultItemBackgroundColor = isDarkMode ? '#222222' : '#fcfcfc';
  const itemNameColor = isDarkMode ? '#e0e0e0' : '#000000';
  const itemDescriptionColor = isDarkMode ? '#aaaaaa' : '#555';
  const noResultsTextColor = isDarkMode ? '#888888' : 'gray';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: safeAreaBackgroundColor }]}>
      <Stack.Screen options={{ 
        title: `'${query}' 검색 결과`,
        headerStyle: { backgroundColor: safeAreaBackgroundColor }, // 헤더 배경색
        headerTitleStyle: { color: itemNameColor }, // 헤더 제목 색상
      }} />
      <View style={styles.container}>
        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.name + index}
            renderItem={({ item }) => (
              <View style={[styles.resultItem, { backgroundColor: resultItemBackgroundColor }]}>
                <Image source={item.icon} style={styles.itemIcon} />
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemName, { color: itemNameColor }]}>{item.name}</Text>
                  <Text style={[styles.itemDescription, { color: itemDescriptionColor }]}>
                    {/* 줄바꿈 처리 */}
                    {item.description.split('\n').map((line, index, arr) => (
                      <Text key={index}>
                        {line}
                        {index < arr.length - 1 && '\n'}
                      </Text>
                    ))}
                  </Text>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={[styles.noResultsText, { color: noResultsTextColor }]}>
            '{query}'에 대한 검색 결과가 없습니다.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
  },
  itemIcon: { width: 50, height: 50, marginRight: 15 },
  itemTextContainer: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600' },
  itemDescription: { fontSize: 14, marginTop: 4 },
  noResultsText: { textAlign: 'center', marginTop: 50, fontSize: 16 },
});