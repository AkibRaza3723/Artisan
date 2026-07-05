// ─── WorkUploadModal ───────────────────────────────────────────────────────
// Modal for creating/editing a post. Handles drag-and-drop + file picker.
// In create mode: uploads via multipart form. In edit mode: updates text only.

import { useState, useRef, useCallback } from "react";
import { postsAPI } from "../services/api.js";

const WorkUploadModal = ({ onClose, onSuccess, editPost = null }) => {
  const isEdit = !!editPost;
  const [title, setTitle] = useState(editPost?.title || "");
  const [caption, setCaption] = useState(editPost?.caption || "");
  const [tags, setTags] = useState(editPost?.tags?.join(", ") || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(editPost?.imageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) { setError("Title is required."); return; }
    if (!isEdit && !file) { setError("Please select an image."); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await postsAPI.updatePost(editPost._id, {
          title,
          caption,
          tags,
        });
      } else {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("caption", caption);
        formData.append("tags", tags);
        await postsAPI.createPost(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-carbon/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-carbon-light border border-sandlewood/20 rounded-2xl shadow-brand-lg animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sandlewood/10">
          <h2 className="text-lg font-display font-semibold text-almond">
            {isEdit ? "Edit Artwork" : "Upload Artwork"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-almond/40 hover:text-almond hover:bg-sandlewood/10 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Drop Zone (create mode only) */}
          {!isEdit && (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden ${
                isDragging
                  ? "border-sandlewood bg-sandlewood/10"
                  : "border-sandlewood/20 hover:border-sandlewood/50 hover:bg-sandlewood/5"
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-12 h-12 rounded-xl bg-plum/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-sandlewood/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-almond/60 text-sm">Drag & drop or <span className="text-sandlewood underline">browse</span></p>
                    <p className="text-almond/30 text-xs mt-1">JPEG, PNG, WebP up to 10MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          )}

          {/* Edit mode preview */}
          {isEdit && preview && (
            <div className="rounded-xl overflow-hidden border border-sandlewood/20">
              <img src={preview} alt="Current" className="w-full h-36 object-cover" />
              <p className="text-xs text-almond/30 text-center py-2">Image cannot be changed after upload</p>
            </div>
          )}

          {/* Fields */}
          <div>
            <label className="input-label">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Reverie"
              className="input-field"
              maxLength={120}
            />
          </div>

          <div>
            <label className="input-label">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="A short description of your work..."
              rows={3}
              className="input-field resize-none"
              maxLength={300}
            />
          </div>

          <div>
            <label className="input-label">Tags <span className="text-almond/30 normal-case tracking-normal font-normal">(comma separated)</span></label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="illustration, digital, abstract"
              className="input-field"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-900/30 border border-red-800/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-almond/30 border-t-almond rounded-full animate-spin" />
                  {isEdit ? "Saving..." : "Uploading..."}
                </>
              ) : (
                isEdit ? "Save Changes" : "Upload Artwork"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkUploadModal;
