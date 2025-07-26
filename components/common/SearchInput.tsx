import React from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  style?: ViewStyle; 
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder = "재활용품을 검색해주세요!", onSearch, style }) => {
  const [searchText, setSearchText] = React.useState(''); 
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchText);
    }

    console.log('검색어:', searchText); 
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="#B9B9B9"
        value={searchText}
        onChangeText={setSearchText} 
        onSubmitEditing={handleSearch}
        returnKeyType="search" 
      />
      <TouchableOpacity onPress={handleSearch} style={styles.searchIconContainer}>
        <Image
          source={require('@/assets/images/search-icon.png')} 
          style={styles.searchIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#e8e8e8', 
    borderRadius: 25, 
    height: 50, 
    paddingHorizontal: 15, 
  },
  textInput: {
    flex: 1, 
    fontSize: 16,
    color: '#333',
    height: '100%', 
  },
  searchIconContainer: {
    marginLeft: 10,
    padding: 5,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#666', 
  },
});

export default SearchInput;