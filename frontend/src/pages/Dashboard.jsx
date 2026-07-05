// ─── Dashboard Page ────────────────────────────────────────────────────────
// Private page — accessible only when authenticated.
// Shows the user's profile summary, artwork grid, and action buttons.

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { postsAPI } from "../services/api.js";
import ArtworkGrid from "../components/ArtworkGrid.jsx";
import WorkUploadModal from "../components/WorkUploadModal.jsx";
import ProfileEditor from "../components/ProfileEditor.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await postsAPI.getMyPosts(page, 12);
      setPosts(data.data.posts);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (postId) => {
    await postsAPI.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    setEditPost(null);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-carbon pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="glass-panel p-6 mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-sandlewood/30 shadow-brand-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-brand border-2 border-sandlewood/30 shadow-brand-md flex items-center justify-center">
                  <span className="text-almond text-3xl font-display font-bold">
                    {user?.fullName?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-carbon" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-almond truncate">
                {user?.fullName}
              </h1>
              <p className="text-sandlewood text-sm font-mono mt-0.5">@{user?.username}</p>
              {user?.bio && (
                <p className="text-almond/60 text-sm mt-2 line-clamp-2">{user.bio}</p>
              )}
              {user?.visionStatement && (
                <p className="text-almond/40 text-xs mt-1 italic line-clamp-1">"{user.visionStatement}"</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button
                onClick={() => setShowProfileEditor(true)}
                className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Artwork
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-sandlewood/10">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-almond">{pagination.total}</p>
              <p className="text-almond/40 text-xs uppercase tracking-wider mt-0.5">Artworks</p>
            </div>
            {user?.education?.length > 0 && (
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-almond">{user.education.length}</p>
                <p className="text-almond/40 text-xs uppercase tracking-wider mt-0.5">Education</p>
              </div>
            )}
            {user?.experience?.length > 0 && (
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-almond">{user.experience.length}</p>
                <p className="text-almond/40 text-xs uppercase tracking-wider mt-0.5">Experience</p>
              </div>
            )}
            <div className="ml-auto flex items-start">
              <a
                href={`/portfolio/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sandlewood/70 hover:text-sandlewood text-xs flex items-center gap-1 transition-colors"
              >
                View public portfolio
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Artwork Section */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title text-xl">My Artwork</h2>
              <p className="section-subtitle text-xs mt-1">{pagination.total} piece{pagination.total !== 1 ? "s" : ""}</p>
            </div>
            {!loading && posts.length > 0 && (
              <button onClick={() => setShowUpload(true)} className="btn-primary text-sm px-4 py-2">
                + Add New
              </button>
            )}
          </div>

          <ArtworkGrid
            posts={posts}
            isLoading={loading}
            isDashboard
            onDelete={handleDeletePost}
            onEdit={(post) => setEditPost(post)}
            emptyMessage="Upload your first artwork to get started."
          />

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchPosts(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    pagination.page === p
                      ? "bg-plum text-almond border border-sandlewood/30"
                      : "text-almond/50 hover:text-almond hover:bg-sandlewood/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {(showUpload || editPost) && (
        <WorkUploadModal
          onClose={() => { setShowUpload(false); setEditPost(null); }}
          onSuccess={handleUploadSuccess}
          editPost={editPost}
        />
      )}
      {showProfileEditor && (
        <ProfileEditor onClose={() => setShowProfileEditor(false)} />
      )}
    </div>
  );
};

export default Dashboard;
