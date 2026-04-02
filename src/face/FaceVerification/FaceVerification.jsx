import React, { useState, useRef, useEffect, useCallback } from 'react';
import './FaceVerification.css';

const FACE_API_URL = 'http://localhost:5000';

const FaceVerification = ({ onVerified, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, scanning, success, error
  const [message, setMessage] = useState('Đang khởi động camera... Vui lòng cấp quyền khi được hỏi');
  const [attempts, setAttempts] = useState(0);
  const [serverOnline, setServerOnline] = useState(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  // Kiểm tra server và tự động bật camera
  useEffect(() => {
    initializeVerification();
    return cleanup;
  }, []);

  const initializeVerification = async () => {
    try {
      const response = await fetch(`${FACE_API_URL}/health`, {
        timeout: 5000
      });
      
      if (!response.ok) {
        setServerOnline(false);
        setStatus('error');
        setMessage('❌ Không thể kết nối đến server. Vui lòng khởi động Python server.');
        return;
      }
      
      setServerOnline(true);
      await autoStartCamera();
    } catch (error) {
      setServerOnline(false);
      setStatus('error');
      setMessage('❌ Lỗi kết nối: ' + (error.message || 'Server Python không phản hồi'));
    }
  };

  const cleanup = () => {
    stopCamera();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Đợi video có sẵn trước khi bắt đầu quét
        return new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            resolve(true);
          };
        });
      }
      return true;
    } catch (err) {
      setStatus('error');
      
      if (err.name === 'NotAllowedError') {
        setMessage('❌ Camera bị từ chối. Vui lòng cấp quyền truy cập camera.');
      } else if (err.name === 'NotFoundError') {
        setMessage('❌ Không tìm thấy camera. Vui lòng kiểm tra thiết bị.');
      } else {
        setMessage('❌ Lỗi kamera: ' + err.message);
      }
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw with mirror effect
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (err) {
      console.error('Frame capture error:', err);
      return null;
    }
  }, []);

  const verifyFace = useCallback(async () => {
    const imageData = captureFrame();
    if (!imageData) {
      setMessage('❌ Lỗi chụp ảnh. Vui lòng thử lại.');
      return;
    }

    try {
      const response = await fetch(`${FACE_API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.verified) {
        handleVerificationSuccess(result);
      } else {
        handleVerificationFailure();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('❌ Lỗi xác thực: ' + error.message);
      setStatus('error');
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [captureFrame]);

  const handleVerificationSuccess = (result) => {
    setStatus('success');
    setMessage(`✅ Chào ${result.name}! Xác thực thành công (${result.confidence.toFixed(1)}%)`);
    stopCamera();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Lưu trạng thái xác thực
    sessionStorage.setItem('faceVerified', 'true');
    sessionStorage.setItem('faceVerifiedAt', new Date().toISOString());
    sessionStorage.setItem('faceVerifiedUser', result.name);

    setTimeout(() => {
      onVerified && onVerified(result);
    }, 1500);
  };

  const handleVerificationFailure = () => {
    setAttempts(prev => {
      const newAttempts = prev + 1;
      
      if (newAttempts >= 5) {
        setStatus('error');
        setMessage('❌ Quá nhiều lần thất bại. Vui lòng đóng và thử lại sau.');
        stopCamera();
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setMessage(`⚠️ Khuôn mặt không khớp. Thử lại... (${newAttempts}/5)`);
      }
      
      return newAttempts;
    });
  };

  const autoStartCamera = async () => {
    setStatus('scanning');
    setMessage('Đang cấp quyền camera... Vui lòng chờ');
    setAttempts(0);

    const started = await startCamera();
    if (!started) {
      return;
    }

    setIsCapturing(true);
    setMessage('📹 Đang quét khuôn mặt... Vui lòng nhìn vào camera');

    // Bắt đầu quét mỗi 1 giây
    intervalRef.current = setInterval(() => {
      verifyFace();
    }, 1000);
  };

  const handleRetry = async () => {
    if (status === 'error' && serverOnline === false) {
      setMessage('⏳ Đang kết nối lại server...');
      await initializeVerification();
    } else {
      await autoStartCamera();
    }
  };

  const handleCancel = () => {
    cleanup();
    onCancel && onCancel();
  };

  return (
    <div className="face-verification-overlay">
      <div className="face-verification-modal">
        {/* Header */}
        <div className="face-verification-header">
          <span className="face-verification-icon">🔐</span>
          <h2>Xác thực Khuôn mặt</h2>
          <p className="face-verification-subtitle">
            Bảo mật 2 lớp - Chỉ Admin được cấp quyền mới có thể truy cập
          </p>
        </div>

        {/* Status Message */}
        <div className={`face-verification-status status-${status}`}>
          {message}
        </div>

        {/* Video Container */}
        <div className="face-verification-video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`face-verification-video ${isCapturing ? 'active' : ''}`}
          />
          
          {!isCapturing && (
            <div className="face-verification-placeholder">
              <div className="face-icon">👤</div>
              <p>Camera đang tắt</p>
            </div>
          )}

          {/* Scanning Animation */}
          {status === 'scanning' && isCapturing && (
            <div className="face-scanning-indicator">
              <div className="scanning-line"></div>
              <div className="scanning-corner top-left"></div>
              <div className="scanning-corner top-right"></div>
              <div className="scanning-corner bottom-left"></div>
              <div className="scanning-corner bottom-right"></div>
            </div>
          )}
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Action Buttons */}
        <div className="face-verification-actions">
          {status === 'scanning' ? (
            <button className="btn-face-scanning" disabled>
              <span className="spinner"></span>
              Đang quét...
            </button>
          ) : status === 'success' ? (
            <button className="btn-face-success" disabled>
              ✓ Đã xác thực
            </button>
          ) : (
            <button
              className="btn-face-start"
              onClick={handleRetry}
              disabled={serverOnline === false}
            >
              {status === 'error' ? '🔄 Thử lại' : '▶ Bắt đầu'}
            </button>
          )}

          <button className="btn-face-cancel" onClick={handleCancel}>
            ✕ Hủy bỏ
          </button>
        </div>

        {/* Footer */}
        <div className="face-verification-footer">
          <div className="server-status">
            <span className={`status-indicator ${serverOnline === true ? 'online' : 'offline'}`}></span>
            <span>
              {serverOnline === true ? 'Server kết nối' : 'Server ngắt kết nối'}
            </span>
          </div>
          <p>Yêu cầu: Python server chạy với file face_embeddings.npz</p>
        </div>
      </div>
    </div>
  );
};

export default FaceVerification;