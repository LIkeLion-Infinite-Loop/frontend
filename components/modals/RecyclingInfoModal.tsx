import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { CategoryData } from '@/constants/recyclingData'; // 위에서 정의한 타입 임포트

interface RecyclingInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  categoryData: CategoryData | null;
}

const RecyclingInfoModal: React.FC<RecyclingInfoModalProps> = ({ isVisible, onClose, categoryData }) => {
  if (!categoryData) {
    return null; // 데이터가 없으면 아무것도 렌더링하지 않음
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      {/* 반투명 배경 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* 모달 컨텐츠 (배경 클릭 시 닫히지 않도록 Pressable로 감싸지 않음) */}
        <Pressable style={styles.modalContainer}>
          <Text style={styles.title}>[{categoryData.koreanName}] 항목별 재활용법</Text>

          <FlatList
            data={categoryData.items}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Image source={item.icon} style={styles.itemIcon} />
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              </View>
            )}
          />

          {/* 닫기 버튼을 원하면 추가할 수 있습니다. */}
          {/* <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity> */}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '60%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemIcon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});

export default RecyclingInfoModal;
