// 간단 확장자 -> mime 매핑
export function guessContentTypeFromUri(uri: string): string {
    const lower = uri.toLowerCase().split('?')[0];
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'application/octet-stream';
  }
  
  // 파일명도 같이 만들어주면 좋음
  export function filenameFromUri(uri: string, fallback = 'upload.jpg') {
    try {
      const p = decodeURIComponent(uri.split('?')[0]);
      const last = p.split('/').pop();
      if (last && last.includes('.')) return last;
    } catch {}
    return fallback;
  }