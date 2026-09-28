import type { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/menu',
    method: 'get',
    response: () => ({
      code: 200,
      data: [
        {
          path: '/dashboard',
          name: '仪表盘',
          icon: 'DashboardOutlined',
        },
        {
          path: '/user',
          name: '用户管理',
          icon: 'UserOutlined',
          children: [
            { path: '/user/list', name: '用户列表' },
            { path: '/user/role', name: '角色管理' },
          ],
        },
      ],
    }),
  },
] as MockMethod[];
