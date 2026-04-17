<template>
  <view class="page">
    <view v-if="stage === 2" class="stage2-wrapper">
      <view class="top-bar">
        <view class="train-info">
          <text class="dot"></text>
          <text style="margin-right: 20rpx">摄像头已开启</text>
          <text>已训练：{{ formatTrainTime }}</text>
        </view>
        <view class="action-bar">
          <view class="close" @click="exit">
            <view class="icon-btn">
              <image src="/static/close.png"></image>
            </view>
          </view>
        </view>
      </view>

      <video
        id="trainVideo"
        ref="trainVideo"
        class="video-full"
        :src="videoUrl"
        :controls="false"
        object-fit="cover"
        playsinline
        webkit-playsinline
        x5-playsinline
        @timeupdate="onTimeUpdate"
        @ended="videoEnded"
      ></video>

      <view class="camera-wrapper">
        <video
          ref="cameraStage2"
          class="camera-small"
          autoplay
          muted
          playsinline
          webkit-playsinline
        ></video>
        <view class="switch-btn" @click="switchCamera">
          <image src="/static/jingtoufanzhuan.png"></image>
        </view>
      </view>

      <view v-if="middleCount > 0" class="middle-count">
        {{ middleCount }}
      </view>
      <view v-if="showTitle" class="middle-count middle-count1">
        <view>{{ currentTitle }}</view>
      </view>
      <view class="bottom-bar">
        <view class="play-btn" @click="togglePlay">
          <u-icon
            :name="isPlaying ? 'pause' : 'play-right-fill'"
            color="#fff"
            size="18"
          ></u-icon>
        </view>
      </view>
    </view>

    <view class="ui-layer">
      <view v-if="stage === 1" class="prepare-layer">
        <video
          ref="cameraPrepare"
          class="camera-full"
          autoplay
          muted
          playsinline
          webkit-playsinline
        ></video>
        <view class="human-frame">
          <view class="corner tl"></view>
          <view class="corner tr"></view>
          <view class="corner bl"></view>
          <view class="corner br"></view>
          <view class="center-tip">请站在框内</view>
        </view>
        <view class="right-panel">
          <view class="count-box">
            <view class="count-number">{{ prepareCount }}</view>
            <view class="count-text">请保证全身出现在手机屏幕中</view>
          </view>
          <view class="skip-btn" @click="goStage2">跳过</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    uid: {
      type: String,
      default: '',
    },
    initialTasks: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      stage: 1,
      videoUrl: '',
      cameraPosition: 'front',
      prepareCount: 5,
      prepareTimer: null,
      middleCount: 0,
      middleTimer: null,
      currentTime: 0,
      trainSeconds: 0,
      trainTimer: null,
      isPlaying: true,
      taskList: [],
      currentIndex: 0,
      currentTask: null,
      showTitle: false,
      titleCount: 5,
      titleTimer: null,
      currentTitle: '',
      hasShownTitle: false,
      isHandlingVideoEnd: false,
      cameraStream: null,
      facingMode: 'user',
      token: '',
    };
  },
  computed: {
    formatTrainTime() {
      const m = Math.floor(this.trainSeconds / 60);
      const s = this.trainSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`;
    },
  },
  mounted() {
    this.taskList = Array.isArray(this.initialTasks) ? this.initialTasks : [];
    this.initCurrentTask();
    this.startCamera();
    this.startPrepare();
    this.startTrainTimer();
    this.token = localStorage.getItem('token');
  },
  beforeDestroy() {
    this.clearAllTimers();
    this.stopCamera();
  },
  methods: {
    clearAllTimers() {
      clearInterval(this.prepareTimer);
      clearInterval(this.middleTimer);
      clearInterval(this.trainTimer);
      clearInterval(this.titleTimer);
    },
    async startCamera() {
      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        uni.showToast({
          title: '当前浏览器不支持摄像头',
          icon: 'none',
        });
        return;
      }

      this.stopCamera();

      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: this.facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        this.$nextTick(() => {
          this.attachCameraStream();
        });
      } catch (err) {
        console.error('H5 摄像头启动失败', err);
        uni.showToast({
          title: '摄像头启动失败',
          icon: 'none',
        });
      }
    },
    attachCameraStream() {
      const refs = [this.$refs.cameraPrepare, this.$refs.cameraStage2];
      refs.forEach((ref) => {
        if (!ref || !this.cameraStream) return;

        try {
          ref.srcObject = this.cameraStream;

          if (typeof ref.play === 'function') {
            const res = ref.play();

            // ✅ 兼容 Promise / 非 Promise
            if (res && typeof res.then === 'function') {
              res.catch(() => {});
            }
          }
        } catch (err) {
          console.warn('挂载摄像头流失败', err);
        }
      });
    },
    stopCamera() {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach((track) => track.stop());
        this.cameraStream = null;
      }
    },
    async switchCamera() {
      this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
      this.cameraPosition = this.cameraPosition === 'front' ? 'back' : 'front';
      await this.startCamera();
    },
    initCurrentTask() {
      this.currentTask = this.taskList[this.currentIndex] || {};
      // this.videoUrl = this.currentTask?.video?.video_url || '';
      this.videoUrl =
        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      this.currentTitle =
        this.currentTask.title || this.currentTask?.video?.title || '';
      if (!this.videoUrl) {
        this.playNextTask();
        return false;
      }
      return true;
    },
    showTitleBeforeVideo() {
      clearInterval(this.titleTimer);
      this.showTitle = true;
      this.titleCount = 5;
      this.isPlaying = false;
      const trainVideo = this.$refs.trainVideo;
      if (trainVideo && typeof trainVideo.pause === 'function') {
        trainVideo.pause();
      }
      this.titleTimer = setInterval(() => {
        this.titleCount--;
        if (this.titleCount <= 0) {
          clearInterval(this.titleTimer);
          this.showTitle = false;
          this.playVideo();
        }
      }, 1000);
    },
    playVideo() {
      setTimeout(() => {
        const trainVideo = this.$refs.trainVideo;

        if (trainVideo && typeof trainVideo.play === 'function') {
          const res = trainVideo.play();

          // ✅ 兼容写法
          if (res && typeof res.then === 'function') {
            res.catch(() => {});
          }
        }

        this.isPlaying = true;
      }, 300);
    },
    startPrepare() {
      this.prepareTimer = setInterval(() => {
        this.prepareCount--;
        if (this.prepareCount <= 0) {
          clearInterval(this.prepareTimer);
          this.goStage2();
        }
      }, 1000);
    },
    goStage2() {
      clearInterval(this.prepareTimer);
      clearInterval(this.titleTimer);
      this.stage = 2;
      this.middleCount = 0;
      this.$nextTick(() => {
        this.attachCameraStream();
      });
      const valid = this.initCurrentTask();
      if (valid && !this.hasShownTitle) {
        this.hasShownTitle = true;
        this.showTitleBeforeVideo();
      }
    },
    onTimeUpdate(e) {
      if (this.stage !== 2) return;
      this.currentTime = e.detail.currentTime;
      const duration = e.detail.duration;
      if (!duration) return;
      if (this.currentTime >= duration - 0.3) {
        this.videoEnded();
      }
    },
    startMiddleCount(callback) {
      this.middleCount = 10;
      clearInterval(this.middleTimer);
      this.middleTimer = setInterval(() => {
        this.middleCount--;
        if (this.middleCount <= 0) {
          clearInterval(this.middleTimer);
          this.middleTimer = null;
          this.middleCount = 0;
          callback && callback();
        }
      }, 1000);
    },
    async videoEnded() {
      if (this.stage !== 2 || this.isHandlingVideoEnd) return;
      this.isHandlingVideoEnd = true;
      this.isPlaying = false;
      const isLast = this.currentIndex >= this.taskList.length - 1;
      try {
        if (isLast) {
          this.finishTrain();
        } else {
          this.startMiddleCount(() => {
            this.playNextTask();
          });
        }
      } finally {
        this.isHandlingVideoEnd = false;
      }
    },
    async playNextTask() {
      this.currentIndex++;
      if (this.currentIndex >= this.taskList.length) {
        this.finishTrain();
        return;
      }
      this.middleCount = 0;
      this.middleTimer = null;
      this.hasShownTitle = false;
      const valid = this.initCurrentTask();
      if (valid) {
        this.showTitleBeforeVideo();
      }
    },
    finishTrain() {
      uni
        .request({
          url: 'https://xnln.frp.mtkjsoft.com/api/exercise_plan/checkin/',
          header: {
            Authorization: this.token,
          },
        })
        .finally(() => {
          uni.showModal({
            title: '训练完成',
            content: '恭喜你完成本次训练',
            confirmText: '返回',
            cancelText: '再练一次',
            success: (res) => {
              if (res.confirm) {
                this.exit();
              } else if (res.cancel) {
                this.restartTrain();
              }
            },
          });
        });
    },
    restartTrain() {
      this.currentIndex = 0;
      this.trainSeconds = 0;
      this.stage = 1;
      this.prepareCount = 5;
      this.hasShownTitle = false;
      this.isHandlingVideoEnd = false;
      this.clearAllTimers();
      this.$nextTick(() => {
        this.attachCameraStream();
      });
      this.startPrepare();
      this.startTrainTimer();
    },
    startTrainTimer() {
      clearInterval(this.trainTimer);
      this.trainTimer = setInterval(() => {
        this.trainSeconds++;
      }, 1000);
    },
    togglePlay() {
      const trainVideo = this.$refs.trainVideo;
      if (!trainVideo) return;
      if (this.isPlaying) {
        trainVideo.pause();
      } else {
        trainVideo.play().catch(() => {});
      }
      this.isPlaying = !this.isPlaying;
    },
    exit() {
      this.clearAllTimers();
      this.stopCamera();
      uni.reLaunch({
        url: `/subpkg/member/1?uid=${this.uid}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.page,
.prepare-layer,
.stage2-wrapper {
  min-height: 100vh;
}

.camera-full,
.video-full {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.prepare-layer {
  position: absolute;
  width: 100%;
  height: 100%;
}

.human-frame {
  position: absolute;
  top: 50%;
  left: 45%;
  transform: translate(-50%, -50%);
  width: 70vh;
  height: 70vh;
  max-width: 260px;
  max-height: 400px;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 3px solid #ff6a00;
}

.tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 16px;
}

.tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 16px;
}

.bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 16px;
}

