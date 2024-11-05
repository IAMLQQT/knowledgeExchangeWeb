import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../scss/VerificationPage.scss';

function VerificationPage() {
  const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // Trạng thái xác minh
  const [message, setMessage] = useState(''); // Thông báo
  const [loading, setLoading] = useState(true); // Trạng thái loading
    useEffect(() => {
      // Gửi yêu cầu xác minh token
      const verifyAccount = async () => {
        
        try {         
          const response = await axios.post(SERVER_DOMAIN + "/user/verifyaccount/" + token);
          console.log(response);
          setStatus('success');
          setMessage('Congratulations on your successful confirmation! Please check your mail for the email and password you will use to log in to the website.');
          return;
        } catch (error) {
          if (error.response && error.response.status === 400) {
            setStatus('expired');
            setMessage('The verification code has expired. Please click the resend verification email button below..');
          } else {
            setStatus('error');
            setMessage('An error occurred during verification. Please try again later.');
          }
        } finally {
          setLoading(false);
        }
      };
      verifyAccount();
    }, [token]);

  //   // Gửi yêu cầu gửi lại link xác minh
  //   const resendVerificationLink = async () => {
  //     try {
  //       setLoading(true);
  //       await axios.post(`/api/resendVerificationLink`, { token });
  //       setMessage('Link xác minh mới đã được gửi đến email của bạn.');
  //     } catch (error) {
  //       setMessage('Không thể gửi lại link xác minh. Vui lòng thử lại sau.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  if (loading) return <div className="verification-page">Đang xác minh...</div>;

  return (
    <div className="container">
      <div className="verification-page flex a-center j-center ">
        <div className="logo flex a-center j-center">
          <button onClick={() => navigate('/')}>
            <img  className="logo-school" src="\public\logo.png" alt="Logo" />
          </button>
          <h1>PTIT Student Infomation Exchange</h1>
        </div>

        {status === 'success' && (
          <div className="message success flex a-center j-center">
            <img className='verifysusscess' src="\public\verifysusscess.jpg" alt="" />
            <h3>Your email has been verified successfully</h3>
            {message}
            <button onClick={() => navigate('/login')}>Return Login</button>
          </div>
        )}
        {status === 'expired' && (
          <div className="message expired flex a-center j-center">
            <img className='verifyfailed' src="\public\verifyfailed.jpg" alt="" />
            <h3>Your email verification failed.</h3>
            {message}
            <button >Resend Verification Email</button>
          </div>
        )}
        {status === 'error' && (
        <div className="message error flex a-center j-center">
          {message}
          <button onClick={() => navigate('/')}>Return HomePage</button>
        </div>
      )}
      </div>
    </div>

  );
};

export default VerificationPage;
