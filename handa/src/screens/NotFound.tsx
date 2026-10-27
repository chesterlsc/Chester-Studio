import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Empty, Button } from '@/ui';
export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="page">
      <Empty icon="map" title={t('notFound.title')} body={t('notFound.body')} action={<Link to="/"><Button variant="primary" icon="home">{t('notFound.home')}</Button></Link>} />
    </div>
  );
}
