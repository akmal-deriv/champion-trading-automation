import { Menu } from 'antd';
import { 
  AppstoreOutlined, 
  HistoryOutlined,
  SnippetsOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { useNavigation } from '../../contexts/NavigationContext';
import type { NavigationTab } from '../../contexts/NavigationContext';
import './styles.scss';

const menuItems = [
  {
    key: 'strategies',
    icon: <AppstoreOutlined />,
    label: 'Strategies',
  },
  {
    key: 'trade-logs',
    icon: <HistoryOutlined />,
    label: 'Positions',
  },
  {
    key: 'templates',
    icon: <SnippetsOutlined />,
    label: 'Templates',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  }
];

export function Navigation() {
  const { activeTab, setActiveTab } = useNavigation();

  return (
    <div className="app-navigation">
      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        items={menuItems}
        className="app-navigation__menu"
        onClick={({ key }) => setActiveTab(key as NavigationTab)}
      />
    </div>
  );
}
