import { useState } from 'react'
import { Outlet } from "react-router-dom";
import Footer from './components/Common/Footer';
import Header from './components/Common/Header';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (<>
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Make sure main expands to fill space */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
    </>
  );
}




export default App