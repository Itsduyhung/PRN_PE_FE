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
    if (values.Rating !== undefined && values.Rating !== null) {
      formData.append('Rating', values.Rating);
    }
    if (selectedFile) {
      console.log('Appending file:', selectedFile);
      formData.append('ImageFile', selectedFile);
    }
    console.log('FormData entries:', Array.from(formData.entries()));

    try {
      setSubmitting(true);
      await axios.post(API_URL, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      message.success('Movie added successfully');
      onCreateSuccess();
      close();
    } catch (err) {
      console.error('Error creating post:', err);
      message.error('Failed to add movie. Please check API.');
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
        Add Movie
      </Button>

      <Modal title="Add New Movie" open={visible} onCancel={close} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="Name" label="Title (Required)" rules={[{ required: true, message: 'Please enter title' }]}>
            <Input placeholder="Movie title" />
          </Form.Item>

          <Form.Item
            name="Description"
            label="Genre (Optional)"
          >
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
            <Upload
              beforeUpload={beforeUpload}
              onRemove={onRemove}
              fileList={uploadUiList}
              accept="image/*"
              listType="text"
            >
              <Button icon={<UploadOutlined />}>Choose file</Button>
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
              Create Movie
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreatePostForm;