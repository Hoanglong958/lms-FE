import React, { useState, useEffect } from "react";
import { registrationService } from "@utils/registrationService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
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
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [bankInfo, setBankInfo] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, title: "", message: "", type: "info" });
    const [confirming, setConfirming] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "registrationDate", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
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
            setNotification({
                isOpen: true,
                title: "Lỗi",
                message: "Không thể tải danh sách đăng ký",
                type: "error"
            });
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
            alert("Không thể xuất file Excel");
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
            alert("Không thể xuất hóa đơn PDF");
        }
    };

    const handleConfirm = async (id) => {
        setConfirming(id);
        try {
            const response = await registrationService.confirmPayment(id);
            const enrolledClassName = response.data?.data?.enrolledClassName;
            setNotification({
                isOpen: true,
                title: "Thành công!",
                message: enrolledClassName
                    ? `Đã xác nhận thanh toán và thêm sinh viên vào lớp "${enrolledClassName}".`
                    : "Đã xác nhận thanh toán. Không tìm thấy lớp học nào cho khóa học này.",
                type: "success"
            });
            fetchAll();
        } catch (err) {
            setNotification({
                isOpen: true,
                title: "Lỗi",
                message: err.response?.data?.data || "Không thể xác nhận thanh toán.",
                type: "error"
            });
        } finally {
            setConfirming(null);
        }
    };

    const handleBulkConfirm = async () => {
        if (selectedRows.length === 0) return;

        if (!window.confirm(`Xác nhận ${selectedRows.length} khoản thanh toán đã chọn?`)) return;

        for (const id of selectedRows) {
            await handleConfirm(id);
        }
        setSelectedRows([]);
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
            .reduce((sum, r) => sum + (r.amount || 0), 0)
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
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e5e7eb';
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
                gridTemplateColumns: 'repeat(4, 1fr)',
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
                                <td colSpan={10} style={{
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
                                    </td>

                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                                        {formatDate(r.registrationDate)}
                                    </td>

                                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>
                                        {formatDate(r.paymentDate)}
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
                                            background: r.paymentStatus === "PAID" ? '#f97316' :
                                                r.paymentStatus === "PENDING" ? '#fef3c7' : '#fee2e2',
                                            color: r.paymentStatus === "PAID" ? '#ffffff' :
                                                r.paymentStatus === "PENDING" ? '#ffffff' : '#991b1b'
                                        }}>
                                            {r.paymentStatus === "PAID" && "✓ Đã thanh toán"}
                                            {r.paymentStatus === "PENDING" && "⏳ Chờ xác nhận"}
                                            {r.paymentStatus === "CANCELLED" && "✗ Đã hủy"}
                                        </span>
                                    </td>

                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <button
                                                onClick={() => {/* Xem chi tiết */ }}
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
                                                    onClick={() => handleConfirm(r.id)}
                                                    disabled={confirming === r.id}
                                                    title="Xác nhận thanh toán"
                                                    style={{
                                                        background: confirming === r.id ? '#f97316' : '#f97316',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        width: 30,
                                                        height: 30,
                                                        cursor: confirming === r.id ? 'not-allowed' : 'pointer',
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
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div >

            {/* Pagination */}
            {
                filtered.length > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 24,
                        padding: '16px 0'
                    }}>
                        <div style={{ fontSize: 14, color: '#6b7280' }}>
                            Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                            {Math.min(currentPage * pageSize, filtered.length)} trong số{" "}
                            {filtered.length} kết quả
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        style={{
                                            background: currentPage === pageNum ? '#f97316' : 'white',
                                            color: currentPage === pageNum ? 'white' : '#374151',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: 8,
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            fontWeight: currentPage === pageNum ? 600 : 400
                                        }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )
            }

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(n => ({ ...n, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div >
    );
}
