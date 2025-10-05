import { useState, useEffect } from 'react';

const useTermsAccepted = () => {
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  useEffect(() => {
    const storedValue = localStorage.getItem('termsAccepted');
    
    if (storedValue === null) {
      localStorage.setItem('termsAccepted', JSON.stringify(false));
      setTermsAccepted(false);
    } else {
      setTermsAccepted(JSON.parse(storedValue));
    }
  }, []);

  const toggleTerms = () => {
    const newValue = !termsAccepted;
    setTermsAccepted(newValue);
    localStorage.setItem('termsAccepted', JSON.stringify(newValue));
    
    window.dispatchEvent(new Event('storage'));
  };

  const setTerms = (value: boolean) => {
    setTermsAccepted(value);
    localStorage.setItem('termsAccepted', JSON.stringify(value));
    window.dispatchEvent(new Event('storage'));
  };

  return { termsAccepted, toggleTerms, setTerms };
};

export default useTermsAccepted;