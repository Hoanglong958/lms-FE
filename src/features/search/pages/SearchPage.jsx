import React, { useState, useEffect, useCallback } from "react";
import "./SearchPage.css";
import CourseCard from "@components/CourseCard";
import { courseService } from "@utils/courseService";
import { postService } from "@utils/postService";
import { slugify } from "@utils/slugify";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");

  const handleSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setSearchTitle(searchQuery);
    try {
      const params = { q: searchQuery, size: 20 };

      const [coursesRes, postsRes] = await Promise.all([
        courseService.getCoursesPaging(params),
        postService.getPosts(params)
      ]);

      const courses = (coursesRes.data?.data?.content || coursesRes.data?.content || []).map(c => ({
        id: `course - ${c.id} `,
        title: c.title,
        image: c.imageUrl || "/students.jpg",
        level: c.level,
        type: "Khóa học",
        lessons: c.totalSessions || 0,
        students: 0,
        price: "Miễn phí",
        url: `/ courses / ${slugify(c.title)} `
      }));

      const posts = (postsRes.data?.data?.content || postsRes.data?.content || []).map(p => ({
        id: `post - ${p.id} `,
        title: p.title,
        image: p.imageUrl || "/students.jpg",
        level: "Kiến thức",
        type: "Bài viết",
        lessons: 1,
        students: 0,
        price: "Mới nhất",
        url: `/ bai - viet / ${p.id} `
      }));

      setResults([...courses, ...posts]);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch("");
  }, [handleSearch]);

  const onSearchClick = () => {
    handleSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearchClick();
    }
  };

  return (
    <div className="sp-page">

      {/* ==== HERO BANNER ==== */}
      <section className="sp-hero">
        <div className="sp-container">
          <h1 className="sp-title">Tìm kiếm</h1>
          <p className="sp-sub">Tìm khóa học, bài viết...</p>

          <div className="sp-search-card">
            <input
              className="sp-input"
              placeholder="Tìm khóa học, bài viết..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="sp-btn" onClick={onSearchClick} disabled={loading}>
              {loading ? "..." : "Tìm"}
            </button>
          </div>
        </div>
      </section>

      {/* ==== RESULT SECTION ==== */}
      <section className="sp-results">
        <div className="sp-container sp-panel">

          <div className="sp-results-head">
            {loading ? (
              <span>Đang tìm kiếm kết quả cho <b>"{query}"</b>...</span>
            ) : (
              <>
                <span> Có <b>{results.length}</b> kết quả cho từ khóa <b>"{searchTitle || "Tất cả"}"</b> </span>
                <span className="sp-sort">Sắp xếp: Mới nhất ▾</span>
              </>
            )}
          </div>

          <div className="sp-grid">
            {results.length > 0 ? (
              results.map((item) => (
                <CourseCard key={item.id} course={item} />
              ))
            ) : !loading && (
              <div style={{ textAlign: 'center', padding: '40px', width: '100%', color: '#6b7280' }}>
                Không tìm thấy kết quả nào phù hợp.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
