import { CategoryData } from '@/constants/recyclingData';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface RecyclingInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  categoryData: CategoryData | null;
}

const { width, height } = Dimensions.get('window');

const RecyclingInfoModal: React.FC<RecyclingInfoModalProps> = ({ isVisible, onClose, categoryData }) => {
  const { isDarkMode } = useTheme();

  if (!categoryData) {
    return null;
  }

  const modalContainerBackgroundColor = isDarkMode ? '#222222' : 'white';
  const titleColor = isDarkMode ? '#E0E0E0' : 'black';
  const itemNameColor = isDarkMode ? '#E0E0E0' : 'black';
  const itemDescriptionColor = isDarkMode ? '#AAAAAA' : '#555';
  const dividerColor = isDarkMode ? '#444444' : '#E0E0E0';
  const itemDividerColor = isDarkMode ? '#333333' : '#ccc'; // 아이템 구분선 색상 추가

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
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <FlatList
            data={categoryData.items}
            keyExtractor={(item) => item.name}
            renderItem={({ item, index }) => (
              <View style={[
                styles.itemRow,
                index === categoryData.items.length - 1 ? {} : { borderBottomColor: itemDividerColor }
              ]}>
                <Image source={item.icon} style={styles.itemIcon} />
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemName, { color: itemNameColor }]}>{item.name}</Text>
                  <Text style={[styles.itemDetailText, { color: itemDescriptionColor }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.flatListContent}
          />

          <Pressable style={[styles.closeButton, { backgroundColor: isDarkMode ? '#444444' : '#f0f0f0' }]} onPress={onClose}>
              <Text style={[styles.closeButtonText, { color: isDarkMode ? '#E0E0E0' : '#555' }]}>닫기</Text>
          </Pressable>
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
    width: width * 0.9,
    maxHeight: height * 0.8,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 10, // 간격 살짝 조정
  },
  flatListContent: {
    paddingBottom: 10, // 하단 패딩 추가
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15, // 상하 패딩으로 변경
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemIcon: {
    width: 40, // 아이콘 크기 살짝 조정
    height: 40,
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5, // 간격 살짝 조정
  },
  itemDetailText: {
    fontSize: 14,
    lineHeight: 21, // 줄 간격 1.5배로 조정
  },
  closeButton: {
      marginTop: 20, // 상단 간격 추가
      paddingVertical: 12, // 버튼 크기 조정
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
  },
  closeButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
  },
});

export default RecyclingInfoModal;