.br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 16px;
}

.center-tip {
  position: absolute;
  left: 50%;
  top: 80%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
  width: 88px;
  height: 34px;
  text-align: center;
  line-height: 34px;
  border-radius: 8px;
}

.right-panel {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 50vh;
}

.count-box {
  background: rgba(0, 0, 0, 0.6);
  padding: 12px;
  border-radius: 16px;
  text-align: center;
  color: #fff;
}

.count-number {
  font-size: 22px;
  font-weight: bold;
}

.count-text {
  font-size: 12px;
  margin-top: 8px;
  max-width: 120px;
  line-height: 1.5;
}

.skip-btn {
  background: #ff6a00;
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 14px;
  color: #fff;
}

.stage2-wrapper {
  position: fixed;
  inset: 0;
  background: #000;
  overflow: hidden;
}

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  z-index: 20;
  color: #fff;
}

.train-info {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  margin-bottom: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #00ff66;
  border-radius: 50%;
  margin-right: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close image {
  width: 18px;
  height: 18px;
}

.camera-wrapper {
  position: absolute;
  top: 78px;
  right: 20px;
  width: 120px;
  height: 160px;
  z-index: 20;
}

.camera-small {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  object-fit: cover;
  background: #000;
}

.switch-btn {
  position: absolute;
  left: 8px;
  bottom: 8px;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch-btn image {
  width: 16px;
  height: 16px;
}

.middle-count {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 30px;
  font-weight: bold;
  color: #ff6a00;
  z-index: 15;
}

.middle-count1 {
  font-size: 24px;
}

.bottom-bar {
  position: absolute;
  bottom: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.play-btn {
  width: 80px;
  height: 40px;
  border-radius: 999px;
  background: #ff6a00;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
</style>
