import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { COLORS } from '../constants/colors';

interface InputFieldProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}

export default function InputField({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  style,
  ...rest
}: InputFieldProps) {
  return (
    <TextInput
      style={[styles.input, style]} // ✅ 외부 스타일 병합 가능하게
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
      {...rest} // ✅ editable, keyboardType, returnKeyType 등 다 전달 가능
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 14,
    fontSize: 13,
    marginBottom: 12,
    color: COLORS.text,
    fontFamily: 'NotoSansKRRegular',
  },
});
