// 用户个人中心相关类型定义

// 用户基本信息响应类型
export interface AppUserInfoRespVO {
  id: number;
  nickname: string;
  avatar: string;
  mobile: string;
  email: string;
  gender: number;
  birthday: string | null;
  status: number;
  createTime: string;
  [key: string]: any;
}

// 用户更新基本信息请求类型
export interface AppUserUpdateReqVO {
  nickname?: string;
  avatar?: string;
  email?: string;
  gender?: number;
  birthday?: string;
  [key: string]: any;
}

// 用户更新手机号请求类型
export interface AppUserUpdateMobileReqVO {
  mobile: string;
  code: string;
}

// 基于微信小程序更新手机号请求类型
export interface AppUserUpdateMobileByWeixinReqVO {
  code: string;
}

// 用户更新密码请求类型
export interface AppUserUpdatePasswordReqVO {
  oldPassword: string;
  newPassword: string;
}

// 用户重置密码请求类型
export interface AppUserResetPasswordReqVO {
  mobile: string;
  code: string;
  password: string;
}

// 用户精简信息响应类型
export interface AppUserSimpleRespVO {
  id: number;
  nickname: string;
  avatar?: string;
  deptId: number;
  [key: string]: any;
}

// 导出通用的用户类型，供其他组件使用
export type UserVO = AppUserSimpleRespVO;
