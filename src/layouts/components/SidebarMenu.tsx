import { Menu, MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { get } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { iconMap } from '@/components/icons/DynamicIcon';
//import weblogo from '@/img/logo.png';
const weblogo =import.meta.env.VITE_STATIC_URL + "/logo.png";
interface MenuItemType {
  path: string;
  name: string;
  icon: any;
  children?: MenuItemType[];
  className?: string;
  description?: string;
  source?: string;
}
const CustomMenuItem = ({ item }: { item: MenuItemType }) => {
  return (
    <div className="flex flex-col w-full py-1">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-gray-600">{item.name}</span>
      </div>
      {/* {item.description && (
        <div className="text-xs text-gray-400 mt-0.5 leading-tight">
          {item.description}
        </div>
      )} */}
    </div>
  );
};

// const menuItems: MenuItemType[] = [
//   { path: '/dashboard/Dashboard', name: '仪表盘', icon: LayoutDashboard, },

//   {
//     path: 'standards',
//     name: '领域标准',
//     icon: Settings,
//     children: [
//       { path: '/standards/StandardGrading', name: '分级标准', icon: Network, },
//       { path: '/standards/MappingConstruction', name: '构建映射', icon: GitPullRequestCreate },
//       { path: '/standards/StandardsCreation', name: '撰写标准', icon: Plus, },
//       { path: '/standards/StandardsSearch', name: '标准检索', icon: Search, },
//     ]
//   },
//   {
//     path: 'standardsReview',
//     name: '标准审查',
//     icon: FileText,
//     children: [
//       { path: '/standardsReview/InternalReview', name: '内部审查', icon: User, },
//       { path: '/standardsReview/ExpertReviewSystem', name: '行业专家审查', icon: Layers, },
//       { path: '/standardsReview/StandardRevision', name: '标准修订', icon: Edit },
//       { path: '/standardsReview/ReviewRecords', name: '审查记录', icon: ClipboardList },
//       { path: '/standardsReview/RevisionRecords', name: '修订记录', icon: FileEdit },
//     ]
//   },

// ];

const renderMenuItems = (items: any): MenuProps['items'] => {
  return items.map((item: any) => ({
    key: item.path,
    icon: React.createElement(
      iconMap[item.source] || (item.source ? React.createElement(item.source) : null),
      { size: 16 }
    ),
    label: <CustomMenuItem item={item} />,
    children: item.children.length > 0 ? renderMenuItems(item.children) : undefined,
  }));
};
export default function SiderbarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppSelector((state) => get(state, 'app.sidebarCollapsed', false));
  const menu: MenuItemType[] = useAppSelector((state) => get(state, 'menu.menuList', []));
  const dispatch = useAppDispatch();
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  // 页面加载/路由变化时自动展开对应菜单
  useEffect(() => {
    // 渲染菜单列表
    const menuList = menu;
    const pathname = location.pathname;
    // 如果是登录后进入根路径 / 或者空白，就自动跳转到你指定的页面
    if (pathname === '/' || pathname === '') {
      if (menuList.length > 0 && (!menuList[0].children || menuList[0].children.length == 0)) {
        navigate(menuList[0].path);
      }
      if (menuList.length > 0 && menuList[0].children && menuList[0].children.length > 0) {
        navigate(menuList[0].children[0].path);
        onOpenChange([menuList[0].path])
      }
    }
  }, [location.pathname, menu]);
  // useEffect(() => {
  //   try {
  //     http.get('/menu').then((res: any) => {
  //       if (res && res.length) {
  //         dispatch({ type: 'menu/setMenu', payload: res })
  //       } else {
  //         console.log('Using default menu items')
  //         dispatch({ type: 'menu/setMenu', payload: menuItems })
  //       }
  //     })
  //   } catch (error) {
  //     console.log('Using default menu items')
  //   }
  //   dispatch({ type: 'menu/setMenu', payload: menuItems })
  // }, [])

  // const iconMap: Record<string, any> = {
  //   DashboardOutlined: <AppstoreOutlined />,
  //   UserOutlined: <UserOutlined />,
  // }

  // const renderMenu = (items: any[]): any => {
  //   return items.map((item) => ({
  //     key: item.path || item.path,
  //     icon: iconMap[item.source] || (item.source ? React.createElement(item.source) : null),
  //     label: item.name || item.name,
  //     children: item.children ? renderMenu(item.children) : undefined,
  //   }))
  // }

  const toggleCollapsed = () => {
    console.log('collapsed', collapsed);
    dispatch({ type: 'app/toggleSidebar', payload: !collapsed });
  };
  const onOpenChange = (keys: any) => {
    // 如果当前有展开的菜单，且点击的是新的菜单
    if (openKeys.length > 0 && keys.length > 0) {
      const lastOpenKey = openKeys[openKeys.length - 1];
      const currentOpenKey = keys[keys.length - 1];

      // 如果点击的是不同的父菜单，则关闭所有其他菜单
      if (lastOpenKey !== currentOpenKey) {
        setOpenKeys([currentOpenKey]);
      } else {
        setOpenKeys(keys);
      }
    } else {
      setOpenKeys(keys);
    }
  }

  return (
    <div className="relative">
      <div className="absolute -right-3 top-6 z-50">
        <button
          onClick={toggleCollapsed}
          className="w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-slate-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-slate-600" />
          )}
        </button>
      </div>
      <div className="p-6 border-slate-200 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8  flex items-center justify-center">
            <img src={weblogo} />
          </div>
          {!collapsed && <h1 className="text-xl font-bold text-slate-800">职业领域管理系统</h1>}
        </div>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={renderMenuItems(menu)}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        onClick={({ key }) => navigate(key)}
        className="gradient-menu"
        defaultSelectedKeys={['/dashboard/Dashboard']}

      />
    </div>
  );
}
