import React from 'react'
import Footer from './Footer'
import Navbar from './Navbar'
import { useAuth } from '../../context/AuthContext'
import Login from '../../pages/Auth/Login'
import Signup from '../../pages/Auth/Signup'
import WhatsAppModal from '../modal/WhatsAppModal'

function Layout({ children }) {
  const { isLoginOpen, isSignupOpen } = useAuth()

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text-base transition-colors duration-300">
      <Navbar />

      <main className="flex-grow px-1 sm:px-4 md:px-6 lg:px-10 xl:px-20 pt-20 sm:pt-13 pb-24 lg:pb-10">
        {children}
      </main>

      <Footer />

      {/* Global WhatsApp Floating Widget & Modal */}
      <WhatsAppModal />

      {/* Global Auth Popup Modals */}
      {isLoginOpen && <Login />}
      {isSignupOpen && <Signup />}
    </div>
  )
}

export default Layout
