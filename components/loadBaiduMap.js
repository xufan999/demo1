export function loadBaiduMap(ak) {
  return new Promise((resolve, reject) => {
    if (window.BMapGL || window.BMap) {
      resolve(window.BMapGL || window.BMap);
      return;
    }

    window.onBMapLoad = function () {
      resolve(window.BMapGL || window.BMap);
    };

    const script = document.createElement('script');
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${ak}&callback=onBMapLoad`;
    script.onerror = () => reject(new Error('百度地图脚本加载失败'));
    document.head.appendChild(script);
  });
}