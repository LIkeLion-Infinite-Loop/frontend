interface Category {
  id: string;
  name: string;
  icon: any; 
  koreanName: string; 
}

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Plastic', koreanName: '플라스틱', icon: require('../assets/images/plastic.png') },
  { id: '2', name: 'Glass', koreanName: '유리', icon: require('../assets/images/glass.png') },
  { id: '3', name: 'General', koreanName: '일반', icon: require('../assets/images/vinyl.png') },
  { id: '4', name: 'Clothes', koreanName: '헌옷', icon: require('../assets/images/clothes.png') },
  { id: '5', name: 'Paper', koreanName: '종이', icon: require('../assets/images/paper.png') },
  { id: '6', name: 'Metal', koreanName: '금속', icon: require('../assets/images/can.png') },
  { id: '7', name: 'Electronics', koreanName: '전자제품', icon: require('../assets/images/elec.png') },
  { id: '8', name: 'FoodWaste', koreanName: '음식물쓰레기', icon: require('../assets/images/food.png') },
  { id: '9', name: 'Other', koreanName: '기타쓰레기', icon: require('../assets/images/battery.png') },
];