// frontend/src/pages/PageNotFound.js
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <Container className="text-center py-5">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <Button as={Link} to="/" variant="primary">
        Go to Home
      </Button>
    </Container>
  );
};

export default PageNotFound;