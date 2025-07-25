import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <View style={styles.icons}>
          <TouchableOpacity>
            <Image source={require('../../assets/images/Ask Question.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../../assets/images/set.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Image source={require('../../assets/images/my.png')} style={styles.profileImage} />
        <View>
          <Text style={styles.name}>김민지</Text>
          <Text style={styles.email}>burigo@gmail.com</Text>
        </View>
      </View>

      <View style={styles.pointBox}>
        <Text style={styles.pointText}>P</Text>
        <Text style={styles.pointValue}>15원</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>적립내역</Text>
        <Text style={styles.sectionContent}>[캔류] 펩시콜라 제로슈거 라임향 검색 - 10P</Text>
        <Text style={styles.sectionContent}>광고 시청 - 5P</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>검색내역</Text>
        <Text style={styles.sectionContent}>[캔류] 펩시콜라 제로슈거 라임향 검색 - 10P</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>분리배출 활동내역</Text>
        <Text style={styles.sectionContent}>캔류, 플라스틱, 유리</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>도움말</Text>
        <TouchableOpacity style={styles.helpItem}>
          <Image source={require('../../assets/images/per.png')} style={styles.helpIcon} />
          <Text style={styles.helpText}>개인정보 처리방침</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.helpItem}>
          <Image source={require('../../assets/images/ser.png')} style={styles.helpIcon} />
          <Text style={styles.helpText}>서비스 이용약관</Text>
        </TouchableOpacity>
        <View style={styles.helpItem}>
          <Image source={require('../../assets/images/ver.png')} style={styles.helpIcon} />
          <Text style={[styles.helpText, { color: '#B0B0B0' }]}>버전 정보 v2.293.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 60, // ✅ 상단 여백 추가
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  icons: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  pointBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 16,
  },
  pointText: {
    color: '#05D16E',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  pointValue: {
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 24,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  helpIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  helpText: {
    fontSize: 14,
  },
});