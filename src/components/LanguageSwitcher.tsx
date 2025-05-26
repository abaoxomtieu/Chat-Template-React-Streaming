import React from 'react';
import { Button, Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const items = [
    {
      key: 'en',
      label: 'English',
      onClick: () => i18n.changeLanguage('en'),
    },
    {
      key: 'vi',
      label: 'Tiếng Việt',
      onClick: () => i18n.changeLanguage('vi'),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="flex items-center"
      >
        {i18n.language === 'en' ? 'EN' : 'VI'}
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher; 