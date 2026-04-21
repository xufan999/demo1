<template>
  <view class="page">
    <view v-show="stage === 2" class="stage2-wrapper">
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
              <!-- <uni-icons type="close" size="20"></uni-icons> -->
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
          x5-playsinline
          x5-video-player-type="h5"
          x5-video-player-fullscreen="false"
          controls="false"
          controlslist="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
        ></video>
        <view class="switch-btn" @click="switchCamera">
          <image src="/static/jingtoufanzhuan.png"></image>
          <!-- <uni-icons type="camera" size="20"></uni-icons> -->
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
      <view v-show="stage === 1" class="prepare-layer">
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
          <view class="skip-btn" @click="goStage2">跳过1</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
export default {
  // props: {
  //   uid: {
  //     type: String,
  //     default: '',
  //   },
  //   initialTasks: {
  //     type: Array,
  //     default() {
  //       return [];
  //     },
  //   },
  // },
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
      poseFrames: [], // 收集所有帧
      lastDetectTime: 0, // 控制15fps
      detectInterval: 66,
      poseReady: false,
      hasSentNew: false,
      feedbackTimer: null,
      lastApiTime: 0,
      hasFinished: false,
      uid: '',
      audioPlayer: null,
      isAudioProcessing: false,
      payBool: false,
      rafId: '',
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
    const query = this.getQuery();
    console.log(query, '1');
    this.uid = query.uid || '';
    this.token = query.token || '';
    // this.token =
    //   'MT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxNTczMjY5OTQxNTkzODMzNDc4LCJleHAiOjE4MDIyNDE4MTcsInYiOjF9.8b1g-UQEjO2rEzaKHIu9nRz9A17Bnwg2Mn3bPzTQg8I';
    if (query.item) {
      try {
        const parsed = JSON.parse(decodeURIComponent(query.item));
        // ✅ 关键判断：空对象也算无效
        const isEmptyObject =
          parsed &&
          typeof parsed === 'object' &&
          !Array.isArray(parsed) &&
          Object.keys(parsed).length === 0;

        if (Array.isArray(parsed)) {
          this.taskList = parsed;
          console.log(1);
        } else if (parsed && typeof parsed === 'object' && !isEmptyObject) {
          this.taskList = [parsed];
          console.log(2);
        } else {
          console.log(3);
          // ❗ 空对象，走接口
          if (this.uid) {
            this.fetchTaskList(this.uid);
            console.log(4);
          } else {
            this.taskList = [];
            console.log(5);
          }
        }
      } catch (e) {
        console.warn('item 解析失败', e);
        console.log(6);

        if (this.uid) {
          this.fetchTaskList(this.uid);
          console.log(7);
        } else {
          this.taskList = [];
          console.log(8);
        }
      }
    } else if (this.uid) {
      console.log(9);
      this.fetchTaskList(this.uid);
    } else {
      console.log(10);
      this.taskList = [];
    }
    this.payBool = query.payBool === 'true';
    if (this.token) {
      localStorage.setItem('token', this.token);
    }
    this.audioPlayer = new Audio();
    this.audioPlayer.crossOrigin = 'anonymous';
    document.addEventListener(
      'click',
      () => {
        // ✅ 用真实音频预加载一次
        this.audioPlayer.src =
          'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA...'; // 空音频
        this.audioPlayer.play().catch(() => {});
      },
      { once: true },
    );
    // ⚠️ 这里再初始化逻辑
    this.initCurrentTask();
    this.startPrepare();
    this.startTrainTimer();

    this.initPose().then(() => {
      this.startCamera();
    });
  },
  beforeDestroy() {
    this.clearAllTimers();
    this.stopCamera();
  },
  methods: {
    async fetchTaskList(uid) {
      try {
        const res = await uni.request({
          url: 'https://ailmjl.maitianlife.com/api/exercise_plan/today/',
          method: 'POST', // 或 POST
          data: { plan_id: uid },
          header: {
            Authorization: this.token,
          },
        });
        if (res.data.code === 0) {
          this.taskList = res.data.data.day_tasks || [];
          console.log(this.taskList, '1122');
          // ✅ 拿到数据后初始化任务
          this.initCurrentTask();
        } else {
          this.taskList = [];
        }
      } catch (err) {
        console.error('获取任务失败', err);
        this.taskList = [];
      }
    },
    getQuery() {
      const search = window.location.search || '';
      const query = {};
      search
        .replace(/^\?/, '')
        .split('&')
        .forEach((item) => {
          if (!item) return;
          const [key, val] = item.split('=');
          query[key] = decodeURIComponent(val || '');
        });
      return query;
    },
    async initPose() {
      const vision = await FilesetResolver.forVisionTasks('/static/wasm');
      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });

      this.poseReady = true;
    },
    // 修改后的 startDetect 逻辑
    startDetect() {
      const video = this.$refs.cameraStage2?.$el || this.$refs.cameraStage2;

      const run = () => {
        // 只有在 Stage 2 且 视频流准备好时才检测
        if (this.stage === 2 && video && video.readyState >= 2) {
          const now = performance.now();

          // 严格控制在 66ms 左右采样一次 (15fps)
          if (now - this.lastDetectTime >= this.detectInterval) {
            this.lastDetectTime = now;

            try {
              const result = this.poseLandmarker.detectForVideo(video, now);
              if (result.landmarks?.length) {
                const frame = this.convertFrame(result.landmarks[0]);
                this.poseFrames.push(frame);

                // 限制数组长度，防止内存溢出（比如只存最近 5 秒的数据，15*5=75帧）
                if (this.poseFrames.length > 75) {
                  this.poseFrames.shift();
                }
              }
            } catch (err) {
              console.error('检测中断:', err);
            }
          }
        }
        // 持续循环
        this.rafId = requestAnimationFrame(run);
      };
      this.rafId = requestAnimationFrame(run);
    },
    unlockAudio() {
      const audio = new Audio();
      audio.src = ''; // 空也行
      audio.play().catch(() => {});
    },
    convertFrame(landmarks) {
      const map = {
        nose: 0,
        left_shoulder: 11,
        right_shoulder: 12,
        left_elbow: 13,
        right_elbow: 14,
        left_wrist: 15,
        right_wrist: 16,
        left_hip: 23,
        right_hip: 24,
        left_knee: 25,
        right_knee: 26,
        left_ankle: 27,
        right_ankle: 28,
        left_heel: 29,
        right_heel: 30,
      };

      const frame = {};

      Object.keys(map).forEach((key) => {
        const i = map[key];
        const p = landmarks[i];

        frame[key] = {
          x: p.x,
          y: p.y,
          z: p.z,
          visibility: p.visibility || 0,
        };
      });

      return frame;
    },
    async callNewApi() {
      if (!this.payBool || this.poseFrames.length < 15) return; // 至少有一秒数据再发

      // 拷贝当前帧数组并清空原数组，实现“分段发送”
      const currentFrames = [...this.poseFrames];
      this.poseFrames = [];

      const payload = {
        frames: currentFrames,
        meta: {
          fps: 15,
          frame_count: currentFrames.length,
          duration_ms: Math.floor(currentFrames.length * 66),
        },
      };

      const videoId =
        this.currentTask?.video?.uid || this.currentTask?.uid || '';

      try {
        const res = await uni.request({
          url: 'https://ailmjl.maitianlife.com/api/user_pose_assessment/new/',
          method: 'POST',
          header: {
            Authorization: this.token,
            'Content-Type': 'application/json',
          },
          data: {
            video_id: videoId,
            input_payload: payload,
          },
        });

        if (res.data.code === 0) {
          this.startFeedbackPolling(res.data.data.uid);
        }
      } catch (err) {
        this.hasSentNew = false; // 失败重置锁
      }
    },
    async startFeedbackPolling(uid) {
      this.isAudioProcessing = true;

      if (this.feedbackTimer) {
        clearInterval(this.feedbackTimer);
        this.feedbackTimer = null;
      }

      this.feedbackTimer = setInterval(async () => {
        try {
          const res = await uni.request({
            url: 'https://ailmjl.maitianlife.com/api/user_pose_assessment/feedback/',
            method: 'POST',
            header: {
              Authorization: this.token,
              'Content-Type': 'application/json',
            },
            data: { uid },
          });

          const data = res.data?.data;

          if (data?.feedback || data?.feedback_audio) {
            clearInterval(this.feedbackTimer);
            this.feedbackTimer = null;

            console.log('拿到反馈:', data);

            // ⭐ 关键：等语音播放完
            if (data.feedback_audio) {
              await this.playAudio(data.feedback_audio);
            }

            if (data.feedback) {
              this.currentFeedback = data.feedback;
            }

            // ⭐ 关键：这里才算彻底结束
            this.isAudioProcessing = false;
          }
        } catch (err) {
          console.error('feedback轮询失败', err);
        }
      }, 3000);
    },
    playAudio(url) {
      return new Promise((resolve) => {
        if (!url || !this.audioPlayer) {
          resolve();
          return;
        }

        this.audioPlayer.src = url;

        this.audioPlayer.onended = () => {
          console.log('音频播放结束');
          resolve(); // ✅ 播放完才继续
        };

        this.audioPlayer.onerror = () => {
          console.warn('音频失败，直接继续');
          resolve(); // ✅ 出错也继续
        };

        this.audioPlayer.play().catch(() => {
          console.warn('播放失败');
          resolve(); // ✅ 被拦截也继续
        });
      });
    },
    clearAllTimers() {
      clearInterval(this.prepareTimer);
      clearInterval(this.middleTimer);
      clearInterval(this.trainTimer);
      clearInterval(this.titleTimer);
      // ✅ 新增
      clearInterval(this.feedbackTimer);
      this.feedbackTimer = null;
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

        // ⭐ 关键：一定要找到真实 video
        let videoEl = ref.$el || ref;

        if (videoEl.tagName !== 'VIDEO') {
          videoEl = videoEl.querySelector('video');
        }

        if (!videoEl) {
          console.warn('没找到 video 元素');
          return;
        }

        try {
          videoEl.srcObject = this.cameraStream;

          videoEl.muted = true;
          videoEl.setAttribute('playsinline', true);
          videoEl.setAttribute('webkit-playsinline', true);

          const playPromise = videoEl.play();
          this.startDetect();
          if (playPromise) {
            playPromise.catch(() => {
              console.warn('需要用户点击触发播放');
            });
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
      if (!Array.isArray(this.taskList) || this.taskList.length === 0) {
        return false;
      }
      const task = this.taskList[this.currentIndex];
      if (!task) return false;
      const url = task.video?.video_url;
      if (!url) return false;
      this.currentTask = task;
      this.videoUrl = url;
      this.currentTitle = task.title || task.video?.title || '';
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
      if (this.currentTime - this.lastApiTime >= 5) {
        this.lastApiTime = this.currentTime;
        this.callNewApi();
      }
      const duration = e.detail.duration;
      if (!duration) return;
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
      if (this.stage !== 2 || this.isHandlingVideoEnd || this.hasFinished)
        return;

      this.isHandlingVideoEnd = true;

      const isLast = this.currentIndex >= this.taskList.length - 1;

      try {
        if (isLast) {
          this.hasFinished = true; // ✅ 锁死
          setTimeout(() => {
            this.finishTrain();
          }, 1000);
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
      this.poseFrames = [];
      this.hasSentNew = false;

      // 核心改动：用一个循环找到下一个带有有效 videoUrl 的任务
      let found = false;
      while (this.currentIndex < this.taskList.length - 1) {
        this.currentIndex++; // 移动到下一个
        if (this.initCurrentTask()) {
          found = true;
          break;
        }
      }

      if (!found) {
        // 如果找完了都没找到有效任务，直接结束
        setTimeout(() => {
          this.finishTrain();
        }, 500);
        return;
      }

      // 找到了有效任务
      this.middleCount = 0;
      this.middleTimer = null;
      this.hasShownTitle = false;
      this.showTitleBeforeVideo();
    },
    async finishTrain() {
      try {
        await uni.request({
          url: 'https://ailmjl.maitianlife.com/api/exercise_plan/checkin/',
          header: {
            Authorization: this.token,
          },
        });
      } catch (e) {}
      // ❗ 非会员：直接弹，不等语音
      if (!this.payBool) {
        uni.showModal({
          title: '提示',
          content: '运动视频已播放完成，如需获取数据分析，请开通会员',
          confirmText: '返回',
          cancelText: '确认开通',
          success: (res) => {
            if (res.confirm) {
              this.exit();
            } else if (res.cancel) {
              this.goPay(); // 建议跳支付页
            }
          },
        });
        return;
      }
      // ⭐ 等语音+轮询完全结束
      await this.waitAllAudioDone();
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
    },
    waitAllAudioDone() {
      return new Promise((resolve) => {
        const check = () => {
          // ✅ 条件：没有在处理语音 + 没有轮询
          if (!this.isAudioProcessing && !this.feedbackTimer) {
            resolve();
          } else {
            setTimeout(check, 200); // 轮询检查
          }
        };

        check();
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
      if (window.wx && wx.miniProgram) {
        wx.miniProgram.getEnv((res) => {
          if (res.miniprogram) {
            wx.miniProgram.reLaunch({
              url: '/pages/index/index',
              fail: () => {
                wx.miniProgram.switchTab({
                  url: '/pages/index/index',
                });
              },
            });
          } else {
            window.location.href = '/';
          }
        });
      } else {
        window.location.href = '/';
      }
    },
    goPay() {
      this.clearAllTimers();
      this.stopCamera();
      // ⭐ 小程序环境
      if (window.wx && wx.miniProgram) {
        wx.miniProgram.navigateTo({
          url: '/subpkg/member/index',
          fail: () => {
            // 👉 兜底（极少数情况）
            wx.miniProgram.reLaunch({
              url: '/pages/index/index',
            });
          },
        });
        return;
      }
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
  z-index: 1;
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
  z-index: 9;
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
  height: 30vh;
  z-index: 9;
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
  top: 80rpx;
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
  z-index: 10;
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
