import { useEffect } from "react";

const ArtworkModal = ({ post, onClose }) => {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-carbon/95 backdrop-blur-lg animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-almond/60 hover:text-almond bg-carbon/50 hover:bg-carbon rounded-full transition-colors z-50"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="w-full max-w-6xl max-h-[90vh] bg-carbon border border-sandlewood/20 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="w-full md:w-3/5 bg-carbon-dark flex items-center justify-center relative min-h-[40vh] md:min-h-0 border-b md:border-b-0 md:border-r border-sandlewood/10 p-4">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-contain max-h-[50vh] md:max-h-[85vh] rounded-lg"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/5 p-6 md:p-10 flex flex-col overflow-y-auto max-h-[40vh] md:max-h-[90vh]">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-almond mb-2">
            {post.title}
          </h2>
          <p className="text-sandlewood/70 text-xs font-mono uppercase tracking-widest mb-6 border-b border-sandlewood/10 pb-4">
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {post.caption ? (
            <div className="text-almond/80 text-sm leading-relaxed mb-8 whitespace-pre-wrap">
              {post.caption}
            </div>
          ) : (
            <p className="text-almond/30 italic text-sm mb-8">No description provided.</p>
          )}

          {post.tags?.length > 0 && (
            <div className="mt-auto pt-8 border-t border-sandlewood/10">
              <h3 className="text-almond/50 text-xs uppercase tracking-widest font-semibold mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 text-xs rounded-lg bg-sandlewood/10 text-sandlewood border border-sandlewood/20 hover:bg-sandlewood/20 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtworkModal;
