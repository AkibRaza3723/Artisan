// ─── ProfileEditor ─────────────────────────────────────────────────────────
// Allows the authenticated user to update bio, vision statement, contact info,
// education, and experience from the dashboard sidebar.

import { useState } from "react";
import { authAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ProfileEditor = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    visionStatement: user?.visionStatement || "",
    contactInfo: {
      email: user?.contactInfo?.email || user?.email || "",
      phone: user?.contactInfo?.phone || "",
      instagram: user?.contactInfo?.instagram || "",
      twitter: user?.contactInfo?.twitter || "",
      linkedin: user?.contactInfo?.linkedin || "",
      website: user?.contactInfo?.website || "",
    },
    education: user?.education?.length
      ? user.education
      : [{ institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", current: false }],
    experience: user?.experience?.length
      ? user.experience
      : [{ role: "", organisation: "", description: "", startYear: "", endYear: "", current: false }],
  });

  const handleInput = (field, value) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleContact = (field, value) =>
    setForm((p) => ({ ...p, contactInfo: { ...p.contactInfo, [field]: value } }));

  const handleEduChange = (i, field, value) => {
    const edu = [...form.education];
    edu[i] = { ...edu[i], [field]: value };
    setForm((p) => ({ ...p, education: edu }));
  };

  const handleExpChange = (i, field, value) => {
    const exp = [...form.experience];
    exp[i] = { ...exp[i], [field]: value };
    setForm((p) => ({ ...p, experience: exp }));
  };

  const addEdu = () =>
    setForm((p) => ({
      ...p,
      education: [...p.education, { institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "", current: false }],
    }));

  const addExp = () =>
    setForm((p) => ({
      ...p,
      experience: [...p.experience, { role: "", organisation: "", description: "", startYear: "", endYear: "", current: false }],
    }));

  const removeEdu = (i) =>
    setForm((p) => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  const removeExp = (i) =>
    setForm((p) => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setAvatarFile(f);
      setAvatarPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Upload avatar first if a new one was selected
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const { data } = await authAPI.updateAvatar(fd);
        updateUser({ avatar: data.data.avatar });
      }

      const { data } = await authAPI.updateProfile(form);
      updateUser(data.data);
      setSuccess("Profile saved successfully!");
      setTimeout(() => { setSuccess(""); if (onClose) onClose(); }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "general", label: "General" },
    { key: "contact", label: "Contact" },
    { key: "education", label: "Education" },
    { key: "experience", label: "Experience" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-carbon/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-carbon-light border border-sandlewood/20 rounded-2xl shadow-brand-lg animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sandlewood/10 flex-shrink-0">
          <h2 className="text-lg font-display font-semibold text-almond">Edit Profile</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-almond/40 hover:text-almond hover:bg-sandlewood/10 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-sandlewood/10 flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                activeTab === t.key
                  ? "bg-plum/40 text-almond border border-b-0 border-sandlewood/20"
                  : "text-almond/50 hover:text-almond"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {activeTab === "general" && (
            <>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-sandlewood/30" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-plum border-2 border-sandlewood/30 flex items-center justify-center">
                      <span className="text-almond text-2xl font-display font-bold">{user?.fullName?.[0]}</span>
                    </div>
                  )}
                  <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sandlewood hover:bg-sandlewood-light cursor-pointer transition-all shadow-brand-sm">
                    <svg className="w-3 h-3 text-carbon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <p className="text-almond/60 text-xs">Profile photo</p>
                  <p className="text-almond/30 text-xs mt-0.5">Click the camera icon to change</p>
                </div>
              </div>

              <div>
                <label className="input-label">Full Name</label>
                <input className="input-field" value={form.fullName} onChange={(e) => handleInput("fullName", e.target.value)} />
              </div>
              <div>
                <label className="input-label">Bio <span className="text-almond/30 normal-case tracking-normal font-normal">(max 500 chars)</span></label>
                <textarea className="input-field resize-none" rows={3} value={form.bio} onChange={(e) => handleInput("bio", e.target.value)} maxLength={500} placeholder="Tell your story..." />
              </div>
              <div>
                <label className="input-label">Vision Statement <span className="text-almond/30 normal-case tracking-normal font-normal">(shown on your portfolio)</span></label>
                <textarea className="input-field resize-none" rows={2} value={form.visionStatement} onChange={(e) => handleInput("visionStatement", e.target.value)} maxLength={300} placeholder="What drives your art?" />
              </div>
            </>
          )}

          {activeTab === "contact" && (
            <>
              {["email", "phone", "instagram", "twitter", "linkedin", "website"].map((field) => (
                <div key={field}>
                  <label className="input-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    className="input-field"
                    value={form.contactInfo[field]}
                    onChange={(e) => handleContact(field, e.target.value)}
                    placeholder={field === "instagram" ? "@username" : field === "website" ? "https://..." : ""}
                  />
                </div>
              ))}
            </>
          )}

          {activeTab === "education" && (
            <div className="space-y-4">
              {form.education.map((edu, i) => (
                <div key={i} className="p-4 rounded-xl border border-sandlewood/15 bg-carbon/40 space-y-3 relative">
                  <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 p-1 text-almond/30 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Institution</label>
                      <input className="input-field" value={edu.institution} onChange={(e) => handleEduChange(i, "institution", e.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">Degree</label>
                      <input className="input-field" value={edu.degree} onChange={(e) => handleEduChange(i, "degree", e.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">Field of Study</label>
                      <input className="input-field" value={edu.fieldOfStudy} onChange={(e) => handleEduChange(i, "fieldOfStudy", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="input-label">Start</label>
                        <input type="number" className="input-field" placeholder="2020" value={edu.startYear} onChange={(e) => handleEduChange(i, "startYear", e.target.value)} />
                      </div>
                      <div>
                        <label className="input-label">End</label>
                        <input type="number" className="input-field" placeholder="2024" value={edu.endYear} disabled={edu.current} onChange={(e) => handleEduChange(i, "endYear", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={edu.current} onChange={(e) => handleEduChange(i, "current", e.target.checked)} className="w-4 h-4 accent-sandlewood" />
                    <span className="text-almond/60 text-sm">Currently studying here</span>
                  </label>
                </div>
              ))}
              <button type="button" onClick={addEdu} className="btn-secondary w-full text-sm">
                + Add Education
              </button>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-4">
              {form.experience.map((exp, i) => (
                <div key={i} className="p-4 rounded-xl border border-sandlewood/15 bg-carbon/40 space-y-3 relative">
                  <button onClick={() => removeExp(i)} className="absolute top-3 right-3 p-1 text-almond/30 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="input-label">Role</label>
                      <input className="input-field" value={exp.role} onChange={(e) => handleExpChange(i, "role", e.target.value)} />
                    </div>
                    <div>
                      <label className="input-label">Organisation</label>
                      <input className="input-field" value={exp.organisation} onChange={(e) => handleExpChange(i, "organisation", e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="input-label">Description</label>
                      <textarea className="input-field resize-none" rows={2} value={exp.description} onChange={(e) => handleExpChange(i, "description", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="input-label">Start</label>
                        <input type="number" className="input-field" placeholder="2022" value={exp.startYear} onChange={(e) => handleExpChange(i, "startYear", e.target.value)} />
                      </div>
                      <div>
                        <label className="input-label">End</label>
                        <input type="number" className="input-field" placeholder="2024" value={exp.endYear} disabled={exp.current} onChange={(e) => handleExpChange(i, "endYear", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={exp.current} onChange={(e) => handleExpChange(i, "current", e.target.checked)} className="w-4 h-4 accent-sandlewood" />
                    <span className="text-almond/60 text-sm">Currently working here</span>
                  </label>
                </div>
              ))}
              <button type="button" onClick={addExp} className="btn-secondary w-full text-sm">
                + Add Experience
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-sandlewood/10 flex items-center justify-between gap-4">
          {error && <p className="text-red-400 text-sm flex-1">{error}</p>}
          {success && <p className="text-green-400 text-sm flex-1">{success}</p>}
          {!error && !success && <div className="flex-1" />}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary text-sm px-5 py-2">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary text-sm px-5 py-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-almond/30 border-t-almond rounded-full animate-spin" />
                  Saving...
                </>
              ) : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
