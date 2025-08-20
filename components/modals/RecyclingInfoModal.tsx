// RecyclingInfoModal.tsx
import { CategoryData } from '@/constants/recyclingData';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native'; // Dimensions 임포트 추가
import { useTheme } from '@/context/ThemeContext';

interface RecyclingInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  categoryData: CategoryData | null;
}

const { width, height } = Dimensions.get('window'); // 화면 크기 가져오기

const RecyclingInfoModal: React.FC<RecyclingInfoModalProps> = ({ isVisible, onClose, categoryData }) => {
  const { isDarkMode } = useTheme();

  if (!categoryData) {
    return null;
  }

  const modalContainerBackgroundColor = isDarkMode ? '#222222' : 'white';
  const titleColor = isDarkMode ? '#E0E0E0' : 'black';
  const itemNameColor = isDarkMode ? '#E0E0E0' : 'black';
  const itemDescriptionColor = isDarkMode ? '#AAAAAA' : '#555';
  const dividerColor = isDarkMode ? '#444444' : '#E0E0E0'; // 구분선 색상 추가

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Pressable을 ModalContainer로 교체하고, onPress를 막아서 모달 내부 터치 시 닫히지 않게 함 */}
        <View style={[styles.modalContainer, { backgroundColor: modalContainerBackgroundColor }]}>
          <Text style={[styles.title, { color: titleColor }]}>[{categoryData.koreanName}] 항목별 재활용법</Text>

          {/* 제목과 목록 사이 구분선 추가 */}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          <FlatList
            data={categoryData.items}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Image source={item.icon} style={styles.itemIcon} />
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemName, { color: itemNameColor }]}>{item.name}</Text>
                  <Text style={[styles.itemDescription, { color: itemDescriptionColor }]}>
                    {item.description.split('\n').map((line, index) => (
                      <Text key={index}>
                        {line}
                        {/* 마지막 줄이 아니면 줄바꿈 추가 */}
                        {index < item.description.split('\n').length - 1 && '\n'}
                      </Text>
                    ))}
                  </Text>
                </View>
              </View>
            )}
            // contentContainerStyle을 사용하여 FlatList의 내용이 모달 내에서 잘 보이도록
            contentContainerStyle={styles.flatListContent}
          />

          {/* 닫기 버튼 추가 */}
          <Pressable style={[styles.closeButton, { backgroundColor: isDarkMode ? '#444444' : '#f0f0f0' }]} onPress={onClose}>
              <Text style={[styles.closeButtonText, { color: isDarkMode ? '#E0E0E0' : '#555' }]}>닫기</Text>
          </Pressable>
        </View>
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
    width: width * 0.9, // 화면 너비의 90%로 설정
    maxHeight: height * 0.8, // 화면 높이의 80%로 설정
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
    marginBottom: 20,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 아이콘과 텍스트의 상단 정렬
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc', // 기본 구분선 색상
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
    marginBottom: 4,
  },
  // 새로운 스타일 추가: 상세 정보 텍스트
  itemDetailText: {
    fontSize: 14,
    lineHeight: 20, // 가독성을 위해 줄 간격 조정
  },
  closeButton: {
      marginTop: 15,
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
  },
  closeButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  // 새로운 스타일 추가: 라벨 텍스트
  detailLabel: {
    fontWeight: 'bold', // 라벨을 더 강조
    color: '#333', // 라벨 색상을 조금 더 진하게
  },
  // 기존 itemDescription 스타일은 더 이상 직접 사용되지 않지만, 필요에 따라 itemDetailText에 통합했습니다.
});

export default RecyclingInfoModal;