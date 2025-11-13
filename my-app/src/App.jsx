import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostList from './components/PostList';

// For local development we proxy API requests through CRA dev server (see package.json "proxy").
// Use a relative path so the dev server proxy is used. In production build, replace with the real URL or configure env vars.
const API_URL = '/api/Post';

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' hoặc 'desc'

  // --- 1. GET ALL: Fetch Dữ liệu ---
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Endpoint GET All là /api/Post
      const response = await axios.get(API_URL);
      console.log('Fetched posts:', response.data);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert("Không thể tải danh sách bài viết từ API.");
      setPosts([]); // Đặt rỗng nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);
  
  // --- 2. HÀM CALLBACK CHUNG CHO CÁC THAO TÁC CRUD ---
  // Gọi hàm này sau khi POST, PUT, DELETE thành công để tự động tải lại danh sách.
  const handleCrudSuccess = () => {
    fetchPosts();
  };

  // --- 3. Logic Search và Sort (Giữ nguyên) ---
  const filteredPosts = posts.filter(post => 
    post.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedAndFilteredPosts = filteredPosts.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
    if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: 24, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1100 }}>
        <h1 style={{ textAlign: 'center', color: '#6666FF', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
          Ứng dụng Quản lý Bài viết
        </h1>

        <PostList 
          posts={sortedAndFilteredPosts} 
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          API_URL={API_URL} // Truyền API URL để các item con có thể DELETE/UPDATE
          onCrudSuccess={handleCrudSuccess}
        />
      </div>
    </div>
  );
}

export default App;