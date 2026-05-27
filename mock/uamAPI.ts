/**
 * UAM API mock — 本地开发用，绕过远程 UAM 认证跳转。
 *
 * 作用：
 * 1. bu-origin-url 返回空列表，阻止 buOriginByCode 被填入远程 URL
 *    → getUamUrl() 会 fallback 到 localhost:9999（isLocalhost 分支），而非 dev.hades
 * 2. user/info 返回 mock 用户，让 getInitialState() 认为已登录
 * 3. 同时设置 dev_uam_token cookie，阻止 onPageChange 触发 redirect
 */

const MOCK_TOKEN = 'mock-local-dev-token';

const mockUser = {
  id: 1,
  email: 'dev@inteluck.com',
  name: 'Local Dev',
  aliasName: 'Dev',
  avatar: '',
  slackMemberId: '',
  status: 'ACTIVE',
  currentUserRole: {
    roleId: 1,
    userRoleId: 1,
    roleName: 'Admin',
    dataPermissionType: 'ALL',
    parentRoleId: 0,
    buId: 1,
    buName: 'TMS',
    buType: 'TMS',
    regionId: 10002, // Philippines
    regionName: 'Philippines',
  },
  roleList: [
    {
      roleId: 1,
      userRoleId: 1,
      roleName: 'Admin',
      dataPermissionType: 'ALL',
      parentRoleId: 0,
      buId: 1,
      buName: 'TMS',
      buType: 'TMS',
      regionId: 10002,
      regionName: 'Philippines',
    },
  ],
  elementNameList: [],
  userGuidanceMap: {
    ExportDownloadManage: true,
  },
};

export default {
  'POST /uam-api/auth/bu-origin-url': (req: any, res: any) => {
    // 返回空列表，让前端 fallback 到 isLocalhost() 逻辑
    res.json({ code: 200, msg: 'success', data: [] });
  },

  'GET /uam-api/user/info': (req: any, res: any) => {
    // 设置 token cookie，阻止 onPageChange redirect
    res.cookie('dev_uam_token', MOCK_TOKEN, {
      path: '/',
      httpOnly: false,
    });
    res.json({ code: 200, msg: 'success', data: mockUser });
  },

  'POST /uam-api/user/logout': (req: any, res: any) => {
    res.clearCookie('dev_uam_token');
    res.json({ code: 200, msg: 'success', data: null });
  },

  'GET /uam-api/user-guidance/update': (req: any, res: any) => {
    res.json({ code: 200, msg: 'success', data: null });
  },

  'POST /uam-api/export-download-manage/latest-list': (req: any, res: any) => {
    res.json({ code: 200, msg: 'success', data: [] });
  },
};
