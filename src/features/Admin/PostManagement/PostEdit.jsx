import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Card, Row, Col, Typography, Breadcrumb, Divider, Spin } from "antd";
import { ArrowLeftOutlined, SaveOutlined, PictureOutlined } from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { postService } from "@utils/postService";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const { Title, Text } = Typography;

export default function PostEdit() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [editorContent, setEditorContent] = useState("");

    const isTeacher = location.pathname.startsWith("/teacher");
    const basePath = isTeacher ? "/teacher/posts" : "/admin/posts";

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
        if (!form.getFieldValue("slug")) {
            form.setFieldsValue({ slug });
        }
    };

    // Custom upload adapter cho Base64
    class Base64UploadAdapter {
        constructor(loader) {
            this.loader = loader;
        }

        async upload() {
            const file = await this.loader.file;
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = () => {
                    resolve({
                        default: reader.result // Chuỗi Base64
                    });
                };
                
                reader.onerror = error => {
                    reject(error);
                };
                
                reader.onabort = () => {
                    reject();
                };
                
                reader.readAsDataURL(file);
            });
        }

        abort() {
            // Không cần xử lý
        }
    }

    // Plugin cho CKEditor
    function Base64UploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new Base64UploadAdapter(loader);
        };
    }

    // Xử lý paste ảnh
    const handlePaste = (evt, editor) => {
        const items = evt.data.dataTransfer?.items || [];
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Image = e.target.result;
                    
                    editor.model.change(writer => {
                        const imageElement = writer.createElement('image', {
                            src: base64Image
                        });
                        editor.model.insertContent(imageElement, editor.model.document.selection);
                    });
                };
                reader.readAsDataURL(file);
                
                evt.stopPropagation();
                evt.preventDefault();
                break;
            }
        }
    };

    // Cấu hình CKEditor
    const editorConfiguration = {
        extraPlugins: [Base64UploadAdapterPlugin],
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'link',
                'bulletedList',
                'numberedList',
                '|',
                'outdent',
                'indent',
                '|',
                'imageUpload',
                'blockQuote',
                'insertTable',
                'mediaEmbed',
                'undo',
                'redo',
                '|',
                'alignment',
                'fontColor',
                'fontSize',
                'highlight',
                'codeBlock',
                '|',
                'sourceEditing'
            ]
        },
        image: {
            toolbar: [
                'imageTextAlternative',
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                '|',
                'imageResize',
                '|',
                'toggleImageCaption'
            ],
            styles: [
                'full',
                'side',
                'alignLeft',
                'alignCenter',
                'alignRight'
            ],
            resizeOptions: [
                {
                    name: 'imageResize:original',
                    value: null,
                    label: 'Original'
                },
                {
                    name: 'imageResize:50',
                    value: '50',
                    label: '50%'
                },
                {
                    name: 'imageResize:75',
                    value: '75',
                    label: '75%'
                }
            ],
            resizeUnit: '%'
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells'
            ]
        },
        language: 'vi',
        placeholder: 'Chỉnh sửa nội dung bài viết...',
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await postService.getPostById(id);
                const post = response.data;

                // Set nội dung cho editor
                setEditorContent(post.content || '');

                // Set data cho form
                setInitialValues({
                    title: post.title,
                    slug: post.slug,
                    status: post.status,
                    tagNames: post.tags || []
                });
            } catch (error) {
                console.error("Failed to fetch post:", error);
                message.error("Không thể tải thông tin bài viết");
                navigate(basePath);
            } finally {
                setFetching(false);
            }
        };
        fetchPost();
    }, [id, navigate]);

    // Reset form khi initialValues thay đổi
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
                content: editorContent, // Dùng content từ CKEditor
                authorId: user.id || 1,
                tagNames: values.tagNames || [],
                status: values.status,
            };

            await postService.updatePost(id, payload);
            message.success("Cập nhật bài viết thành công!");
            navigate(basePath);
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
               
                <div className="flex items-center gap-3">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        shape="circle"
                        onClick={() => navigate(basePath)}
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
                                <Input 
                                    prefix={<span className="text-gray-400">/bai-viet/</span>} 
                                    placeholder="url-bai-viet" 
                                    className="bg-gray-50" 
                                />
                            </Form.Item>

                            <Divider />

                            <Form.Item
                                label={<span className="font-semibold text-gray-700">Nội dung bài viết</span>}
                                required
                                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                            >
                                <div className="border rounded-lg overflow-hidden">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        config={editorConfiguration}
                                        data={editorContent}
                                        onReady={(editor) => {
                                            // Xử lý paste ảnh
                                            editor.editing.view.document.on('paste', (evt, data) => {
                                                handlePaste(evt, editor);
                                            });
                                        }}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setEditorContent(data);
                                            // Validate nếu cần
                                            form.validateFields(['content']).catch(() => {});
                                        }}
                                    />
                                </div>
                                
                                
                                
                                
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

            {/* CSS */}
            <style jsx>{`
                :global(.ck.ck-editor__editable_inline) {
                    min-height: 400px;
                    max-height: 600px;
                }
                
                :global(.ck.ck-editor) {
                    width: 100%;
                }
                
                :global(.ck.ck-toolbar) {
                    border-radius: 8px 8px 0 0 !important;
                }
                
                :global(.ck.ck-editor__main > .ck-editor__editable) {
                    border-radius: 0 0 8px 8px !important;
                }
                
                /* Style cho ảnh trong editor */
                :global(.ck-content .image) {
                    margin: 20px auto;
                }
                
                :global(.ck-content .image img) {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                
                /* Style cho ảnh align */
                :global(.ck-content .image-style-align-left) {
                    float: left;
                    margin-right: 20px;
                }
                
                :global(.ck-content .image-style-align-right) {
                    float: right;
                    margin-left: 20px;
                }
                
                :global(.ck-content .image-style-align-center) {
                    margin-left: auto;
                    margin-right: auto;
                }
            `}</style>
        </div>
    );
}