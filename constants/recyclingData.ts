export interface RecyclingItem {
  name: string;
  icon: any; // require()로 불러올 이미지 타입
  method: string; // 배출 방법
  location: string; // 배출 장소
  notes: string; // 추가 정보
}

export interface CategoryData {
  koreanName: string;
  items: RecyclingItem[];
}

export const RECYCLING_DATA: { [key: string]: CategoryData } = {
  metal: {
    koreanName: '금속',
    items: [
      {
        name: '캔(음료수, 통조림)',
        icon: require('../assets/images/can.png'),
        method: '내용물 비우고 헹구기, 가능한 압착하여 부피 줄이기, 플라스틱 뚜껑 등 다른 재질 제거', 
        location: '지정된 금속 수거함', 
        notes: '담배꽁초 등 이물질 넣지 않기', 
      },
      {
        name: '기타 캔류(부탄가스, 살충제 용기)',
        icon: require('../assets/images/can.png'),
        method: '노즐 눌러 내용물 완전히 제거 후 배출', 
        location: '지정된 금속 수거함', 
        notes: '내용물이 남아있는 캔류(락카, 페인트통 등)는 일반쓰레기(종량제 봉투)로 배출', 
      },
      {
        name: '고철류',
        icon: require('../assets/images/can.png'),
        method: '이물질 섞이지 않도록 배출', 
        location: '지정된 금속 수거함', 
        notes: '',
      },
    ],
  },
plastic: {
  koreanName: '플라스틱', 
  items: [
    {
      name: 'PET/HDPE 병, 깨끗한 비닐, 포장재 스티로폼',
      icon: require('../assets/images/plastic.png'),
      method: '내용물 비우고 깨끗하게 헹구기, 라벨/뚜껑 제거, 납작하게 만들기',
      location: '지정된 플라스틱 수거함',
      notes: '음식물 묻은 플라스틱/스티로폼, 오염된 비닐은 일반 폐기물 (오염 시 재활용 불가)',
    },
  ],
},
  glass: {
    koreanName: '유리',
    items: [
      {
        name: '음료수 병, 식품 용기',
        icon: require('../assets/images/bottle.png'),
        method: '내용물 비우고 깨끗하게 헹구기, 뚜껑/라벨 제거, 색깔별(투명, 갈색, 녹색) 분리',
        location: '지정된 유리병 수거함 (색깔별)',
        notes: '깨진 유리, 도자기, 거울, 전구, 내열 유리는 일반 폐기물 (성분 및 녹는점 상이)',
      },
    ],
  },
  general: {
    koreanName: '일반',
    items: [
      {
        name: '라면, 과자 봉지 등 깨끗한 비닐류(필름류)',
        icon: require('../assets/images/vinyl.png'),
        method: '내용물 완전히 비우고 이물질 제거, 흩날리지 않도록 투명 또는 반투명 봉투에 담아 배출',
        location: '지정된 비닐류 수거함', 
        notes: '분리배출 표시가 없는 비닐류도 포함. 오염된 비닐은 일반쓰레기(종량제 봉투)로 배출', 
      },
    ],
  },
  clothes: {
    koreanName: '헌옷',
    items: [
      {
        name: '헌 옷, 이불(솜이불 제외), 신발, 양말, 가방',
        icon: require('../assets/images/clothes.png'),
        method: '방문 수거 서비스 이용 또는 전용 수거함 배출', 
        location: '민간 수거 업체 방문 수거 (20kg 이상 권장) 또는 헌옷 수거함', 
        notes: '재사용 또는 재활용 촉진 (매립 부담 감소). 책, 가방, 신발, 모자, 수건, 커튼, 벨트 등 함께 수거 가능', 
      },
    ],
  },
  paper: {
    koreanName: '종이',
    items: [
      {
        name: '신문, 잡지, 책, 골판지, 종이컵 등',
        icon: require('../assets/images/paper.png'),
        method: '이물질(비닐, 심, 테이프) 제거, 납작하게 접기, 종이컵은 헹구기',
        location: '지정된 종이 수거함 (종이컵/우유팩은 전용 수거함 또는 종이류와 구분하여 배출)',
        notes: '이물질 제거 필수 (재활용 품질 저하 방지)',
      },
    ],
  },
  electronics: {
    koreanName: '전자제품',
    items: [
      {
        name: '소형/대형 가전제품',
        icon: require('../assets/images/elec.png'),
        method: "해당 없음",
        location: "온라인 예약 필수 (무료 수거)",
        notes: '- 소형 5개 미만은 별도 문의 필요. 귀중한 재료 및 유해 물질 포함',
      },
    ],
  },
  foodwaste: {
    koreanName: '음식물쓰레기',
    items: [
      {
        name: '음식물 찌꺼기, 과일, 채소, 조리된 음식',
        icon: require('../assets/images/food.png'),
        method: '- 물기 제거 후 음식물 쓰레기 전용 봉투에 담기',
        location: 'RFID 시스템 (무게당 요금)',
        notes: '- 뼈, 껍데기, 티백, 커피 찌꺼기, 달걀 껍데기, 큰 씨앗은 일반 폐기물 (처리 기계 손상, 분해 어려움)',
      },
    ],
  },
  other: {
    koreanName: '기타 쓰레기',
    items: [
      {
        name: '폐건전지, 형광등',
        icon: require('../assets/images/battery.png'), 
        method: '- 해당 없음',
        location: '아파트/주민센터 내 지정 수거함',
        notes: '유해 폐기물로 환경 오염 방지 및 공중 안전을 위해 전용 수거함 사용',
      },
      {
        name: '의료 폐기물, 화학 물질, 유효 기간 지난 의약품',
        icon: require('../assets/images/battery.png'),
        method: '해당 없음',
        location: '전문 처리 기관 문의 (일반 수거 불가)',
        notes: '병원균, 독성 물질 등 심각한 위험 초래 가능성. 공중 안전 및 환경 보호를 위해 전문 처리 필수. (ex: 약국 폐의약품 수거함)',
      },
      {
        name: '가구, 대형 가정용품',
        icon: require('../assets/images/battery.png'),
        method: '해당 없음',
        location: '온라인 신청 후 스티커 부착, 지정 장소 배출',
        notes: '수수료 발생, 사전 예약 필수 (무분별한 투기 방지)',
      },
    ],
  },
};