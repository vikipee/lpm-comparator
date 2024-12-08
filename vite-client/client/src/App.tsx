import './App.css'
import Main from './pages/Main'
import Footer from './pages/Footer'
import Header from './pages/Header'
import { Toaster } from '@/components/ui/toaster'

function App() {
  

  return (
    <>
    <div className='bg-gray-100'>
      {/*<Header />*/}
      <Main />  
      {/*<Footer />*/}
    </div>
    <Toaster />
     </>
  )
}

export default App
