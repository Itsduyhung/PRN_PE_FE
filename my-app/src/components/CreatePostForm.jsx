import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Modal } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const CreatePostForm = ({ API_URL, onCreateSuccess }) => {
  const [form] = Form.useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadUiList, setUploadUiList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => {
    setVisible(false);
    form.resetFields();
    setSelectedFile(null);
    setUploadUiList([]);
  };

  const beforeUpload = (file) => {
    setSelectedFile(file);
    setUploadUiList([{ uid: file.name + Date.now(), name: file.name, status: 'done' }]);
    return false;
  };

  const onRemove = () => {
    setSelectedFile(null);
    setUploadUiList([]);
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('Name', values.Name);
    formData.append('Description', values.Description);
    if (selectedFile) {
      console.log('Appending file:', selectedFile);
      formData.append('ImageFile', selectedFile);
    }
    console.log('FormData entries:', Array.from(formData.entries()));

    try {
      setSubmitting(true);
      await axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Thêm bài viết thành công');
      onCreateSuccess();
      close();
    } catch (err) {
      console.error('Error creating post:', err);
      message.error('Thêm bài viết thất bại. Vui lòng kiểm tra API.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Button
        type="primary"
        onClick={open}
        icon={<PlusOutlined />}
        style={{ background: '#6666FF', borderColor: '#6666FF' }}
      >
        Add Post
      </Button>

      <Modal title="Thêm bài viết mới" open={visible} onCancel={close} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="Name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Tên bài viết" />
          </Form.Item>

          <Form.Item
            name="Description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} placeholder="Mô tả ngắn" />
          </Form.Item>

          <Form.Item label="Hình ảnh (tùy chọn)">
            <Upload
              beforeUpload={beforeUpload}
              onRemove={onRemove}
              fileList={uploadUiList}
              accept="image/*"
              listType="text"
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              style={{ background: '#6666FF', borderColor: '#6666FF' }}
            >
              Tạo Bài viết
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreatePostForm;