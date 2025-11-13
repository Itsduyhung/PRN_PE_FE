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
    form.setFieldsValue({ Name: post.name, Description: post.description, Rating: post.rating });
    setSelectedFile(null);
    setUploadUiList([]);
    setEditing(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${post.id}`);
      message.success('Movie deleted successfully');
      onCrudSuccess();
    } catch (err) {
      console.error(err);
      message.error('Delete failed');
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
    if (values.Rating !== undefined && values.Rating !== null) {
      formData.append('Rating', values.Rating);
    }
    if (selectedFile) {
      console.log('Appending file:', selectedFile);
      formData.append('ImageFile', selectedFile);
    }
    console.log('FormData entries:', Array.from(formData.entries()));

    try {
      setLoading(true);
      await axios.put(`${API_URL}/${post.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Movie updated successfully');
      setEditing(false);
      setSelectedFile(null);
      setUploadUiList([]);
      onCrudSuccess();
    } catch (err) {
      console.error('Error updating:', err);
      message.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Get rating value from backend (lowercase 'rating')
  // Rating is valid if it's a number (including 0), null/undefined means no rating
  // Debug: log to check actual data
  console.log('PostItem - post:', post);
  console.log('PostItem - post.rating:', post.rating, 'typeof:', typeof post.rating);
  
  // Handle both number and string "5" -> 5
  let ratingValue = null;
  if (typeof post.rating === 'number') {
    ratingValue = post.rating;
  } else if (typeof post.rating === 'string' && post.rating !== '' && !isNaN(post.rating)) {
    ratingValue = Number(post.rating);
  } else if (post.rating !== null && post.rating !== undefined && post.rating !== '') {
    // Try to convert to number if possible
    const numRating = Number(post.rating);
    if (!isNaN(numRating)) {
      ratingValue = numRating;
    }
  }
  
  console.log('PostItem - ratingValue:', ratingValue);

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
          <div style={{ fontWeight: 600, color: '#333', marginBottom: 4 }}>
            <span style={{ color: '#999', fontSize: '12px' }}>Title: </span>
            {post.name || 'N/A'}
          </div>
          {post.description && (
            <div style={{ color: '#666', marginTop: 4, marginBottom: 4 }}>
              <span style={{ color: '#999', fontSize: '12px' }}>Genre: </span>
              {post.description}
            </div>
          )}
          <div style={{ color: '#666', marginTop: 4 }}>
            <span style={{ color: '#999', fontSize: '12px' }}>Rating: </span>
            <span style={{ fontWeight: 600, color: '#6666FF' }}>
              {ratingValue !== null ? `${ratingValue}/5` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Actions (vertical) placed inside the same row) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '0 0 auto' }}>
          <Button type="primary" icon={<EditOutlined />} onClick={openEdit} size="small" style={{ background: '#6666FF', borderColor: '#6666FF' }} />
          <Popconfirm title={`Delete "${post.name}"?`} onConfirm={handleDelete} okText="Delete" cancelText="Cancel">
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </div>
      </div>

      <Modal title={`Edit: ${post.name}`} open={editing} onCancel={() => setEditing(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleUpdate} initialValues={{ Name: post.name, Description: post.description, Rating: post.rating }}>
          <Form.Item name="Name" label="Title (Required)" rules={[{ required: true, message: 'Please enter title' }]}>
            <Input placeholder="Movie title" />
          </Form.Item>
          <Form.Item name="Description" label="Genre (Optional)">
            <Input placeholder="Movie genre" />
          </Form.Item>
          <Form.Item 
            name="Rating" 
            label="Rating (Optional, 1-5)"
            normalize={(value) => value ? Number(value) : undefined}
            rules={[
              { type: 'number', min: 1, max: 5, message: 'Rating must be between 1 and 5' }
            ]}
          >
            <Input type="number" min={1} max={5} placeholder="Rating (1-5)" />
          </Form.Item>

          <Form.Item label="Poster Image (Optional)">
            <Upload beforeUpload={beforeUpload} onRemove={onRemove} fileList={uploadUiList} accept="image/*">
              <Button icon={<UploadOutlined />}>Choose file</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#6666FF', borderColor: '#6666FF', marginRight: 8 }}>
              Save
            </Button>
            <Button onClick={() => setEditing(false)}>Cancel</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PostItem;