<template>
  <view>
    <!-- 弹窗主体 -->
    <view class="popup">
      <view class="popup-header">
        <view class="search-box">
          <u-search
            placeholder="请输入搜索关键词"
            v-model="keyword"
            :showAction="false"
          ></u-search>
        </view>
      </view>

      <!-- 滚动列表 -->
      <scroll-view
        scroll-y
        class="list-scroll"
        :scroll-top="scrollTop"
        scroll-with-animation
        ref="scrollView"
      >
        <view
          v-for="(item, index) in filteredList"
          :key="index"
          class="list-item"
        >
          <view class="lefts">
            <image
              src="/static/user_head_default.png"
              class="avatar"
              mode="aspectFill"
            />
            <view class="name">{{ item.name }}</view>
          </view>
          <view class="info">
            <view class="time">{{ item.time }}</view>
          </view>
        </view>
      </scroll-view>

      <!-- 悬浮按钮 -->
      <view class="fab-wrap">
        <button class="fab up" @click="scrollToTop">
          <u-icon name="arrow-upward" color="#fff" size="20"></u-icon>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showPopup: false,
      keyword: '',
      scrollTop: 0,
      list: [
        { name: '大小洒', time: '2025-06-03 10:24:01', avatar: 'https://...' },
        { name: 'Bob', time: '2025-06-03 12:07:33', avatar: 'https://...' },
        { name: '小乔', time: '2025-06-03 12:29:58', avatar: 'https://...' },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
        {
          name: '美式半糖',
          time: '2025-06-03 20:01:58',
          avatar: 'https://...',
        },
      ],
    };
  },
  computed: {
    filteredList() {
      if (!this.keyword) return this.list;
      return this.list.filter((item) => item.name.includes(this.keyword));
    },
  },
  methods: {
    scrollToTop() {
      this.scrollTop = 1; // 设置任意非 0 值触发滚动
      this.$nextTick(() => {
        this.scrollTop = 0; // 重置 scrollTop 避免后续失效
      });
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' });
    },
    onSearch() {
      // 过滤已在 computed 中实现
    },
  },
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
}

.popup {
  /* position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff; */
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.popup-header {
  height: 100rpx; /* 固定头部高度 */
  padding: 20rpx;
  border-bottom: 1px solid #eee;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
}

.popup-subtitle {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.search-box {
  display: flex;
  margin-top: 20rpx;
}

.search-input {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 8rpx;
  padding: 10rpx;
}

.list-scroll {
  height: calc(100vh - 100rpx);
}

.list-item {
  display: flex;
  align-items: center;
  padding: 20rpx 40rpx 20rpx 20rpx;
  border-bottom: 1px solid #eee;
  justify-content: space-between;
}
.lefts {
  display: flex;
  align-items: center;
}
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}
.name {
  font-weight: bold;
  color: #333;
}

.time {
  color: #666;
  font-size: 24rpx;
}

.fab-wrap {
  position: fixed;
  bottom: 160rpx;
  right: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  z-index: 101;
}

.fab {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #ff8400;
  color: #fff;
  font-size: 36rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
}
</style>
