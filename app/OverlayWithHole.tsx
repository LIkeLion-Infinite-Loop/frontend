import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Rect, Defs, Mask } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const BOX_SIZE = 250;

export default function OverlayWithHole() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg height={height} width={width}>
        <Defs>
          <Mask id="mask" x="0" y="0" width={width} height={height}>
            {/* 전체 흰색(불투명) */}
            <Rect x="0" y="0" width={width} height={height} fill="white" />
            {/* 스캔 박스 부분은 검은색(투명처리됨) */}
            <Rect
              x={(width - BOX_SIZE) / 2}
              y={(height - BOX_SIZE) / 2}
              width={BOX_SIZE}
              height={BOX_SIZE}
              rx={16}
              ry={16}
              fill="black"
            />
          </Mask>
        </Defs>
        {/* 반투명 검은색 배경에 마스크 적용 */}
        <Rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#mask)"
        />
      </Svg>
    </View>
  );
}
