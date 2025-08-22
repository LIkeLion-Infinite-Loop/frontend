export interface RecyclingItem {
  name: string;
  icon: any; 
  description: string;
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
        description: 
          '- 내용물을 깨끗이 비우고 물로 헹굽니다.\n' +
          '- 가급적 납작하게 눌러서 금속 수거함에 배출합니다.\n' +
          '- 내용물이 남아있는 캔은 재활용이 어렵습니다.',
      },
      {
        name: '부탄가스, 살충제 용기',
        icon: require('../assets/images/gas.png'),
        description:
          '- 내용물을 완전히 비운 후, 가급적 구멍을 뚫어 가스를 완전히 제거합니다.\n' +
          '- 금속 수거함에 배출합니다.\n' +
          '- 폭발 위험이 있으므로 내용물을 완전히 비우는 것이 중요합니다.',
      },
      {
        name: '고철, 비철금속',
        icon: require('../assets/images/metal.png'), 
        description: 
          '- 이물질이 섞이지 않도록 한 뒤 끈으로 묶어서 배출합니다.\n' +
          '- 공구, 철사, 못 등 모두 포함됩니다.',
      },
    ],
  },
  plastic: {
    koreanName: '플라스틱',
    items: [
      {
        name: '투명 플라스틱 (PET병 등)',
        icon: require('../assets/images/plastic.png'),
        description: 
          '- 내용물을 깨끗이 비우고 물로 헹굽니다.\n' +
          '- 라벨을 제거하고 납작하게 눌러서 플라스틱 수거함에 배출합니다.',
      },
      {
        name: '플라스틱 용기 (샴푸통, 세제통 등)',
        icon: require('../assets/images/sampoo.png'),
        description: 
          '- 내용물을 깨끗이 비우고 물로 헹군 후, 납작하게 눌러서 플라스틱 수거함에 배출합니다.\n' +
          '- 이물질이 묻어있거나 오염이 심한 용기는 일반 쓰레기로 버립니다.',
      },
      {
        name: '스티로폼 (포장재 등)',
        icon: require('../assets/images/styrofoam.png'),
        description: 
          '- 테이프 등 이물질을 완전히 제거하고 건조시킨 후, 부서지지 않게 플라스틱 수거함에 배출합니다.\n' +
          '- 음식물 등으로 오염된 스티로폼은 일반 쓰레기로 버립니다.',
      },
    ],
  },
  glass: {
    koreanName: '유리',
    items: [
      {
        name: '음료수병, 기타 병류',
        icon: require('../assets/images/bottle.png'),
        description: 
          '- 내용물을 비우고 헹군 뒤 배출합니다.\n' +
          '- 담배꽁초 등 이물질은 절대 넣지 않습니다.\n' +
          '- 뚜껑은 제거하여 재질에 맞게 따로 배출합니다.',
      },
      {
        name: '깨진 유리, 거울, 도자기류',
        icon: require('../assets/images/glass.png'), 
        description: 
          '- 신문지에 싸서 종량제 봉투에 버립니다.\n' +
          '- 봉투에 "깨진 유리"라고 표기하여 수거하는 사람이 다치지 않게 합니다.',
      },
    ],
  },
  vinyl: {
    koreanName: '비닐',
    items: [
      {
        name: '과자/라면 봉지, 비닐봉투',
        icon: require('../assets/images/vinyl.png'), 
        description: 
          '- 내용물을 깨끗이 비우고 이물질이 없는 비닐만 배출합니다.\n' +
          '- 여러 장을 한데 모아 투명 비닐봉투에 넣어 분리수거합니다.',
      },
      {
        name: '뽁뽁이 (에어캡)',
        icon: require('../assets/images/aircap.png'),
        description: 
          '- 테이프나 운송장 스티커를 완전히 제거한 후 배출합니다.\n' +
          '- 다른 비닐과 함께 투명 봉투에 담아 버립니다.',
      },
    ],
  },
  clothes: {
    koreanName: '헌옷',
    items: [
      {
        name: '의류, 신발, 가방, 커튼',
        icon: require('../assets/images/clothes.png'), 
        description: 
          '- 오염되거나 훼손되지 않은 깨끗한 옷만 의류 수거함에 배출합니다.\n' +
          '- 재활용이 어려운 오염된 옷은 일반 쓰레기로 버려야 합니다.',
      },
      {
        name: '침구류 (이불)',
        icon: require('../assets/images/blanket.png'),
        description: 
          '- 깨끗한 상태의 이불만 의류 수거함에 배출합니다.\n' +
          '- 부피가 크므로 접어서 넣어주세요.\n' +
          '- 물에 젖거나 오염이 심한 이불은 일반 쓰레기로 버립니다.',
      },
    ],
  },
  paper: {
    koreanName: '종이',
    items: [
      {
        name: '일반 종이 (신문, 책, 상자 등)',
        icon: require('../assets/images/news.png'),
        description: 
          '- 물기에 젖지 않게 하고, 테이프나 철심 등 이물질을 제거합니다.\n' +
          '- 잘 묶거나 종이류 수거함에 배출합니다.\n' +
          '- 음식물 등으로 오염된 종이나 코팅된 종이는 일반 쓰레기로 버립니다.',
      },
      {
        name: '우유팩/종이팩',
        icon: require('../assets/images/milk.png'),
        description: 
          '- 내용물을 깨끗이 비우고 물로 헹군 후 펼쳐서 건조합니다.\n' +
          '- 별도의 종이팩 수거함에 배출합니다.',
      },
    ],
  },
  appliances: {
    koreanName: '가전제품',
    items: [
      {
        name: '충전기, 소형 전자제품',
        icon: require('../assets/images/charger.png'),
        description: 
          '- 주민센터, 아파트 단지 내에 비치된 소형가전 전용 수거함에 배출합니다.\n' +
          '- 일반 쓰레기로 버리면 안 됩니다.',
      },
      {
        name: '노트북, 대형가전 등',
        icon: require('../assets/images/notebook.png'),
        description: 
          '- 5개 미만의 소량은 주민센터 등을 이용합니다.\n' +
          '- 대형 가전은 폐가전 무상 방문수거 서비스(1599-0903)를 이용합니다.',
      },
    ],
  },
  food: {
    koreanName: '음식물쓰레기',
    items: [
      {
        name: '과일 껍질, 남은 음식물',
        icon: require('../assets/images/food.png'),
        description: 
          '- 물기를 최대한 제거합니다.\n' +
          '- 음식물 쓰레기 전용 용기나 종량제 봉투에 담아 배출합니다.',
      },
      {
        name: '일반 쓰레기로 버려야 할 것들',
        icon: require('../assets/images/food.png'),
        description: 
          '- 조개/견과류 껍데기, 달걀 껍데기, 육류/어류 뼈, 씨앗류(복숭아씨, 감씨 등)\n' +
          '- 채소 뿌리/대(파뿌리, 옥수수대 등), 일회용 티백, 커피 찌꺼기 등',
      },
    ],
  },
  other: {
    koreanName: '기타 쓰레기',
    items: [
      {
        name: '폐건전지, 형광등',
        icon: require('../assets/images/battery.png'), 
        description: 
          '- 유해 폐기물이므로 전용 수거함(주민센터, 마트 등)에 분리 배출합니다.\n' +
          '- 일반 쓰레기와 섞어 버리면 안 됩니다.',
      },
      {
        name: '폐의약품',
        icon: require('../assets/images/battery.png'), 
        description: 
          '- 약국, 보건소의 폐의약품 수거함에 배출합니다.\n' +
          '- 절대 변기나 하수구에 버리지 않습니다.',
      },
      {
        name: '칼, 깨진 유리 등 날카로운 물건',
        icon: require('../assets/images/battery.png'),
        description: 
          '- 신문지 등으로 여러 겹 감싸거나 박스에 넣어 포장합니다.\n' +
          '- 날카로운 부분이 노출되지 않도록 주의하여 종량제 봉투에 버립니다.',
      },
    ],
  },
};