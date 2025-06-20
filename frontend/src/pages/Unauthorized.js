// frontend/src/pages/Unauthorized.js
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <Container className="text-center py-5">
      <h1>401 - Unauthorized</h1>
      <p>You don't have permission to access this page.</p>
      <Button as={Link} to="/" variant="primary">
        Go to Home
      </Button>
    </Container>
  );
};

export default Unauthorized;