import React, { useMemo, useState } from 'react';
import { Input, Select, List, Checkbox, Empty, Spin } from 'antd';
import PostItem from './PostItem';
import CreatePostForm from './CreatePostForm';

const { Search } = Input;

const PostList = ({ posts = [], loading, searchTerm, setSearchTerm, sortOrder, setSortOrder, API_URL, onCrudSuccess }) => {
  const [onlyWithImage, setOnlyWithImage] = useState(false);

  const filtered = useMemo(() => {
    let result = posts || [];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(p => p.name && p.name.toLowerCase().includes(s));
    }
    if (onlyWithImage) {
      result = result.filter(p => p.imageUrl);
    }
    result = result.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      if (aName < bName) return sortOrder === 'asc' ? -1 : 1;
      if (aName > bName) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [posts, searchTerm, onlyWithImage, sortOrder]);

  if (loading) return <Spin tip="Loading movies..." />;

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 6 }}>
      <h2 style={{ color: '#6666FF', marginBottom: 16, textAlign: 'center' }}>Movies List ({filtered.length})</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: '1 1 65%' }}>
          <Search style={{ width: '100%' }} placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} allowClear />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Select value={sortOrder} onChange={v => setSortOrder(v)} style={{ width: 160 }}>
            <Select.Option value="asc">Sort: A - Z</Select.Option>
            <Select.Option value="desc">Sort: Z - A</Select.Option>
          </Select>
          <Checkbox checked={onlyWithImage} onChange={e => setOnlyWithImage(e.target.checked)}>Picture Only</Checkbox>
          <CreatePostForm API_URL={API_URL} onCreateSuccess={onCrudSuccess} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty description="No movies found" />
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={filtered}
          renderItem={item => (
            <List.Item>
              <PostItem post={item} API_URL={API_URL} onCrudSuccess={onCrudSuccess} />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default PostList;