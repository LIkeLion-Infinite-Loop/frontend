import React from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void; 
  style?: ViewStyle; 
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder = "재활용품을 검색해주세요!", onSearch, style }) => {
  const [searchText, setSearchText] = React.useState(''); 
  const { isDarkMode } = useTheme();

  const containerBackgroundColor = isDarkMode ? '#222222' : '#FFFFFF';
  const containerBorderColor = isDarkMode ? '#555555' : '#7a7a7aff';
  const textInputColor = isDarkMode ? '#E0E0E0' : '#4b4b4bff';
  const placeholderTextColor = isDarkMode ? '#888888' : '#B9B9B9';
  const searchIconTintColor = isDarkMode ? '#BBBBBB' : '#949494ff';

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchText); 
    }
    console.log('검색어:', searchText);
  };

  return (
    <View 
        style={[
            styles.container, 
            style,
            { 
                backgroundColor: containerBackgroundColor,
                borderColor: containerBorderColor,
            }
        ]}
    >
      <TextInput
        style={[styles.textInput, { color: textInputColor }]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={searchText}

        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
        {/* ✅ 수정: tintColor를 style 밖의 prop으로 이동 */}
        <Image
          source={require('@/assets/images/search-icon.png')}
          style={styles.searchIcon}
          tintColor={searchIconTintColor}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 15, 
    height: 50,
    paddingHorizontal: 15, 
    borderWidth: 1.5, 
    marginTop: 15
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    height: '100%', 
  },
  searchIconContainer: {
    marginLeft: 10, 
    padding: 5,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
});

export default SearchInput;