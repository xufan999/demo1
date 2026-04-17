<template>
  <view class="navbar">
    <view class="mthealth">
       <img :src="require('@/static/icons.png')" style="width: 40rpx;margin-right: 10rpx;" />
       <view>麦田健康</view>
    </view>
    <view class="nav-links">
      <view
        class="nav-link"
        v-for="item in navList"
        :key="item.name"
        :class="{ active: current === item.name }"
        @click="navigate(item)"
      >
        {{ item.name }}
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    current: String, // 当前激活项
  },
  data() {
    return {
      navList: [],
      token: '',
    };
  },
  created() {
    this.token = uni.getStorageSync('token');
    this.initNavList();
  },
  methods: {
    initNavList() {
      if (!this.token) {
        this.navList = [
          { name: '首页', url: '/pages/index/index' },
          { name: '运动广场', url: '/subpkg/community/index' },
          { name: '运动福利', url: '/subpkg/store/index' },
          // { name: '个人中心', url: '/subpkg/person/index' },
          { name: '登录', url: '/subpkg/login/index' },
        ];
      } else {
        this.navList = [
          { name: '首页', url: '/pages/index/index' },
          { name: '运动广场', url: '/subpkg/community/index' },
          { name: '运动福利', url: '/subpkg/store/index' },
          // { name: '个人中心', url: '/subpkg/person/index' },
        ];
      }
    },
    navigate(item) {
      if (item.url !== this.$page.fullPath) {
        uni.navigateTo({ url: item.url });
      }
    },
  },
};
</script>

<style scoped>
/* 样式略，保持你原有的即可 */
.navbar {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  flex-wrap: wrap;
}
.nav-links {
  display: flex;
  gap: 20rpx;
}

.nav-link {
  position: relative;
  padding: 10rpx 0rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  transition: background 0.3s, color 0.3s;
  border-radius: 8rpx;
}

.nav-link:hover {
  color: #fff;
}

.nav-link.active {
  font-weight: 600;
  color: #fff;
}
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -6rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 70rpx;
  height: 4rpx;
  background: #fff;
  border-radius: 2rpx;
}
.auth-buttons {
  display: flex;
  gap: 10px;
}
.auth-btn {
  font-size: 14px;
}
.mthealth {
  display: flex;
  align-items: center;
  margin-right: 20px;
}
</style>
