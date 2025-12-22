import React, { useState } from "react";
import { Form, Input, Button, Select, message, Space, Card, Row, Col, Typography, Breadcrumb, Divider } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { postService } from "@utils/postService";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function PostCreate() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
        form.setFieldsValue({ slug });
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem("loggedInUser");
            const user = userStr ? JSON.parse(userStr) : {};

            const payload = {
                title: values.title,
                slug: values.slug,
                content: values.content,
                authorId: user.id || 1,
                tagNames: values.tagNames || [],
                status: values.status || "PUBLISHED",
            };

            await postService.createPost(payload);
            message.success("Tạo bài viết thành công!");
            navigate("/admin/posts");
        } catch (error) {
            console.error(error);
            message.error("Tạo bài viết thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="mb-6">
                <Breadcrumb items={[{ title: 'Admin' }, { title: 'Bài viết', href: '/admin/posts' }, { title: 'Tạo mới' }]} className="mb-2" />
                <div className="flex items-center gap-3">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        shape="circle"
                        onClick={() => navigate("/admin/posts")}
                        className="border-gray-300 hover:border-orange-500 hover:text-orange-500"
                    />
                    <Title level={2} style={{ margin: 0 }}>Viết bài mới</Title>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ status: "PUBLISHED" }}
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
                                help="Đường dẫn URL thân thiện với SEO, tự động tạo từ tiêu đề."
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
                        <Card title="Đăng bài" className="shadow-sm rounded-xl mb-6" size="small">
                            <div className="mb-4">
                                <Text className="text-gray-500 block mb-2">Trạng thái:</Text>
                                <Form.Item name="status" noStyle>
                                    <Select className="w-full" size="large">
                                        <Select.Option value="PUBLISHED">🟢 Xuất bản ngay</Select.Option>
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
                                Xuất bản bài viết
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
