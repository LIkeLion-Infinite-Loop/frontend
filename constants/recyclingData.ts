export interface RecyclingItem {
  name: string;
  icon: any; // require()로 불러올 이미지 타입
  description: string;
}

export interface CategoryData {
  koreanName: string;
  items: RecyclingItem[];
}

// 카테고리 이름(영문 소문자)을 키로 사용하는 데이터 객체
export const RECYCLING_DATA: { [key: string]: CategoryData } = {
  // 1. 금속 (metal)
  metal: {
    koreanName: '금속',
    items: [
      {
        name: '캔(음료수, 통조림)',
        icon: require('../assets/images/can.png'), // 실제 캔 이미지 파일 이름으로 수정
        description: '- 내용물 비우고 헹구기, 압축시켜 버리기',
      },
      {
        name: '부탄가스, 살충제 용기',
        icon: require('../assets/images/gas.png'), // 실제 가스통 이미지 파일 이름으로 수정
        description: '- 구멍을 뚫어 가스를 완전히 비운 뒤 배출',
      },
      {
        name: '고철, 비철금속',
        icon: require('../assets/images/metal.png'), // 실제 고철 이미지 파일 이름으로 수정
        description: '- 이물질이 섞이지 않도록 한 뒤 끈으로 묶어서 배출',
      },
    ],
  },
  // 2. 플라스틱 (plastic)
  plastic: {
    koreanName: '플라스틱',
    items: [
      {
        name: '페트병, 플라스틱 용기',
        icon: require('../assets/images/plastic.png'), // 실제 페트병 이미지 파일 이름으로 수정
        description: '- 내용물 비우고 라벨 제거 후 압축하여 뚜껑 닫아 배출',
      },
    ],
  },
  // 3. 유리 (glass)
  glass: {
    koreanName: '유리',
    items: [
      {
        name: '음료수병, 기타 병류',
        icon: require('../assets/images/bottle.png'), // 실제 유리병 이미지 파일 이름으로 수정
        description: '- 내용물 비우고 헹군 뒤 배출. 담배꽁초 등 이물질 넣지 않기',
      },
      {
        name: '깨진 유리, 거울, 도자기류',
        icon: require('../assets/images/glass.png'), // 실제 깨진유리 이미지 파일 이름으로 수정
        description: '- 신문지에 싸서 종량제 봉투에 버리기. 봉투에 "깨진 유리" 표기',
      },
    ],
  },
  // 4. 비닐 (vinyl)
  vinyl: {
    koreanName: '비닐',
    items: [
      {
        name: '과자/라면 봉지, 비닐봉투',
        icon: require('../assets/images/vinyl.png'), // 실제 비닐봉투 이미지 파일 이름으로 수정
        description: '- 내용물 비우고 이물질 제거, 흩날리지 않게 봉투에 담아 배출',
      },
      {
        name: '뽁뽁이 (에어캡)',
        icon: require('../assets/images/vinyl.png'), // 실제 뽁뽁이 이미지 파일 이름으로 수정
        description: '- 테이프나 운송장 스티커를 완전히 제거한 후 배출',
      },
    ],
  },
  // 5. 헌옷 (clothes)
  clothes: {
    koreanName: '헌옷',
    items: [
      {
        name: '의류, 신발, 가방, 커튼',
        icon: require('../assets/images/clothes.png'), // 실제 옷 이미지 파일 이름으로 수정
        description: '- 헌옷수거함에 배출. 솜이불, 베개, 방석 등은 종량제 봉투 사용',
      },
    ],
  },
  // 6. 종이 (paper)
  paper: {
    koreanName: '종이',
    items: [
      {
        name: '신문, 책, 종이 상자',
        icon: require('../assets/images/paper.png'), // 실제 종이상자 이미지 파일 이름으로 수정
        description: '- 물에 젖지 않게, 비닐 코팅/테이프/스프링 등 제거 후 배출',
      },
      {
        name: '종이컵, 우유팩 (살균팩)',
        icon: require('../assets/images/paper.png'), // 실제 종이컵 이미지 파일 이름으로 수정
        description: '- 내용물 비우고 헹군 뒤, 펼쳐서 말린 후 일반 폐지와 분리 배출',
      },
    ],
  },
  // 7. 소형가전 (appliances)
  appliances: {
    koreanName: '소형가전',
    items: [
      {
        name: '1m 미만 가전제품',
        icon: require('../assets/images/elec.png'), // 실제 소형가전 이미지 파일 이름으로 수정
        description: "- 5개 이상: '폐가전 무상방문수거' 서비스 이용 (1599-0903)\n- 5개 미만: 주민센터, 아파트 내 전용 수거함 이용",
      },
    ],
  },
  // 8. 음식물쓰레기 (food)
  food: {
    koreanName: '음식물쓰레기',
    items: [
      {
        name: '과일 껍질, 남은 음식물',
        icon: require('../assets/images/food.png'), // 실제 음식물쓰레기 이미지 파일 이름으로 수정
        description: '- 물기 최대한 제거, 전용 수거용기나 종량제 봉투에 배출',
      },
      {
        name: '일반 쓰레기로 버려야 할 것',
        icon: require('../assets/images/food.png'), // 실제 뼈 이미지 파일 이름으로 수정
        description: '- 조개/견과류 껍데기, 닭/돼지 뼈, 채소 뿌리/대 등은 일반 쓰레기',
      },
    ],
  },
  // 9. 기타 쓰레기 (other)
  other: {
    koreanName: '기타 쓰레기',
    items: [
      {
        name: '폐건전지, 형광등',
        icon: require('../assets/images/battery.png'), // 실제 건전지 이미지 파일 이름으로 수정
        description: '- 전용 수거함에 배출 (주민센터, 아파트 등). 깨지지 않게 주의',
      },
      {
        name: '폐의약품',
        icon: require('../assets/images/battery.png'), // 실제 약 이미지 파일 이름으로 수정
        description: '- 약국, 보건소의 폐의약품 수거함에 배출. 절대 변기나 하수구에 버리지 않기',
      },
    ],
  },
};