import NotFoundPage from './NotFoundPage';

export default function ForbiddenPage() {
  return <NotFoundPage code={403} message="You do not have permission to view this page" />;
}
