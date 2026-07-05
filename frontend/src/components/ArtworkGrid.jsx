// ─── ArtworkGrid ───────────────────────────────────────────────────────────
// Responsive masonry-style grid of artwork cards. Shows skeletons while loading.

import { useState } from "react";
import ArtworkCard from "./ArtworkCard.jsx";
import ArtworkModal from "./ArtworkModal.jsx";

const SkeletonCard = () => (
  <div className="rounded-xl overflow-hidden border border-sandlewood/10">
    <div className="skeleton aspect-square" />
    <div className="p-3 space-y-2">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </div>
  </div>
);

const ArtworkGrid = ({
  posts = [],
  isLoading = false,
  isDashboard = false,
  onDelete,
  onEdit,
  emptyMessage = "No artwork posted yet.",
}) => {
  const [selectedPost, setSelectedPost] = useState(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-plum/20 border border-sandlewood/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-sandlewood/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-almond/40 text-sm font-sans">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <ArtworkCard
            key={post._id}
            post={post}
            isDashboard={isDashboard}
            onDelete={onDelete}
            onEdit={onEdit}
            onClick={setSelectedPost}
          />
        ))}
      </div>
      {selectedPost && (
        <ArtworkModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
};

export default ArtworkGrid;
