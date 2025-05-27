import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navigation: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Robokki</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/assistants"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                {t('navigation.assistants')}
              </Link>
              <Link
                to="/documents"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                {t('navigation.documents')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 