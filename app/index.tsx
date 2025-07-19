// import { Image } from 'expo-image';
// import { Text, View, SafeAreaView, StyleSheet } from 'react-native';


// export default function HomeScreen() {
//   return (
//     //safe area view  노치나 상단바 같은 기기 고유 영역을 피하기 위해 사용
//     <SafeAreaView style={styles.container}>
//       {/*view : HTML div 같은 역할, 여러 요소를 묶는 컨테이너 */}
//       <View style={styles.contentBox}>
//         {/* Text : 화면에 텍스트를 보여줄 때 사용 */}
//         <Text style={styles.titleText}>안녕하세요, 첫 리액트 네이티브 앱입니다.</Text>
//         <Text style={styles.descriptionText}>리액트 네이티브로 모바일 앱을 개발해보세요!</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// // 컴포넌트 스타일 정의
// const styles = StyleSheet.create({
//   container: {
//     flex:1, // 화면 전체를 채우도록 설정
//     backgroundColor: '#f2f2f2', // 배경색 설정
//   },
//   contentBox: {
//     flex: 1, //container 안에서 남은 공간 모두 차지
//     justifyContent: 'center', // 세로 방향 중앙 정렬
//     alignItems: 'center', // 가로 방향 중앙 정렬
//     padding: 20, // 내부 여백 설정
//   },
//   titleText:{
//     fontSize: 28,
//     fontWeight: 'bold', // 굵은 글씨
//     color: '#333', // 글씨 색상
//     marginBottom: 10, // 아래쪽 여백
//   },
//   descriptionText:{
//     fontSize: 18,
//     color: '#666', // 글씨 색상
//   }
// });
