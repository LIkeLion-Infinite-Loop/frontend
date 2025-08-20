import { Image } from 'expo-image';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface RecyclingInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  categoryData: any | null;
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


  const renderContent = () => {
    return (
      <ScrollView style={styles.contentScrollView}>
        {categoryData.mainImage && (
          <Image
            source={categoryData.mainImage}
            style={styles.mainInfoImage}
            contentFit="contain"
          />
        )}
        
        {categoryData.items?.map((item: any, index: number) => (
          <View key={index} style={styles.itemRow}>
            <Image 
              source={item.icon}
              style={styles.itemIcon} 
              contentFit="contain" 
            />
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemName, { color: itemNameColor }]}>{item.name}</Text>
              <Text style={[styles.itemDetailText, { color: itemDescriptionColor }]}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.modalContainer, { backgroundColor: modalContainerBackgroundColor }]}>
          <Text style={[styles.title, { color: titleColor }]}>[{categoryData.koreaName || categoryData.koreanName}] 항목별 재활용법</Text>
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {renderContent()}

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
    paddingHorizontal: 25, // 좌우 패딩
    paddingVertical: 20,   // 상하 패딩
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
    marginBottom: 15,
  },
  contentScrollView: {
    flexShrink: 1, // 내용이 많아도 모달 크기를 넘어가지 않도록 설정
  },
  mainInfoImage: {
    width: '100%',
    aspectRatio: 1.5, // 이미지 비율
    borderRadius: 10,
    marginBottom: 20, // 이미지와 설명 사이 간격
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15, // 각 아이템 설명 사이 간격
  },
  itemIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    marginTop: 5, // 아이콘과 텍스트 상단 정렬을 위한 미세조정
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  itemDetailText: {
    fontSize: 14,
    lineHeight: 21,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
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