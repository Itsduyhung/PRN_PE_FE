import React, { useState } from 'react';
import { Card, Modal, Form, Input, Button, Upload, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const PostItem = ({ post, API_URL, onCrudSuccess }) => {
  const [editing, setEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadUiList, setUploadUiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const openEdit = () => {
    form.setFieldsValue({ Name: post.name, Description: post.description });
    setSelectedFile(null);
    setUploadUiList([]);
    setEditing(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${post.id}`);
      message.success('Xóa bài viết thành công');
      onCrudSuccess();
    } catch (err) {
      console.error(err);
      message.error('Xóa thất bại');
    }
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

  const handleUpdate = async (values) => {
    const formData = new FormData();
    formData.append('Name', values.Name);
    formData.append('Description', values.Description);
    if (selectedFile) {
      console.log('Appending file:', selectedFile);
      formData.append('ImageFile', selectedFile);
    }
    console.log('FormData entries:', Array.from(formData.entries()));

    try {
      setLoading(true);
      await axios.put(`${API_URL}/${post.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Cập nhật thành công');
      setEditing(false);
      setSelectedFile(null);
      setUploadUiList([]);
      onCrudSuccess();
    } catch (err) {
      console.error('Error updating:', err);
      message.error('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: '100%', borderWidth: 1, borderStyle: 'solid', borderColor: '#e8e8e8', padding: 8 }} bodyStyle={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Image */}
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flex: '0 0 auto' }} />
        ) : (
          <div style={{ width: 64, height: 64, background: '#f5f5f5', borderRadius: 6 }} />
        )}

        {/* Content */}
        <div style={{ flex: '1 1 auto' }}>
          <div style={{ fontWeight: 600, color: '#333' }}>{post.name}</div>
          <div style={{ color: '#666', marginTop: 6 }}>{post.description}</div>
        </div>

        {/* Actions (vertical) placed inside the same row) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '0 0 auto' }}>
          <Button type="primary" icon={<EditOutlined />} onClick={openEdit} size="small" style={{ background: '#6666FF', borderColor: '#6666FF' }} />
          <Popconfirm title={`Xóa "${post.name}"?`} onConfirm={handleDelete} okText="Xóa" cancelText="Hủy">
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </div>
      </div>

      <Modal title={`Chỉnh sửa: ${post.name}`} open={editing} onCancel={() => setEditing(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleUpdate} initialValues={{ Name: post.name, Description: post.description }}>
          <Form.Item name="Name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="Description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Hình ảnh (cập nhật)">
            <Upload beforeUpload={beforeUpload} onRemove={onRemove} fileList={uploadUiList} accept="image/*">
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#6666FF', borderColor: '#6666FF', marginRight: 8 }}>
              Lưu
            </Button>
            <Button onClick={() => setEditing(false)}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PostItem;