// RecyclingInfoModal.tsx
import { CategoryData } from '@/constants/recyclingData';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext'; // useTheme 훅 가져오기

interface RecyclingInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  categoryData: CategoryData | null;
}

const RecyclingInfoModal: React.FC<RecyclingInfoModalProps> = ({ isVisible, onClose, categoryData }) => {
  const { isDarkMode } = useTheme(); // isDarkMode 상태 가져오기

  if (!categoryData) {
    return null;
  }

  // 다크 모드에 따른 동적 스타일 변수
  const modalContainerBackgroundColor = isDarkMode ? '#222222' : 'white';
  const titleColor = isDarkMode ? '#E0E0E0' : 'black';
  const itemNameColor = isDarkMode ? '#E0E0E0' : 'black';
  const itemDescriptionColor = isDarkMode ? '#AAAAAA' : '#555';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.modalContainer, { backgroundColor: modalContainerBackgroundColor }]}>
          <Text style={[styles.title, { color: titleColor }]}>[{categoryData.koreanName}] 항목별 재활용법</Text>

          <FlatList
            data={categoryData.items}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Image source={item.icon} style={styles.itemIcon} />
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemName, { color: itemNameColor }]}>{item.name}</Text>
                  {/* 줄바꿈 문자를 처리하여 텍스트를 여러 줄로 렌더링 */}
                  <Text style={[styles.itemDescription, { color: itemDescriptionColor }]}>
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
    marginTop: 4,
  },
});

export default RecyclingInfoModal;