import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Space, Card, Row, Col, Typography, Breadcrumb, Divider, Spin } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { postService } from "@utils/postService";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PostEdit() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [initialValues, setInitialValues] = useState(null);

    // Simple slugify helper
    const generateSlug = (str) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = generateSlug(title);
        // Only auto-update slug if it was empty or matches old title slug pattern
        // For editing, usually better to let user manually change slug if they want
        // ensuring they don't accidentally break old links.
        // But for simplicity/convenience:
        if (!form.getFieldValue("slug")) {
            form.setFieldsValue({ slug });
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await postService.getPostById(id);
                const post = response.data;

                // Set data to state first, let Form use initialValues when it mounts
                setInitialValues({
                    title: post.title,
                    slug: post.slug,
                    content: post.content,
                    status: post.status,
                    tagNames: post.tags || []
                });
            } catch (error) {
                console.error("Failed to fetch post:", error);
                message.error("Không thể tải thông tin bài viết");
                navigate("/admin/posts");
            } finally {
                setFetching(false);
            }
        };
        fetchPost();
    }, [id, navigate]);

    // Reset form when initialValues changes (important for re-visiting the page)
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem("loggedInUser");
            const user = userStr ? JSON.parse(userStr) : {};

            const payload = {
                title: values.title,
                slug: values.slug,
                content: values.content,
                authorId: user.id || 1, // Keep author ID logic or use existing author
                tagNames: values.tagNames || [],
                status: values.status,
            };

            await postService.updatePost(id, payload);
            message.success("Cập nhật bài viết thành công!");
            navigate("/admin/posts");
        } catch (error) {
            console.error(error);
            message.error("Cập nhật bài viết thất bại!");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="mb-6">
                <Breadcrumb items={[{ title: 'Admin' }, { title: 'Bài viết', href: '/admin/posts' }, { title: 'Chỉnh sửa' }]} className="mb-2" />
                <div className="flex items-center gap-3">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        shape="circle"
                        onClick={() => navigate("/admin/posts")}
                        className="border-gray-300 hover:border-orange-500 hover:text-orange-500"
                    />
                    <Title level={2} style={{ margin: 0 }}>Chỉnh sửa bài viết</Title>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={24}>
                    {/* Main Content Column */}
                    <Col span={24} lg={17}>
                        <Card className="shadow-sm rounded-xl mb-6">
                            <Form.Item
                                label={<span className="font-semibold text-gray-700">Tiêu đề bài viết</span>}
                                name="title"
                                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                            >
                                <Input
                                    size="large"
                                    placeholder="Nhập tiêu đề hấp dẫn..."
                                    onChange={handleTitleChange}
                                    className="font-medium text-lg py-2"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="font-semibold text-gray-700">Đường dẫn (Slug)</span>}
                                name="slug"
                                rules={[{ required: true, message: "Vui lòng nhập slug" }]}
                                help="Đường dẫn URL thân thiện với SEO."
                            >
                                <Input prefix={<span className="text-gray-400">/bai-viet/</span>} placeholder="url-bai-viet" className="bg-gray-50" />
                            </Form.Item>

                            <Divider />

                            <Form.Item
                                label={<span className="font-semibold text-gray-700">Nội dung bài viết</span>}
                                name="content"
                                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                            >
                                <TextArea
                                    rows={18}
                                    placeholder="Viết nội dung của bạn ở đây... (Hỗ trợ HTML/Markdown)"
                                    className="text-base leading-relaxed"
                                    showCount
                                />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* Sidebar Column */}
                    <Col span={24} lg={7}>
                        {/* Publish Card */}
                        <Card title="Cập nhật" className="shadow-sm rounded-xl mb-6" size="small">
                            <div className="mb-4">
                                <Text className="text-gray-500 block mb-2">Trạng thái:</Text>
                                <Form.Item name="status" noStyle>
                                    <Select className="w-full" size="large">
                                        <Select.Option value="PUBLISHED">🟢 Xuất bản</Select.Option>
                                        <Select.Option value="DRAFT">🟡 Lưu nháp</Select.Option>
                                        <Select.Option value="ARCHIVED">🔴 Lưu trữ</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<SaveOutlined />}
                                block
                                size="large"
                                style={{
                                    background: "linear-gradient(90deg, #ff8a00, #e52e71)",
                                    border: "none",
                                    fontWeight: 600
                                }}
                            >
                                Lưu thay đổi
                            </Button>
                        </Card>

                        {/* Taxonomy Card */}
                        <Card title="Phân loại" className="shadow-sm rounded-xl" size="small">
                            <Form.Item
                                label="Thẻ (Tags)"
                                name="tagNames"
                                tooltip="Giúp bài viết dễ tìm kiếm hơn"
                                className="mb-0"
                            >
                                <Select
                                    mode="tags"
                                    placeholder="Nhập tags..."
                                    style={{ width: '100%' }}
                                    tokenSeparators={[',']}
                                    options={[
                                        { value: 'Java', label: 'Java' },
                                        { value: 'Spring Boot', label: 'Spring Boot' },
                                        { value: 'ReactJS', label: 'ReactJS' },
                                        { value: 'Frontend', label: 'Frontend' },
                                        { value: 'Backend', label: 'Backend' },
                                    ]}
                                />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}
