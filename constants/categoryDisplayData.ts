// `require()`의 반환 타입에 맞게 string을 any로 수정했습니다.
export interface CategoryDisplay{
    id: string; // 카테고리 ID
    name: string; // 카테고리 이름
    icon: any; // 카테고리 아이콘
    modalData: {
        koreaName: string; // 한국어 카테고리 이름
        mainImage? :any; // 메인 이미지 (선택적)
        items?: {name: string; icon: any; description: string}[]; // 아이템 목록 (선택적)      
    };
}

// 실제 카테고리 데이터
export const CATEGORIES_LIST: CategoryDisplay[] = [
    {
        id:'metal',
        name: '금속',
        icon: require('../assets/images/metal.png'),
        modalData: {
            koreaName: '금속',
            mainImage: require('../assets/images/metalRecycling.png'),
            items: [
                { name: '캔(음료수, 통조림)', icon: require('../assets/images/can.png'), description: '-내용물 비우고 헹구기, 압축시켜 버리기' },
                { name: '부탄가스', icon: require('../assets/images/gas.png'), description: '내용을 비운 뒤 종량제 봉투에 버리기' }
            ]
        }
    },
    {
        id:'plastic',
        name: '플라스틱',
        icon: require('../assets/images/plastic.png'),
        modalData: {
            koreaName: '플라스틱',
            mainImage: require('../assets/images/plasticRecycling.png'),
            items: [
                { name: '페트병', icon: require('../assets/images/plastic.png'), description: '라벨, 뚜껑 등은 따로 분리수거하고 \n내용물은 완전히 비운 뒤, 물로 깨끗이 세척해\n분리수거하기' },
            ]
        }
    },
    {
        id:'glass',
        name: '유리',
        icon: require('../assets/images/glass.png'),
        modalData: {
            koreaName: '유리',
            mainImage: require('../assets/images/glassRecycling.png'),
            items: [
                { name: '유리병류', icon: require('../assets/images/bottle.png'), description: '병 속 내용물을 완전히 비우고 깨끗이\n세척한 뒤, 뚜껑은 따로 분리수거하고\n유리류 전용 수거함에 분리수거하기' },
            ]
        }
    },
    {
        id:'vinyl',
        name: '비닐',
        icon: require('../assets/images/vinyl.png'),
        modalData: {
            koreaName: '비닐',
            mainImage: require('../assets/images/vinylRecycling.png'),
            items: [
                { name: '비닐', icon: require('../assets/images/vinyl.png'), description: '이물질을 털어낸 뒤 깨끗한 비닐은 페트병과 함께 투명 비닐 봉지에 넣어 분리수거하고, 오염이 심한 비닐(과자봉지 등)은 종량제 봉투에 넣어 분리수거하기' },
            ]
        }
    }, 
    {
        id:'clothes',
        name: '헌옷',
        icon: require('../assets/images/clothes.png'),
        modalData: {
            koreaName: '헌옷',
            mainImage: require('../assets/images/clothesRecycling.png'),
            items: [
                { name: '헌옷', icon: require('../assets/images/clothes.png'), description: '세탁 후 완전히 건조시킨 다음 옷을 개어\n아파트 단지 내의 의류 수거함에 분리수거 하기' },
            ]
        }
    },
    {
        id:'foodWaste',
        name: '음식물 쓰레기',
        icon: require('../assets/images/food.png'),
        modalData: {
            koreaName: '음식물 쓰레기',
            mainImage: require('../assets/images/foodWaste.png'),
            items: [
                { name: '음식물 쓰레기', icon: require('../assets/images/food.png'), description: '이물질과 비닐을 제거하고 물기를 뺀 후\n음식물 전용 규격 봉투에 담아 지정 요일,\n장소에 배출한다.' },
            ]
        }
    },
    {
        id:'paper',
        name: '종이',
        icon: require('../assets/images/paper.png'),
        modalData: {
            koreaName: '종이',
            mainImage: require('../assets/images/paperRecycling.png'),
            items: [
                { name: '종이류(우유팩, 신문지 등)', icon: require('../assets/images/paper.png'), description: '테이프, 스티커 등을 제거하고 우유팩은\n세척 후 완전히 건조시키기. 신문, 책, 박스\n등은 끈으로 묶어 수거일에 문 앞/공동\n수거장에 배출하기' },
            ]
        }
    },
    {
        id:'smallAppliances',
        name: '소형가전',
        icon: require('../assets/images/elec.png'),
        modalData: {
            koreaName: '소형가전',
            mainImage: require('../assets/images/smallAppliancesRecycling.png'),
            items: [
                { name: '소형가전(모니터, TV 등)', icon: require('../assets/images/elec.png'), description: '전선, 부속품을 분리하고 배터리를 제거\n한다. 그 다음 주민센터 수거함이나 소형\n가전 전용 수거함에 버리고, 없을 경우 종\n량제 봉투에 담아 분리수거한다.' },
            ]
        }
    },
    {
        id:'etc',
        name: '기타',
        icon: require('../assets/images/battery.png'),
        modalData: {
            koreaName: '기타',
            mainImage: require('../assets/images/etcRecycling.png'),
            items: [
                { name: '기타(건전지, 형광등)', icon: require('../assets/images/battery.png'), description: '건전지, 형광등 등을 따로 모아서 일반 종량제 봉투가 아닌 전용 수거함에 분리 수거한다.\n주민센터, 대형마트, 아파트 단지 등의 수거함에 배출한다.' },
            ]
        }
    },
]