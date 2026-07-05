// ─── ArtworkCard ───────────────────────────────────────────────────────────
// Displays a single artwork post. In dashboard mode shows Edit/Delete buttons.

import { useState, useRef, useEffect } from "react";

const ArtworkCard = ({ post, isDashboard = false, onDelete, onEdit, onClick }) => {
  const isMounted = useRef(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => { if (isMounted.current) setConfirmDelete(false); }, 3000);
      return;
    }
    setDeleting(true);
    await onDelete(post._id);
    // Card may be unmounted by the time onDelete resolves — guard state updates
    if (isMounted.current) setDeleting(false);
  };

  return (
    <div 
      className="group relative rounded-xl overflow-hidden border border-sandlewood/10 bg-carbon-light/40 hover:border-sandlewood/30 transition-all duration-300 hover:shadow-brand-md animate-fade-in cursor-pointer"
      onClick={() => onClick?.(post)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton" />
        )}
        <img
          src={post.imageUrl}
          alt={post.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Dashboard action buttons */}
        {isDashboard && (
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(post);
              }}
              className="p-2 rounded-lg bg-sandlewood/90 hover:bg-sandlewood text-almond backdrop-blur-sm transition-all duration-200 hover:shadow-gold-glow"
              title="Edit post"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                confirmDelete
                  ? "bg-red-700 text-white"
                  : "bg-plum/90 hover:bg-red-900/80 text-almond"
              }`}
              title={confirmDelete ? "Click again to confirm delete" : "Delete post"}
            >
              {deleting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <p className="text-almond font-display font-semibold text-sm truncate">{post.title}</p>
          {post.caption && (
            <p className="text-almond/60 text-xs truncate mt-0.5">{post.caption}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3">
        <h3 className="text-almond font-display font-medium text-sm truncate">{post.title}</h3>
        {post.caption && (
          <p className="text-almond/50 text-xs mt-1 line-clamp-2">{post.caption}</p>
        )}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="tag-badge">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete notice */}
      {confirmDelete && (
        <div className="absolute inset-x-0 bottom-0 bg-red-900/90 text-red-200 text-xs text-center py-2 backdrop-blur-sm">
          Click delete again to confirm
        </div>
      )}
    </div>
  );
};

export default ArtworkCard;
