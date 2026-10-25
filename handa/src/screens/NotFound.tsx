import { Link } from 'react-router-dom';
import { Empty, Button } from '@/ui';
export default function NotFound() {
  return (
    <div className="page">
      <Empty icon="map" title="404" body="This page is not in the house." action={<Link to="/"><Button variant="primary">Home</Button></Link>} />
    </div>
  );
}
