import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import AdminPagination from "@shared/components/Admin/AdminPagination";
import { useNotification } from "@shared/notification";
import {
    Search,
    Filter,
    CheckCircle2,
    Clock,
    XCircle,
    Banknote,
    ArrowUpDown,
    RefreshCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Eye,
    Printer,
    FileText,
    Mail,
    Phone,
    Users,
    Activity,
    TrendingUp,
    Calendar,
    User
} from "lucide-react";

export default function AdminRegistrations() {
    const { confirm, success, error: notifyError, warning } = useNotification();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [bankInfo, setBankInfo] = useState(null);
    const [confirming, setConfirming] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "registrationDate", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [transferRefSearch, setTransferRefSearch] = useState("");
    const [transferRefResult, setTransferRefResult] = useState(null);
    const [transferChecking, setTransferChecking] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        fetchAll();
        fetchBankInfo();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await registrationService.getAllRegistrations();
            setRegistrations(res.data?.data || []);
        } catch (err) {
            console.error(err);
            notifyError("Không thể tải danh sách đăng ký");
        } finally {
            setLoading(false);
        }
    };

    const fetchBankInfo = async () => {
        try {
            const res = await registrationService.getBankInfo();
            setBankInfo(res.data?.data || null);
        } catch (err) {
            console.error("Không thể tải thông tin ngân hàng");
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await registrationService.exportExcel();
            // Handle blob download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'registrations.xls');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export Excel failed:", err);
            error("Không thể xuất file Excel");
        }
    };

    const handlePrintInvoice = async (id) => {
        try {
            const response = await registrationService.exportPdf(id);
            // Handle blob download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export PDF failed:", err);
            error("Không thể xuất hóa đơn PDF");
        }
    };

    const handleCheckTransferRef = async () => {
        const code = transferRefSearch.trim();
        if (!code) {
            setTransferRefResult(null);
            return;
        }
        setTransferChecking(true);
        setTransferRefResult(null);
        try {
            const response = await registrationService.getByTransferRef(code);
            const registration = response.data?.data;
            setTransferRefResult({
                success: true,
                registration,
                message: registration
                    ? `Tìm thấy #${registration.id} • ${registration.studentName} (${registration.courseTitle})`
                    : "Đã tìm thấy giao dịch."
            });
        } catch (err) {
            setTransferRefResult({
                success: false,
                message: err.response?.data?.data || "Không tìm thấy mã chuyển khoản."
            });
        } finally {
            setTransferChecking(false);
        }
    };

    const handleConfirmRefund = async (registration) => {
        const isConfirmed = await confirm({
            title: "Xác nhận hoàn tiền",
            message: `Đã đối chiếu mã ${registration.transferRef} chưa?\nXác nhận hoàn tiền cho ${registration.studentName}?`,
            type: "warning",
            confirmText: "Xác nhận",
            cancelText: "Hủy"
        });
        if (!isConfirmed) return;

        try {
            setLoading(true);
            await registrationService.confirmRefund(registration.id);
            success(`Hoàn tiền cho ${registration.studentName} đã được xác nhận.`);
            setTransferRefResult(null);
            setSelectedDetail(null);
            fetchAll();
        } catch (err) {
            notifyError(err.response?.data?.data || "Không thể xác nhận hoàn tiền.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (registration) => {
        if (!registration.paymentSubmitted) {
            warning("Sinh viên chưa báo đã chuyển khoản. Vui lòng chờ họ gửi thông tin.");
            return;
        }
        setConfirming(registration.id);
        try {
            const response = await registrationService.confirmPayment(registration.id);
            const enrolledClassName = response.data?.data?.enrolledClassName;
            success(
                enrolledClassName
                    ? `Đã xác nhận thanh toán và thêm sinh viên vào lớp "${enrolledClassName}".`
                    : "Đã xác nhận thanh toán. Không tìm thấy lớp học nào cho khóa học này."
            );
            fetchAll();
        } catch (err) {
            notifyError(err.response?.data?.data || "Không thể xác nhận thanh toán.");
        } finally {
            setConfirming(null);
        }
    };

    const handleBulkConfirm = async () => {
        if (selectedRows.length === 0) return;

        const isConfirmed = await confirm({
            title: "Xác nhận thanh toán hàng loạt",
            message: `Xác nhận ${selectedRows.length} khoản thanh toán đã chọn?`,
            type: "warning",
            confirmText: "Xác nhận",
            cancelText: "Hủy"
        });
        if (!isConfirmed) return;

        try {
            setLoading(true);
            await registrationService.confirmBulkPayment(selectedRows);
            success(`Đã xác nhận thanh toán cho ${selectedRows.length} bản ghi.`);
            setSelectedRows([]);
            fetchAll();
        } catch (err) {
            notifyError(err.response?.data?.data || "Không thể xác nhận thanh toán hàng loạt.");
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
        });
    };

    const formatAmount = (amt) => new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
    }).format(amt || 0);

    const formatDate = (dt) => {
        if (!dt) return "—";
        const date = new Date(dt);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatRefundDate = (dt) => {
        if (!dt) return "—";
        return new Date(dt).toLocaleDateString("vi-VN");
    };

    const formatPaymentStatusLabel = (status) => {
        switch (status) {
            case "PENDING":
                return "⏳ Chờ xác nhận";
            case "PAID":
                return "✓ Đã thanh toán";
            case "REFUND_REQUESTED":
                return "⌛ Yêu cầu hoàn tiền";
            case "REFUNDED":
                return "💸 Đã hoàn tiền";
            case "CANCELLED":
                return "✗ Đã hủy";
            default:
                return status || "—";
        }
    };

    const canConfirmRefundFromTransfer = (registration) =>
        registration?.paymentStatus === "REFUND_REQUESTED"
        && registration?.refundRequested
        && !registration?.refundConfirmed;

    // Filter và sort
    const filtered = registrations
        .filter(r => {
            const matchStatus = filter === "ALL" || r.paymentStatus === filter;
            const q = search.toLowerCase();
            const matchSearch = !q ||
                (r.studentName || "").toLowerCase().includes(q) ||
                (r.courseTitle || "").toLowerCase().includes(q) ||
                (r.transferRef || "").toLowerCase().includes(q) ||
                (r.studentEmail || "").toLowerCase().includes(q) ||
                (r.studentPhone || "").includes(q);
            return matchStatus && matchSearch;
        })
        .sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === "amount") {
                aVal = a.amount || 0;
                bVal = b.amount || 0;
            }

            if (sortConfig.key === "registrationDate" || sortConfig.key === "paymentDate") {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });

    // Pagination
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginatedData = filtered.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Stats
    const stats = {
        total: registrations.length,
        pending: registrations.filter(r => r.paymentStatus === "PENDING").length,
        paid: registrations.filter(r => r.paymentStatus === "PAID").length,
        cancelled: registrations.filter(r => r.paymentStatus === "CANCELLED").length,
        totalAmount: registrations
            .filter(r => r.paymentStatus === "PAID")
            .reduce((sum, r) => sum + (r.amount || 0), 0),
        refundRequests: registrations.filter(r => r.refundRequested).length,
        refundConfirmed: registrations.filter(r => r.refundConfirmed).length
    };

    const toggleRowSelection = (id) => {
        setSelectedRows(prev =>
            prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    const toggleAllRows = () => {
        if (selectedRows.length === paginatedData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedData.map(r => r.id));
        }
    };

    const renderDetailModal = () => {
        if (!selectedDetail) return null;
        const r = selectedDetail;

        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.2s ease'
            }} onClick={() => setSelectedDetail(null)}>
                <div style={{
                    width: '90%',
                    maxWidth: 500,
                    background: 'white',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    animation: 'slideUp 0.3s ease-out'
                }} onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: 'white',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={() => setSelectedDetail(null)}
                            style={{
                                position: 'absolute',
                                right: 16,
                                top: 16,
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18
                            }}
                        >×</button>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Chi tiết đăng ký</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: 13, opacity: 0.9 }}>ID: #{r.id}</p>
                    </div>

                    <div style={{ padding: '24px' }}>
                        {/* Student Section */}
                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Thông tin sinh viên</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={18} />
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{r.studentName}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail size={18} />
                                    </div>
                                    <div style={{ fontSize: 14, color: '#4b5563' }}>{r.studentEmail}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone size={18} />
                                    </div>
                                    <div style={{ fontSize: 14, color: '#4b5563' }}>{r.studentPhone || "N/A"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Order & Payment Section */}
                        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20 }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Khóa học & Thanh toán</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>KHÓA HỌC</p>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{r.courseTitle}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>HỌC PHÍ</p>
                                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#ea580c' }}>{formatAmount(r.amount)}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>MÃ CHUYỂN KHOẢN</p>
                                    <p style={{ margin: 0, fontSize: 14, fontFamily: 'monospace', fontWeight: 600 }}>{r.transferRef || "—"}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>TRẠNG THÁI</p>
                                    <span style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: r.paymentStatus === "PAID" ? '#059669' : r.paymentStatus === "PENDING" ? '#d97706' : '#dc2626'
                                    }}>
                                        {r.paymentStatus === "PAID" ? "✓ ĐÃ THANH TOÁN" : r.paymentStatus === "PENDING" ? "⏳ CHỜ XÁC NHẬN" : "✗ ĐÃ HỦY"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 24, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <span style={{ color: '#94a3b8' }}>Ngày đăng ký:</span>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>{formatDate(r.registrationDate)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <span style={{ color: '#94a3b8' }}>Ngày nộp phí:</span>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>{formatDate(r.paymentDate)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <span style={{ color: '#94a3b8' }}>Hoàn tiền:</span>
                                <span style={{
                                    color: r.refundConfirmed ? '#047857' : r.refundRequested ? '#dc2626' : '#94a3af',
                                    fontWeight: 600
                                }}>
                                    {r.refundConfirmed
                                        ? `Đã hoàn tiền ${formatRefundDate(r.refundConfirmedAt)}`
                                        : r.refundRequested
                                            ? `Đã yêu cầu ${formatRefundDate(r.refundRequestedAt)}`
                                            : r.paymentStatus === "PAID"
                                                ? r.canRequestRefund
                                                    ? "Có thể yêu cầu ngay"
                                                    : `Có thể từ ${formatRefundDate(r.refundEligibleAt)}`
                                                : "Chưa đóng học phí"
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12 }}>
                        <button 
                            onClick={() => setSelectedDetail(null)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: 8,
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                color: '#475569',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >Đóng</button>
                        {r.paymentStatus === "PENDING" && (
                            <button 
                                onClick={() => {
                                    handleConfirm(r);
                                    setSelectedDetail(null);
                                }}
                                style={{
                                    flex: 2,
                                    padding: '10px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: '#f97316',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >Xác nhận thanh toán</button>
                        )}
                        {r.refundRequested && !r.refundConfirmed && (
                            <button
                                onClick={() => {
                                    handleConfirmRefund(r);
                                    setSelectedDetail(null);
                                }}
                                style={{
                                    flex: 2,
                                    padding: '10px',
                                    borderRadius: 8,
                                    border: 'none',
                                    background: '#16a34a',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >Xác nhận hoàn tiền</button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                            flexShrink: 0
                        }}>
                            <Banknote size={24} />
                        </div>
                        <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '16px 0' }}>Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 32
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        flexShrink: 0
                    }}>
                        <Banknote size={24} />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: '#111827',
                            margin: '0 0 4px 0',
                            lineHeight: 1.2
                        }}>Quản lý đóng học phí</h1>
                        <p style={{
                            fontSize: 14,
                            color: '#6b7280',
                            margin: 0,
                            fontWeight: 500
                        }}>
                            Xác nhận thanh toán và quản lý đăng ký khóa học
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={fetchAll}
                        style={{
                            background: 'white',
                            color: '#f97316',
                            border: '1px solid #e5e7eb',
                            padding: '10px 20px',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f97316';
                            e.currentTarget.style.borderColor = '#ea580c';
                            e.currentTarget.style.color = 'white';
                            const svg = e.currentTarget.querySelector('svg');
                            if (svg) {
                                svg.style.transition = 'transform 0.5s ease-in-out';
                                svg.style.transform = 'rotate(180deg)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.color = '#f97316';
                            const svg = e.currentTarget.querySelector('svg');
                            if (svg) {
                                svg.style.transform = 'rotate(0deg)';
                            }
                        }}
                    >
                        <RefreshCw size={16} />
                        Làm mới
                    </button>
                    <button
                        onClick={handleExportExcel}
                        style={{
                            background: '#f97316',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ea580c';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(249, 115, 22, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f97316';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                        }}
                    >
                        <Download size={16} />
                        Xuất Excel
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 20,
                marginBottom: 32
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Tổng đăng ký</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.total}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f97316',
                        color: '#ffffffff'
                    }}>
                        <Users size={20} />
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Chờ xác nhận</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.pending}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fef3c7',
                        color: '#f59e0b'
                    }}>
                        <Clock size={20} />
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Đã thanh toán</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.paid}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f97316',
                        color: '#ffffffff'
                    }}>
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Doanh thu</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{formatAmount(stats.totalAmount)}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f0f9ff',
                        color: '#0ea5e9'
                    }}>
                        <TrendingUp size={20} />
                    </div>
                </div>
                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                        }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Yêu cầu hoàn tiền</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.refundRequests}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#eef2ff',
                        color: '#6366f1'
                    }}>
                        <Activity size={20} />
                    </div>
                </div>
                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                }}>
                    <div>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: 13,
                            color: '#6b7280',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                        }}>Hoàn tiền đã xử lý</h3>
                        <p style={{
                            margin: 0,
                            fontSize: 32,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1
                        }}>{stats.refundConfirmed}</p>
                    </div>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#dcfce7',
                        color: '#047857'
                    }}>
                        <CheckCircle2 size={20} />
                    </div>
                </div>
            </section>

            {/* Bank Info Banner */}
            {bankInfo && (
                <div style={{
                    background: 'white',
                    borderRadius: 12,
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 24,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f97316',
                        color: '#ffffffff'
                    }}>
                        <Banknote size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <strong>{bankInfo.bankName}</strong>
                            <span style={{ color: '#9ca3af' }}>•</span>
                            <span>STK: <code style={{
                                background: '#f3f4f6',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: 12
                            }}>{bankInfo.accountNo}</code></span>
                            <span style={{ color: '#9ca3af' }}>•</span>
                            <span>Chủ TK: <strong>{bankInfo.accountName}</strong></span>
                        </div>
                        <p style={{
                            margin: 0,
                            fontSize: 12,
                            color: '#6b7280'
                        }}>
                            💡 Đối chiếu nội dung chuyển khoản với cột "Mã TT" để xác nhận
                        </p>
                    </div>
                </div>
            )}

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'center',
                marginTop: 12,
                marginBottom: 16
            }}>
                <input
                    type="text"
                    placeholder="Nhập mã chuyển khoản để đối chiếu"
                    value={transferRefSearch}
                    onChange={e => setTransferRefSearch(e.target.value)}
                    style={{
                        flex: '1 1 280px',
                        padding: '10px 14px',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        fontSize: 14
                    }}
                />
                <button
                    onClick={handleCheckTransferRef}
                    disabled={!transferRefSearch.trim() || transferChecking}
                    style={{
                        padding: '10px 18px',
                        borderRadius: 8,
                        border: 'none',
                        background: transferChecking ? '#f9731666' : '#f97316',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: transferChecking ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                    }}
                >
                    {transferChecking ? "Đang kiểm tra..." : "Kiểm tra mã"}
                </button>
            </div>
            {transferRefResult && (
                <div style={{
                    marginBottom: 16,
                    padding: 16,
                    borderRadius: 12,
                    border: transferRefResult.success ? '1px solid #22c55e' : '1px solid #dc2626',
                    background: transferRefResult.success ? '#ecfdf5' : '#fff1f2',
                    color: transferRefResult.success ? '#047857' : '#b91c1c'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <strong style={{ fontSize: 15 }}>{transferRefResult.message}</strong>
                        {transferRefResult.success && transferRefResult.registration && (
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                background: 'rgba(15, 23, 42, 0.08)',
                                color: '#0f172a'
                            }}>
                                {formatPaymentStatusLabel(transferRefResult.registration.paymentStatus)}
                            </span>
                        )}
                    </div>

                    {transferRefResult.success && transferRefResult.registration && (
                        <div style={{
                            marginTop: 12,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: 10,
                            color: '#0f172a'
                        }}>
                            <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#94a3af' }}>Sinh viên</p>
                                <p style={{ margin: 0, fontWeight: 600 }}>{transferRefResult.registration.studentName}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#94a3af' }}>Khóa học</p>
                                <p style={{ margin: 0, fontWeight: 600 }}>{transferRefResult.registration.courseTitle}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#94a3af' }}>Mã chuyển khoản</p>
                                <p style={{ margin: 0, fontWeight: 600, fontFamily: 'monospace' }}>
                                    {transferRefResult.registration.transferRef || "—"}
                                </p>
                            </div>
                        </div>
                    )}

                    {transferRefResult.success && transferRefResult.registration && (
                        <div style={{
                            marginTop: 14,
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 10,
                            alignItems: 'center'
                        }}>
                            {canConfirmRefundFromTransfer(transferRefResult.registration) ? (
                                <button
                                    onClick={() => handleConfirmRefund(transferRefResult.registration)}
                                    disabled={loading}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: 8,
                                        border: 'none',
                                        background: loading ? '#a7f3d0' : '#16a34a',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: 14,
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                    type="button"
                                >
                                    <CheckCircle2 size={16} />
                                    Xác nhận hoàn tiền
                                </button>
                            ) : (
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: 10,
                                    background: '#f1f5f9',
                                    color: '#0f172a',
                                    fontWeight: 600,
                                    fontSize: 13
                                }}>
                                    {transferRefResult.registration.refundConfirmed
                                        ? `Đã hoàn tiền ${formatRefundDate(transferRefResult.registration.refundConfirmedAt)}`
                                        : transferRefResult.registration.refundRequested
                                            ? `Đã yêu cầu ${formatRefundDate(transferRefResult.registration.refundRequestedAt)}`
                                            : 'Chưa có yêu cầu hoàn tiền'}
                                </span>
                            )}
                            <button
                                onClick={() => setSelectedDetail(transferRefResult.registration)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    color: '#0f172a',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    cursor: 'pointer'
                                }}
                                type="button"
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Filter Bar */}
            <section style={{
               background: 'white',
                borderRadius: 12,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                marginBottom: 24,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        pointerEvents: 'none'
                    }} size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, SĐT, khóa học, mã TT..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            width: '100%',
                            padding: '10px 16px 10px 42px',
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            fontSize: 14
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Filter size={18} style={{ color: '#6b7280' }} />
                        <select
                            value={filter}
                            onChange={e => {
                                setFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                fontSize: 14,
                                background: 'white'
                            }}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="PENDING">⏳ Chờ xác nhận</option>
                            <option value="PAID">✓ Đã thanh toán</option>
                            <option value="REFUND_REQUESTED">⌛ Hoàn tiền đang xử lý</option>
                            <option value="REFUNDED">💸 Đã hoàn tiền</option>
                            <option value="CANCELLED">✗ Đã hủy</option>
                        </select>
                    </div>

                    {selectedRows.length > 0 && (
                        <button
                            onClick={handleBulkConfirm}
                            style={{
                                background: '#f97316',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            ✅ Xác nhận ({selectedRows.length})
                        </button>
                    )}
                </div>
            </section>

            {/* Table */}
            <div style={{
                background: 'white',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f9fafb' }}>
                        <tr>
                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 40
                            }}>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                    onChange={toggleAllRows}
                                    style={{ cursor: 'pointer' }}
                                />
                            </th>

                            {/* ✅ Fix: bỏ display:flex khỏi th, đưa vào div bên trong */}
                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                width: 60
                            }} onClick={() => handleSort("id")}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    ID <ArrowUpDown size={14} />
                                </div>
                            </th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                minWidth: 200
                            }} onClick={() => handleSort("studentName")}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Sinh viên <ArrowUpDown size={14} />
                                </div>
                            </th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                minWidth: 160
                            }}>Khóa học</th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                width: 120
                            }} onClick={() => handleSort("amount")}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Học phí <ArrowUpDown size={14} />
                                </div>
                            </th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 140
                            }}>Mã chuyển khoản</th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                width: 150
                            }} onClick={() => handleSort("registrationDate")}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Ngày ĐK <ArrowUpDown size={14} />
                                </div>
                            </th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                cursor: 'pointer',
                                width: 150
                            }} onClick={() => handleSort("paymentDate")}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    Ngày nộp <ArrowUpDown size={14} />
                                </div>
                            </th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'center',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 140
                            }}>Hoàn tiền</th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 140
                            }}>Trạng thái</th>

                            <th style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                                borderBottom: '1px solid #e5e7eb',
                                width: 120
                            }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={11} style={{
                                    padding: '48px',
                                    textAlign: 'center',
                                    borderBottom: '1px solid #e5e7eb'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                        <Search size={48} style={{ color: '#9ca3af' }} />
                                        <p style={{ margin: 0, color: '#6b7280', fontSize: 16 }}>Không tìm thấy kết quả phù hợp</p>
                                        <button
                                            onClick={() => {
                                                setSearch("");
                                                setFilter("ALL");
                                            }}
                                            style={{
                                                background: '#f97316',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: 8,
                                                fontWeight: 600,
                                                fontSize: 14,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map(r => (
                                <tr
                                    key={r.id}
                                    style={{
                                        borderBottom: '1px solid #f3f4f6',
                                        background: r.paymentStatus === "PENDING" ? '#fffbeb' : 'white',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = r.paymentStatus === "PENDING" ? '#fef3c7' : '#f9fafb'}
                                    onMouseLeave={e => e.currentTarget.style.background = r.paymentStatus === "PENDING" ? '#fffbeb' : 'white'}
                                >
                                    <td style={{ padding: '12px 16px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(r.id)}
                                            onChange={() => toggleRowSelection(r.id)}
                                            disabled={r.paymentStatus !== "PENDING"}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </td>

                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
                                        #{r.id}
                                    </td>

                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 13,
                                                fontWeight: 700,
                                                color: 'white',
                                                flexShrink: 0
                                            }}>
                                                {(r.studentName || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                                                    {r.studentName}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                                                    {r.studentEmail}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#374151', maxWidth: 180 }}>
                                        <span title={r.courseTitle} style={{
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {r.courseTitle}
                                        </span>
                                    </td>

                                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#ea580c' }}>
                                        {formatAmount(r.amount)}
                                    </td>

                                    <td style={{ padding: '12px 16px' }}>
                                        <code style={{
                                            background: '#f3f4f6',
                                            padding: '3px 8px',
                                            borderRadius: 5,
                                            fontSize: 12,
                                            color: '#374151',
                                            fontFamily: 'monospace',
                                            letterSpacing: 0.5
                                        }}>{r.transferRef || "—"}</code>
                                        <div style={{ marginTop: 4 }}>
                                            <span style={{
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: r.paymentSubmitted ? '#059669' : '#b45309'
                                            }}>
                                                {r.paymentSubmitted ? 'Sinh viên đã báo chuyển khoản' : 'Chưa gửi thông báo chuyển khoản'}
                                            </span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                                        {formatDate(r.registrationDate)}
                                    </td>

                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                                        {formatDate(r.paymentDate)}
                                    </td>

                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        {r.refundConfirmed ? (
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: 12,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background: '#dcfce7',
                                                color: '#0f766e'
                                            }}>
                                                Đã hoàn tiền {formatRefundDate(r.refundConfirmedAt)}
                                            </span>
                                        ) : r.refundRequested ? (
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: 12,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                background: '#fde8e8',
                                                color: '#b91c1c'
                                            }}>
                                                Đã yêu cầu {formatRefundDate(r.refundRequestedAt)}
                                            </span>
                                        ) : r.paymentStatus === "PAID" ? (
                                            r.canRequestRefund ? (
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: 12,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    background: '#dcfce7',
                                                    color: '#166534'
                                                }}>
                                                    Có thể yêu cầu
                                                </span>
                                            ) : (
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: 12,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    background: '#f8fafc',
                                                    color: '#475569'
                                                }}>
                                                    Có thể từ {formatRefundDate(r.refundEligibleAt)}
                                                </span>
                                            )
                                        ) : (
                                            <span style={{ fontSize: 11, color: '#94a3af' }}>—</span>
                                        )}
                                    </td>

                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            padding: '4px 10px',
                                            borderRadius: 20,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            background:
                                                r.paymentStatus === "PAID" ? '#f97316' :
                                                r.paymentStatus === "PENDING" ? '#f59e0b' :
                                                r.paymentStatus === "REFUND_REQUESTED" ? '#fde68a' :
                                                r.paymentStatus === "REFUNDED" ? '#dcfce7' : '#fee2e2',
                                            color:
                                                r.paymentStatus === "PAID" || r.paymentStatus === "PENDING"
                                                    ? '#ffffff'
                                                    : r.paymentStatus === "REFUNDED"
                                                        ? '#047857'
                                                        : '#991b1b'

                                        }}>
                                            {r.paymentStatus === "PAID" && "✓ Đã thanh toán"}
                                            {r.paymentStatus === "PENDING" && "⏳ Chờ xác nhận"}
                                            {r.paymentStatus === "REFUND_REQUESTED" && "⌛ Hoàn tiền"}
                                            {r.paymentStatus === "REFUNDED" && "💸 Đã hoàn tiền"}
                                            {r.paymentStatus === "CANCELLED" && "✗ Đã hủy"}
                                        </span>
                                    </td>

                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <button
                                                onClick={() => setSelectedDetail(r)}
                                                title="Xem chi tiết"
                                                style={{
                                                    background: '#f1f5f9',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    width: 30,
                                                    height: 30,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 14
                                                }}
                                            >
                                                👁️
                                            </button>

                                            {r.paymentStatus === "PENDING" && (
                                                <button
                                                    onClick={() => handleConfirm(r)}
                                                    disabled={confirming === r.id || !r.paymentSubmitted}
                                                    title={!r.paymentSubmitted ? "Sinh viên chưa thông báo chuyển khoản" : "Xác nhận thanh toán"}
                                                    style={{
                                                        background: confirming === r.id ? '#f97316' : '#f97316',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        width: 30,
                                                        height: 30,
                                                        cursor: confirming === r.id || !r.paymentSubmitted ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    {confirming === r.id ? (
                                                        <span style={{ color: '#ea580c', fontSize: 11, fontWeight: 700 }}>...</span>
                                                    ) : "✅"}
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handlePrintInvoice(r.id)}
                                                title="In hóa đơn"
                                                style={{
                                                    background: '#f1f5f9',
                                                    border: 'none',
                                                    borderRadius: 6,
                                                    width: 30,
                                                    height: 30,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 14
                                                }}
                                            >
                                                🖨️
                                            </button>
                                            {r.refundRequested && !r.refundConfirmed && (
                                                <button
                                                    onClick={() => handleConfirmRefund(r)}
                                                    title="Xác nhận hoàn tiền"
                                                    style={{
                                                        background: '#dcfce7',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        width: 30,
                                                        height: 30,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 14
                                                    }}
                                                >
                                                    💸
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div >

            {/* Unified Admin Pagination */}
            <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
            />

            {renderDetailModal()}
        </div >
    );
}
