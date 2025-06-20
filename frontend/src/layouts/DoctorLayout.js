// frontend/src/layouts/DoctorLayout.js
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import { useState, useEffect } from 'react';

const DoctorLayout = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Container fluid className="p-0">
        <Row className="g-0">
          <Col md={3} lg={2} className="position-fixed h-100">
            <DoctorSidebar />
          </Col>
          <Col md={9} lg={10} className="ms-auto">
            <main className="p-4" style={{ minHeight: '100vh' }}>
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Outlet />
              )}
            </main>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DoctorLayout;