import { useState } from 'react'
import RegistrationForm  from "./components/RegistrationForm";
import Checkout from "./pages/Checkout";



function App() {
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <div>
      {!showCheckout ? (
        <RegistrationForm
          onRegistered={() => setShowCheckout(true)}
        />
      ) : (
        <Checkout />
      )}
    </div>
  );
}

export default App;
