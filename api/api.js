import request from '@/utils/request'
 // 登录
 export const login = (data) => {
  return request({
    url:'/api/login/',
    method:'POST',
  data
})
 }
  //验证码
 export const capture = (data) => {
  return request({
    url:'/api/captcha/',
    method:'POST',
  data
})
 }
 //活动分类列表
export const activityKindList = (data) => {
  return request({
    url:'/api/activity_kind/select_list/',
    method:'POST',
  data
})
}
//活动列表
export const activityList = (data) => {
  return request({
    url:'/api/activity/mini_list/',
    method:'POST',
  data
})
}
//活动详情
export const activityDetail = (data) => {
  return request({
    url:'/api/activity/mini_detail/',
    method:'POST',
  data
})
}
//积分商品
export const goodsList = (data) => {
  return request({
    url:'/api/integral_goods/mini_list/',
    method:'POST',
  data
})
}
//积分商品详情
export const goodsDetail = (data) => {
  return request({
    url:'/api/integral_goods/mini_detail/',
    method:'POST',
  data
})
}