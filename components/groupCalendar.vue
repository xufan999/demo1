<template>
  <view class="sign-calendar">
    <view class="calendar-wrapper">
      <view
        class="day"
        v-for="(item, index) in visibleDates"
        :key="index"
        :class="{
          signed: item.status === 'signed',
        }"
      >
        <view class="circle">
          <uni-icons
            class="check-icon"
            type="checkmarkempty"
            :color="item.status === 'signed' ? '#fff' : '#999'"
            size="16"
          />
        </view>
        <text class="date-text">{{ item.dateStr }}</text>
      </view>
    </view>
    <!-- 收起/展开图标 -->
    <view class="toggle-arrow" @click="toggleExpand">
      <uni-icons :type="expanded ? 'up' : 'down'" size="30"></uni-icons>
    </view>
    <!-- 签到按钮 -->
    <button
      class="sign-btn"
      :disabled="hasSignedToday"
      :style="{ backgroundColor: hasSignedToday ? '#ccc' : '#ff8400' }"
      @click="signToday"
    >
      {{ hasSignedToday ? '今日已签到' : '签到' }}
    </button>
  </view>
</template>

<script>
import dayjs from 'dayjs';

export default {
  data() {
    return {
      today: dayjs().format('YYYY-MM-DD'),
      expanded: false,
      dateList: [],
      signedDates: ['2025-07-01', '2025-07-06'], // ✅ 初始模拟已签到日期
    };
  },
  computed: {
    hasSignedToday() {
      return this.signedDates.includes(this.today);
    },
    visibleDates() {
      if (this.expanded) return this.dateList;

      const index = this.dateList.findIndex((d) => d.date === this.today);
      const total = this.dateList.length;

      let start = index - 1;
      let end = index + 6;

      // 边界保护
      if (start < 0) {
        end += -start;
        start = 0;
      }
      if (end > total) {
        const over = end - total;
        start = Math.max(0, start - over);
        end = total;
      }

      return this.dateList.slice(start, end);
    },
  },
  methods: {
    generateDateList() {
      const list = [];
      const today = dayjs();

      for (let i = 34; i >= 0; i--) {
        const date = today.subtract(i, 'day');
        const dateStrFull = date.format('YYYY-MM-DD');
        list.push({
          date: dateStrFull,
          dateStr: date.format('MM.DD'),
          status: this.signedDates.includes(dateStrFull)
            ? 'signed'
            : 'unsigned',
        });
      }

      this.dateList = list;
    },
    signToday() {
      if (!this.signedDates.includes(this.today)) {
        this.signedDates.push(this.today);
        this.generateDateList();
      }
    },
    toggleExpand() {
      this.expanded = !this.expanded;
    },
  },
  mounted() {
    this.generateDateList();
  },
};
</script>

<style scoped lang="scss">
.sign-calendar {
  padding: 20rpx 0rpx;
}

.calendar-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.day {
  width: 90rpx;
  height: 110rpx;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
}

.circle {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #e6e6e6; /* 默认灰色背景 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.day.signed .circle {
  background-color: #ff8400;
  border: none;
}

.check-icon {
  width: 30rpx;
  height: 30rpx;
}

.date-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.sign-btn {
  width: 100%;
  height: 80rpx;
  color: #fff;
  font-size: 30rpx;
  border-radius: 8rpx;
  margin-top: 20rpx;
  border: none;
}

.toggle-arrow {
  display: flex;
  justify-content: center;
}
</style>
