import { ToastContainer } from 'react-toastify';
import TokenTransfer from '@/components/TokenTransfer';
import Layout from '@/components/Layout';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <Layout>
      <div className="w-full flex justify-center">
        <TokenTransfer />
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Layout>
  );
} 