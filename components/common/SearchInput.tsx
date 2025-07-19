// components/common/SearchInput.tsx

import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Image, ViewStyle } from 'react-native';

// SearchInput 컴포넌트의 props 타입 정의
interface SearchInputProps {
  // placeholder는 기본값을 가지므로 선택적(optional)으로 변경하는 것이 좋습니다.
  placeholder?: string;
  onSearch?: (query: string) => void; // 검색어가 입력되었을 때 호출되는 함수
  style?: ViewStyle; // 외부에서 스타일을 받을 수 있도록 정의
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder = "재활용품을 검색해주세요!", onSearch, style }) => {
  // 오타 수정: serSearchText -> setSearchText
  const [searchText, setSearchText] = React.useState(''); // 검색어 상태

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchText); // onSearch 함수가 정의되어 있으면 검색어 전달
    }

    console.log('검색어:', searchText); // 검색어 콘솔에 출력
  };

  return (
    // 외부에서 받은 style 프롭스를 기본 스타일과 함께 적용
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#B9B9B9"
        value={searchText}
        onChangeText={setSearchText} // 수정된 setSearchText 함수 사용
        onSubmitEditing={handleSearch} // 엔터 키 입력 시 검색 실행
        returnKeyType="search" // 키보드 돋보기 아이콘 표시
      />
      <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
        {/* 검색 아이콘 이미지 */}
        {/* 경로를 @/ 별칭을 사용하는 것이 더 안정적이고 좋습니다. */}
        <Image
          source={require('@/assets/images/search-icon.png')} // assets/images/search-icon.png 파일 경로 (프로젝트 루트 기준)
          style={styles.searchIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // 가로로 배치 (텍스트 입력 필드와 아이콘)
    alignItems: 'center', // 세로 중앙 정렬
    backgroundColor: '#e8e8e8', // 배경색
    borderRadius: 25, // 둥근 모서리
    height: 50, // 높이
    paddingHorizontal: 15, // 좌우 내부 여백
  },
  textInput: {
    flex: 1, // 남은 공간을 모두 차지하여 입력 필드 확장
    fontSize: 16,
    color: '#333',
    height: '100%', // TextInput이 컨테이너 높이에 맞게 늘어나도록
  },
  searchIconContainer: {
    marginLeft: 10, // 텍스트 입력 필드와 아이콘 사이 간격
    padding: 5, // 터치 영역 확장
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#666', // 아이콘 색상 변경 (png 이미지의 경우)
  },
});

export default SearchInput;