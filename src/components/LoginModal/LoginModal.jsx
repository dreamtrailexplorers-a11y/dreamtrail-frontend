import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCompass } from 'react-icons/fi';
import styles from './LoginModal.module.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setMobile('');
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (mobile.length === 10) {
      setStep('otp');
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    console.log("OTP Submitted: ", otp.join(''));
    // Close modal after success
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <FiX size={24} />
        </button>

        <div className={styles.logoContainer}>
          <img src="/logo.png" alt="DreamTrail Logo" style={{ height: '70px', width: 'auto' }} />
        </div>

        {step === 'phone' ? (
          <div className={styles.stepContent}>
            <div className={styles.welcomeText}>
              <p>Welcome to</p>
              <h2>DreamTrail Experiences</h2>
            </div>

            <div className={styles.divider}>
              <span>Log in or Sign up</span>
            </div>

            <form onSubmit={handlePhoneSubmit} className={styles.form}>
              <div className={styles.phoneInputContainer}>
                <span className={styles.countryCode}>+91</span>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className={styles.phoneInput}
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={mobile.length !== 10}
              >
                Continue
              </button>
            </form>

            <div className={styles.footerText}>
              <p>By continuing, you agree to our</p>
              <p>
                <a href="#">Terms & Conditions</a> &nbsp; <a href="#">Privacy Policy</a>
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.stepContent}>
            <div className={styles.welcomeText}>
              <p>We have sent a verification code to</p>
              <h3 className={styles.sentNumber}>+91-{mobile}</h3>
            </div>

            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <div className={styles.otpContainer}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    maxLength="1"
                    className={styles.otpInput}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={otp.some(digit => digit === '')}
              >
                Submit
              </button>
            </form>

            <div className={styles.resendText}>
              Didn't get the OTP? <span>Resend in 34s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
