import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Card, Row, Col, Typography, Breadcrumb, Spin } from "antd";
import { ArrowLeftOutlined, PictureOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { postService } from "@utils/postService";
import { uploadService } from "@utils/uploadService";
import { SERVER_URL } from "@config";

const { Title } = Typography;

const CKEDITOR_TOOLBAR = [
    "heading", "|", "bold", "italic", "underline", "|", "bulletedList", "numberedList", "blockQuote", "|", "undo", "redo",
];

export default function PostEdit() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [initialValues, setInitialValues] = useState(null);

    const generateSlug = (str) => {
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/([^0-9a-z-\s])/g, '').replace(/(\s+)/g, '-').replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const slug = generateSlug(title);
        if (!form.getFieldValue("slug")) {
            form.setFieldsValue({ slug });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await uploadService.uploadImage(file);
            const url = res.data.url || res.data;
            setImageUrl(url);
            form.setFieldsValue({ imageUrl: url });
        } catch (err) {
            message.error("Upload ảnh thất bại");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await postService.getPostById(id);
                const post = response.data;
                setImageUrl(post.imageUrl || "");
                setInitialValues({
                    title: post.title,
                    slug: post.slug,
                    content: post.content,
                    status: post.status,
                    tagNames: post.tags || []
                });
            } catch (error) {
                message.error("Không thể tải thông tin bài viết");
                navigate("/admin/posts");
            } finally {
                setFetching(false);
            }
        };
        fetchPost();
    }, [id, navigate]);

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
                ...values,
                imageUrl,
                authorId: user.id || 1,
            };
            await postService.updatePost(id, payload);
            message.success("Cập nhật thành công!");
            navigate("/admin/posts");
        } catch (error) {
            message.error("Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;

    return (
        <div className="p-6 min-h-screen bg-gray-50/50">
            <div className="mb-6">
                <Breadcrumb items={[{ title: 'Admin' }, { title: 'Bài viết', href: '/admin/posts' }, { title: 'Chỉnh sửa' }]} className="mb-2" />
                <div className="flex items-center gap-3">
                    <Button icon={<ArrowLeftOutlined />} shape="circle" onClick={() => navigate("/admin/posts")} />
                    <Title level={2} style={{ margin: 0 }}>Chỉnh sửa bài viết</Title>
                </div>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={24}>
                    <Col span={24} lg={17}>
                        <Card className="shadow-sm rounded-xl mb-6">
                            <Form.Item label="Tiêu đề bài viết" name="title" rules={[{ required: true }]}>
                                <Input size="large" onChange={handleTitleChange} />
                            </Form.Item>
                            <Form.Item label="Đường dẫn (Slug)" name="slug" rules={[{ required: true }]}>
                                <Input prefix="/bai-viet/" />
                            </Form.Item>

                            <Form.Item label="Hình ảnh đại diện bài viết">
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm">
                                        <PictureOutlined />
                                        {uploading ? "Đang tải..." : "Thay đổi ảnh đại diện"}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                    {imageUrl && (
                                        <div className="relative group">
                                            <img
                                                src={imageUrl.startsWith("http") ? imageUrl : `${SERVER_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`}
                                                className="h-16 w-16 object-cover rounded-lg border shadow-sm"
                                                alt="preview"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImageUrl("")}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Form.Item>

                            <Form.Item label="Nội dung bài viết" name="content" rules={[{ required: true }]}>
                                <div className="border rounded-md overflow-hidden shadow-inner">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={form.getFieldValue("content")}
                                        config={{ toolbar: CKEDITOR_TOOLBAR }}
                                        onChange={(e, editor) => form.setFieldsValue({ content: editor.getData() })}
                                    />
                                </div>
                            </Form.Item>
                        </Card>
                    </Col>
                    <Col span={24} lg={7}>
                        <Card title="Cài đặt bài viết" className="shadow-sm rounded-xl mb-6" size="small">
                            <Form.Item label="Trạng thái" name="status">
                                <Select className="w-full">
                                    <Select.Option value="PUBLISHED">🟢 Xuất bản</Select.Option>
                                    <Select.Option value="DRAFT">🟡 Lưu nháp</Select.Option>
                                </Select>
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading || uploading} block size="large" className="bg-orange-500 border-none shadow-md mt-4">
                                Lưu thay đổi
                            </Button>
                        </Card>
                        <Card title="Phân loại" size="small" className="shadow-sm rounded-xl">
                            <Form.Item name="tagNames" label="Tags">
                                <Select mode="tags" placeholder="Thêm thẻ..." style={{ width: '100%' }} />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}
