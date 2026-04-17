<template>
  <view class="d-poster">
    <view class="painter">
      <image :src="path" mode="widthFix"></image>
      <l-painter
        :board="posterJson"
        isCanvasToTempFilePath
        @success="onPainterSuccess"
        custom-style="position: fixed; left: 200%"
        ref="painter"
      />
    </view>
    <view class="btn btn-primary" @click="savePoster">保存海报</view>
  </view>
</template>

<script>
export default {
  name: 'd-poster',
  props: {
    posterData: {
      type: Object,
      required: true,
      default: () => ({
        image: '',
        title: '',
        codeUrl: '',
      }),
    },
  },
  watch: {
    posterData: {
      handler(val) {
        if (val && val.image && val.codeUrl) {
          this.createPoster(val);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      posterJson: {
        views: [
          {
            css: {
              marginLeft: '40rpx',
              marginTop: '30rpx',
              padding: '32rpx',
              boxSizing: 'border-box',
              background: '#fff',
              borderRadius: '16rpx',
              width: '670rpx',
              boxShadow: '0 20rpx 58rpx rgba(0,0,0,.15)',
            },
            views: [
              {
                src: '/static/fruit1.jpg', // 默认商品图
                type: 'image',
                css: {
                  objectFit: 'cover',
                  objectPosition: '50% 50%',
                  width: '606rpx',
                  height: '606rpx',
                },
              },
              {
                css: {
                  marginTop: '30rpx',
                },
                views: [
                  {
                    text: '默认标题', // 默认标题
                    type: 'text',
                    css: {
                      paddingRight: '32rpx',
                      boxSizing: 'border-box',
                      lineClamp: 2,
                      color: '#333333',
                      lineHeight: '1.8em',
                      fontSize: '36rpx',
                      width: '478rpx',
                    },
                  },
                  {
                    text: 'https://default.qr.cn', // 默认二维码链接
                    type: 'qrcode',
                    css: {
                      width: '128rpx',
                      height: '128rpx',
                    },
                  },
                ],
                type: 'view',
              },
            ],
            type: 'view',
          },
        ],
      },
      posterPath: '',
      path: '',
    };
  },
  computed: {},
  methods: {
    onPainterSuccess(url) {
      this.path = url;
      this.posterPath = url;
    },
    createPoster(posterData) {
      // 替换 posterJson 内容即可，无需手动 render
      this.posterJson.views[0].views[0].src =
        posterData.image || '/static/fruit1.jpg';
      this.posterJson.views[0].views[1].views[0].text =
        posterData.title || '默认标题';
      this.posterJson.views[0].views[1].views[1].text =
        posterData.codeUrl || 'https://default.qr.cn';
    },
    // 保存海报
    async savePoster() {
      if (!this.posterPath) {
        uni.showToast({ title: '请生成海报', icon: 'none' });
        return;
      }
      try {
        const localFilePath = await this.saveBase64Image(this.posterPath);
        uni.authorize({
          scope: 'scope.writePhotosAlbum',
          success: () => {
            uni.saveImageToPhotosAlbum({
              filePath: localFilePath,
              success: () => {
                uni.showToast({ title: '保存成功' });
              },
              fail: (err) => {
                console.error('保存失败', err);
                uni.showToast({ title: '保存失败', icon: 'none' });
              },
            });
          },
          fail: () => {
            uni.showModal({
              title: '授权提示',
              content: '需要相册权限才能保存图片，是否去设置？',
              success(res) {
                if (res.confirm) {
                  uni.openSetting();
                }
              },
            });
          },
        });
      } catch (error) {
        uni.showToast({ title: '保存失败', icon: 'none' });
      }
    },
    saveBase64Image(base64Data) {
      const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const fsm = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/temp_poster.jpg`;
      return new Promise((resolve, reject) => {
        fsm.writeFile({
          filePath,
          data: base64,
          encoding: 'base64',
          success() {
            resolve(filePath);
          },
          fail(err) {
            reject(err);
          },
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.box {
  .imgShar {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
.btn {
  margin: 20rpx auto;
}
</style>
