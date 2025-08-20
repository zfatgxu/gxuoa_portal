import request from '@/config/axios';

// 获取上级部门转办交办列表
export const getSuperiorAssignList = (params: any) => {
  return request.get({
    url: '/petition/superior-assign/list',
    params
  });
};

// 获取上级部门转办交办详情
export const getSuperiorAssignDetail = (id: string) => {
  return request.get({
    url: `/petition/superior-assign/detail/${id}`
  });
};