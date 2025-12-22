import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Modal, message, Input, Card, Breadcrumb, Typography } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { postService } from "@utils/postService";
import dayjs from "dayjs";

const { Title } = Typography;

export default function PostManagement() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await postService.getPosts({ page: 0, size: 100 });
            const raw = response?.data;
            let data = [];
            if (Array.isArray(raw)) data = raw;
            else if (Array.isArray(raw?.content)) data = raw.content;
            else if (Array.isArray(raw?.data)) data = raw.data;
            else if (Array.isArray(raw?.data?.content)) data = raw.data.content;
            else if (Array.isArray(response?.data?.data)) data = response.data.data;
            else if (Array.isArray(response?.data?.data?.content)) data = response.data.data.content;
            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            message.error("Không thể tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Bạn có chắc chắn muốn xóa bài viết này?",
            content: "Hành động này không thể hoàn tác.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await postService.deletePost(id);
                    message.success("Xóa bài viết thành công");
                    fetchPosts(); // Refresh list
                } catch {
                    message.error("Xóa bài viết thất bại");
                }
            },
        });
    };

    // Filter posts based on search
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 60,
            align: "center",
            render: (text) => <span className="text-gray-500">#{text}</span>,
        },
        {
            title: "Thông tin bài viết",
            key: "info",
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-base text-gray-800 hover:text-orange-500 cursor-pointer transition" onClick={() => navigate(`${record.id}/edit`)}>
                        {record.title}
                    </span>
                    <span className="text-xs text-gray-400 italic">Slug: {record.slug}</span>
                </div>
            ),
        },
        {
            title: "Tác giả",
            dataIndex: "author",
            key: "author",
            width: 150,
            render: (author) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                        {(author?.fullName || "A").charAt(0).toUpperCase()}
                    </div>
                    <span>{author?.fullName || "Admin"}</span>
                </div>
            ),
        },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            width: 200,
            render: (tags) => (
                <div className="flex flex-wrap gap-1">
                    {Array.isArray(tags) && tags.map((tag) => (
                        <Tag color="cyan" key={tag} className="mr-0">
                            {tag}
                        </Tag>
                    ))}
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => (
                <Tag
                    color={status === "PUBLISHED" ? "success" : "warning"}
                    className="px-2 py-0.5 rounded-full font-medium"
                >
                    {status === "PUBLISHED" ? "Xuất bản" : "Nháp"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (date) => (
                <span className="text-gray-500">
                    {dayjs(date).format("DD/MM/YYYY")}
                </span>
            ),
        },
        {
            title: "",
            key: "action",
            width: 100,
            align: "right",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined className="text-blue-500" />}
                        onClick={() => navigate(`${record.id}/edit`)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 min-h-screen bg-gray-50/50">
            {/* Breadcrumb & Header */}
            <div className="mb-6">
                <Breadcrumb
                    items={[
                        { href: '/admin', title: <HomeOutlined /> },
                        { title: 'Quản lý bài viết' },
                    ]}
                    className="mb-2"
                />
                <div className="flex justify-between items-start">
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Danh sách bài viết</Title>
                        <p className="text-gray-500 mt-1">Quản lý và theo dõi tất cả bài viết trên hệ thống</p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("create")}
                        style={{
                            background: "linear-gradient(90deg, #ff8a00, #e52e71)",
                            border: "none",
                            boxShadow: "0 4px 14px 0 rgba(255,138,0,0.39)",
                            fontWeight: 600
                        }}
                    >
                        Tạo bài viết mới
                    </Button>
                </div>
            </div>

            {/* Search & Filter Bar could go here */}
            <Card variant="outlined" className="shadow-sm rounded-xl mb-6">
                <div className="flex justify-between items-center mb-4">
                    <Input
                        prefix={<SearchOutlined className="text-gray-400" />}
                        placeholder="Tìm kiếm bài viết theo tiêu đề..."
                        className="max-w-md"
                        size="large"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />

                    {/* Additional filters can be added here */}
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredPosts}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng ${total} bài viết`,
                        showSizeChanger: true
                    }}
                    className="ant-table-striped"
                />
            </Card>
        </div>
    );
}
