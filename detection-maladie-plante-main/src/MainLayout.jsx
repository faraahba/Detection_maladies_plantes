import React, { useEffect, useState } from 'react';
import { Clock, Menu, X } from 'lucide-react';

const MainLayout = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="bg-green-600 text-white p-4 shadow-md relative z-10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">Plantify</div>
            <div className="hidden md:flex items-center">
              <Clock className="mr-2" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <button 
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          
          <div className={`
            md:flex md:justify-center md:mt-1
            ${isMenuOpen ? 'block' : 'hidden'}
          `}>
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-2 md:space-y-0 mt-4 md:mt-0">
              <a 
                href="/" 
                className="hover:text-green-200 transition-colors duration-200"
              >
                Home
              </a>
              <a 
                href="/PredictManual" 
                className="hover:text-green-200 transition-colors duration-200"
              >
                Predict
              </a>
              <a 
                href="/Historique" 
                className="hover:text-green-200 transition-colors duration-200"
              >
                History
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </>
  );
};

export default MainLayout;