import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import './NotificationModal.css';

const CONFIG = {
    success: { Icon: CheckCircle2 },
    error:   { Icon: XCircle      },
    info:    { Icon: Info         },
    warning: { Icon: AlertTriangle},
};

const NotificationModal = ({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'Xác nhận' }) => {
    // phase: 'closed' | 'opening' | 'open' | 'closing'
    const [phase, setPhase] = useState('closed');
    const timerRef = useRef(null);

    useEffect(() => {
        clearTimeout(timerRef.current);

        if (isOpen) {
            setPhase('opening');
            // Double rAF: paint invisible frame first, then trigger transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setPhase('open'));
            });
        } else if (phase !== 'closed') {
            setPhase('closing');
            timerRef.current = setTimeout(() => setPhase('closed'), 280);
        }

        return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (phase === 'closed') return null;

    const { Icon } = CONFIG[type] || CONFIG.info;

    const handleClose = () => {
        if (phase !== 'open') return;
        onClose?.();
    };

    return (
        <div
            className={`notif-overlay notif-overlay--${phase}`}
            onClick={handleClose}
        >
            <div
                className={`notif-card notif-${type} notif-card--${phase}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="notif-title"
            >
                {/* Accent bar */}
                <div className="notif-top-bar" />

                <div className="notif-header">
                    <div className="notif-icon-ring">
                        <Icon className={`notif-icon notif-icon--${phase}`} strokeWidth={2.2} />
                    </div>
                    <div className="notif-title-wrap">
                        <h3 className="notif-title" id="notif-title">{title}</h3>
                    </div>
                    <button className="notif-close-btn" onClick={handleClose} aria-label="Đóng">
                        <X size={16} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="notif-body">
                    <p>{message}</p>
                </div>

                <div className="notif-footer" style={{ gap: '10px', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    {onConfirm ? (
                        <>
                            <button className="notif-cancel-btn" onClick={handleClose}>Hủy</button>
                            <button className="notif-btn" onClick={() => { if (phase === 'open') onConfirm(); }}>{confirmText}</button>
                        </>
                    ) : (
                        <button className="notif-btn" onClick={handleClose}>Đóng</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;