module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // expo-router 필수
      'expo-router/babel',
      // 경로 별칭(@/...)을 Babel에게도 알려주기
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',               // "@/..." -> 프로젝트 루트
            '@app': './app',         // 선택 사항
          },
          extensions: [
            '.tsx',
            '.ts',
            '.js',
            '.jsx',
            '.json'
          ],
        },
      ],
    ],
  };
};