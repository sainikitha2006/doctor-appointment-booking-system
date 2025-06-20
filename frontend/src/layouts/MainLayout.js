// frontend/src/layouts/MainLayout.js
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Container className="py-4">
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;