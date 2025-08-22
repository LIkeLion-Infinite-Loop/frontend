import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Item = {
  id: string;
  name: string;
  date: string;
  category: 'CAN' | 'PLASTIC';
  selected: boolean;
};

const initialItems: Item[] = [
  { id: '1', name: '펩시 제로 콜라 355ml', date: '2025.07.02', category: 'CAN', selected: true },
  { id: '2', name: '펩시 제로 콜라 355ml', date: '2025.07.02', category: 'CAN', selected: false },
  { id: '3', name: '펩시 제로 콜라 355ml', date: '2025.07.02', category: 'CAN', selected: false },
];

export default function RecordScreen() {
  const [items, setItems] = useState(initialItems);

  const toggleSelect = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAll = () => {
    setItems(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const deleteSelected = () => {
    setItems(prev => prev.filter(item => !item.selected));
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => toggleSelect(item.id)}>
      <Image source={require('../../assets/images/canRe.png')} style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      <Ionicons
        name={item.selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={26}
        color={item.selected ? '#06D16E' : '#ccc'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>이전 분리수거 항목</Text>
            <View style={styles.separator} />
          </>
        }
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 100, paddingBottom: 30 }} // 👈 항목 전체 아래로 여백 추가
        showsVerticalScrollIndicator={false}
      />

<View style={styles.actions}>
  <TouchableOpacity onPress={selectAll} style={{ marginRight: 20 }}>
    <Text style={styles.actionText}>전체 선택</Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={deleteSelected}>
    <Text style={styles.actionText}>선택 삭제</Text>
  </TouchableOpacity>
</View>

      <Image
        source={require('../../assets/images/treeshop.png')}
        style={styles.bottomImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    height: 2,
    backgroundColor: '#CDECD8',
    marginBottom: 30,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  icon: {
    width: 50,
    height: 50,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDate: {
    fontSize: 14,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 10,
    marginBottom: 14,
  },
  actionText: {
    fontSize: 16,
    color: '#06D16E',
    fontWeight: 'bold',
  },

  bottomImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 40,
  },
});