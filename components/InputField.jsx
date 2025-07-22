import { StyleSheet, TextInput } from 'react-native';
import { COLORS } from '../constants/colors';

export default function InputField({ placeholder, value, onChangeText, secureTextEntry }) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
    input: {
      backgroundColor: '#FFFFFF',          // ✅ 흰색 박스로 만들기 위해 추가
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 10,
      padding: 14,
      fontSize: 20,                        // ✅ 폰트 사이즈 20으로 키움
      marginBottom: 16,
      color: COLORS.text,
      fontFamily: 'NotoSansKRRegular',    // ✅ 폰트 설정 추가
    },
  });