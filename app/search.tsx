import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { RECYCLING_DATA, RecyclingItem } from '@/constants/recyclingData';

interface SearchResultItem extends RecyclingItem {
  score: number;
}

export default function SearchResultsScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [results, setResults] = useState<SearchResultItem[]>([]);

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
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: `'${query}' 검색 결과` }} />
      <View style={styles.container}>
        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.name + index}
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <Image source={item.icon} style={styles.itemIcon} />
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noResultsText}>'{query}'에 대한 검색 결과가 없습니다.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  itemIcon: { width: 50, height: 50, marginRight: 15 },
  itemTextContainer: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemDescription: { fontSize: 14, color: '#555', marginTop: 4 },
  noResultsText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});

