import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import FaceVerification from '@face/FaceVerification/FaceVerification';
import './FaceGuard.css';

/**
 * FaceGuard - Route wrapper yêu cầu xác thực khuôn mặt trước khi vào
 * Lưu ý: Kiểm tra bổ sung, không thay thế PrivateRoute
 * 
 * Features:
 * - Session-based verification (30 minutes timeout)
 * - User identity validation
 * - Beautiful loading state
 * - Seamless error handling
 */
const FaceGuard = ({ children }) => {
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
    const currentUserName = loggedInUser.fullName || loggedInUser.username;

    const faceVerified = sessionStorage.getItem('faceVerified');
    const verifiedAt = sessionStorage.getItem('faceVerifiedAt');
    const faceVerifiedUser = sessionStorage.getItem('faceVerifiedUser');
    
    const isVerificationValid = 
      faceVerified === 'true' && 
      verifiedAt && 
      faceVerifiedUser === currentUserName;

    if (isVerificationValid) {
      const verifiedTime = new Date(verifiedAt).getTime();
      const now = new Date().getTime();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now - verifiedTime < thirtyMinutes) {
        setIsVerified(true);
        setIsChecking(false);
        return;
      } else {
        clearFaceSession();
      }
    } else if (faceVerified === 'true') {
      clearFaceSession();
    }
    
    setShowVerification(true);
    setIsChecking(false);
  };

  const clearFaceSession = () => {
    sessionStorage.removeItem('faceVerified');
    sessionStorage.removeItem('faceVerifiedAt');
    sessionStorage.removeItem('faceVerifiedUser');
  };

  const handleVerified = (result) => {
    setIsVerified(true);
    setShowVerification(false);
    console.log('✅ Face verification passed:', result);
  };

  const handleCancel = () => {
    setShowVerification(false);
  };

  // Loading state
  if (isChecking) {
    return (
      <div className="face-guard-loading">
        <div className="face-guard-loading-icon">🔐</div>
        <div className="spinner"></div>
        <p>Đang kiểm tra bảo mật...</p>
      </div>
    );
  }

  // Verification required
  if (!isVerified && showVerification) {
    return (
      <FaceVerification 
        onVerified={handleVerified} 
        onCancel={handleCancel}
      />
    );
  }

  // User cancelled verification
  if (!isVerified && !showVerification) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  // Verified - render protected content
  return children;
};

export default FaceGuard;