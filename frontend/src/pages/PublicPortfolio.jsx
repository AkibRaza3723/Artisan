// ─── PublicPortfolio Page ──────────────────────────────────────────────────
// Read-only public-facing portfolio for any artist. Accessible via
// /portfolio/:username — no authentication required.

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { authAPI, postsAPI } from "../services/api.js";
import ArtworkGrid from "../components/ArtworkGrid.jsx";

const PublicPortfolio = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeSection, setActiveSection] = useState("work");

  const fetchPosts = async (page = 1) => {
    setLoadingPosts(true);
    try {
      const { data } = await postsAPI.getPublicPosts(username, page, 12);
      setPosts(data.data.posts);
      setPagination(data.data.pagination);
    } catch {
      // silence — profile not found is handled by fetchProfile
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authAPI.getPublicProfile(username);
        setProfile(data.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-carbon flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-sandlewood/30 border-t-sandlewood animate-spin" />
          <p className="text-almond/30 text-sm uppercase tracking-widest">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-carbon flex flex-col items-center justify-center gap-6 px-4 animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-plum/20 border border-sandlewood/20 flex items-center justify-center">
          <span className="text-5xl font-display text-sandlewood/40">?</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-almond mb-2">Portfolio Not Found</h1>
          <p className="text-almond/40 text-sm">No artist with the username <span className="text-sandlewood">@{username}</span> exists.</p>
        </div>
        <Link to="/" className="btn-secondary">Go Home</Link>
      </div>
    );
  }

  const sections = ["work", "about", "education", "experience", "contact"];

  return (
    <div className="min-h-screen bg-carbon">
      {/* Hero */}
      <div className="relative overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-plum/30 via-carbon to-carbon" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sandlewood/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.fullName}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-2 border-sandlewood/30 shadow-brand-lg"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-brand border-2 border-sandlewood/30 shadow-brand-lg flex items-center justify-center">
                  <span className="text-almond text-5xl font-display font-bold">
                    {profile?.fullName?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-sandlewood text-sm font-mono uppercase tracking-widest mb-2">
                @{profile?.username}
              </p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-almond leading-tight">
                {profile?.fullName}
              </h1>
              {profile?.visionStatement && (
                <p className="text-xl md:text-2xl text-almond/50 font-display italic mt-4 leading-relaxed">
                  &ldquo;{profile.visionStatement}&rdquo;
                </p>
              )}
              {profile?.bio && (
                <p className="text-almond/60 text-sm mt-4 leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-display font-bold text-almond">{pagination.total}</p>
                  <p className="text-almond/30 text-xs uppercase tracking-wider">Artworks</p>
                </div>
                {profile?.education?.length > 0 && (
                  <div className="text-center md:text-left">
                    <p className="text-2xl font-display font-bold text-almond">{profile.education.length}</p>
                    <p className="text-almond/30 text-xs uppercase tracking-wider">Education</p>
                  </div>
                )}
                {profile?.experience?.length > 0 && (
                  <div className="text-center md:text-left">
                    <p className="text-2xl font-display font-bold text-almond">{profile.experience.length}</p>
                    <p className="text-almond/30 text-xs uppercase tracking-wider">Experiences</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Tab Nav */}
      <div className="sticky top-16 z-40 bg-carbon/90 backdrop-blur-md border-y border-sandlewood/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`px-5 py-3 text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeSection === sec
                    ? "text-almond border-sandlewood"
                    : "text-almond/40 border-transparent hover:text-almond/70"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Work */}
        {activeSection === "work" && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h2 className="section-title">Artwork Gallery</h2>
              <p className="section-subtitle mt-1">{pagination.total} piece{pagination.total !== 1 ? "s" : ""}</p>
            </div>
            <ArtworkGrid
              posts={posts}
              isLoading={loadingPosts}
              isDashboard={false}
              emptyMessage={`${profile?.fullName} hasn't posted any artwork yet.`}
            />
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
        )}

        {/* About */}
        {activeSection === "about" && (
          <div className="max-w-2xl animate-fade-in">
            <h2 className="section-title mb-6">About</h2>
            {profile?.bio ? (
              <p className="text-almond/70 leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-almond/30 italic">No bio available.</p>
            )}
            {profile?.visionStatement && (
              <blockquote className="mt-8 pl-4 border-l-2 border-sandlewood">
                <p className="text-almond/60 italic font-display text-lg">&ldquo;{profile.visionStatement}&rdquo;</p>
              </blockquote>
            )}
          </div>
        )}

        {/* Education */}
        {activeSection === "education" && (
          <div className="max-w-2xl animate-fade-in">
            <h2 className="section-title mb-6">Education</h2>
            {profile?.education?.length > 0 ? (
              <div className="space-y-4">
                {profile.education.map((edu, i) => (
                  <div key={i} className="card border-sandlewood/15">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-almond font-semibold font-display">{edu.degree}</h3>
                        <p className="text-sandlewood text-sm mt-0.5">{edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-almond/50 text-sm">{edu.fieldOfStudy}</p>
                        )}
                      </div>
                      <span className="text-almond/30 text-xs font-mono flex-shrink-0 ml-4">
                        {edu.startYear && `${edu.startYear} — `}{edu.current ? "Present" : edu.endYear}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-almond/30 italic">No education listed.</p>
            )}
          </div>
        )}

        {/* Experience */}
        {activeSection === "experience" && (
          <div className="max-w-2xl animate-fade-in">
            <h2 className="section-title mb-6">Experience</h2>
            {profile?.experience?.length > 0 ? (
              <div className="space-y-4">
                {profile.experience.map((exp, i) => (
                  <div key={i} className="card border-sandlewood/15">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-almond font-semibold font-display">{exp.role}</h3>
                        <p className="text-sandlewood text-sm mt-0.5">{exp.organisation}</p>
                        {exp.description && (
                          <p className="text-almond/50 text-sm mt-2 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                      <span className="text-almond/30 text-xs font-mono flex-shrink-0 ml-4">
                        {exp.startYear && `${exp.startYear} — `}{exp.current ? "Present" : exp.endYear}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-almond/30 italic">No experience listed.</p>
            )}
          </div>
        )}

        {/* Contact */}
        {activeSection === "contact" && (
          <div className="max-w-md animate-fade-in">
            <h2 className="section-title mb-6">Contact</h2>
            {profile?.contactInfo && Object.values(profile.contactInfo).some(Boolean) ? (
              <div className="card border-sandlewood/15 space-y-3">
                {profile.contactInfo.email && (
                  <a href={`mailto:${profile.contactInfo.email}`} className="flex items-center gap-3 text-almond/70 hover:text-almond transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-plum/30 flex items-center justify-center group-hover:bg-plum/50 transition-colors">
                      <svg className="w-4 h-4 text-sandlewood" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="text-sm">{profile.contactInfo.email}</span>
                  </a>
                )}
                {profile.contactInfo.phone && (
                  <div className="flex items-center gap-3 text-almond/60">
                    <div className="w-8 h-8 rounded-lg bg-plum/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-sandlewood" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <span className="text-sm">{profile.contactInfo.phone}</span>
                  </div>
                )}
                {profile.contactInfo.website && (
                  <a href={profile.contactInfo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-almond/70 hover:text-almond transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-plum/30 flex items-center justify-center group-hover:bg-plum/50 transition-colors">
                      <svg className="w-4 h-4 text-sandlewood" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                    <span className="text-sm truncate">{profile.contactInfo.website}</span>
                  </a>
                )}
                {profile.contactInfo.instagram && (
                  <a href={`https://instagram.com/${profile.contactInfo.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-almond/70 hover:text-almond transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-plum/30 flex items-center justify-center group-hover:bg-plum/50 transition-colors">
                      <span className="text-sandlewood text-xs font-bold">IG</span>
                    </div>
                    <span className="text-sm">{profile.contactInfo.instagram}</span>
                  </a>
                )}
                {profile.contactInfo.linkedin && (
                  <a href={`https://linkedin.com/in/${profile.contactInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-almond/70 hover:text-almond transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-plum/30 flex items-center justify-center group-hover:bg-plum/50 transition-colors">
                      <span className="text-sandlewood text-xs font-bold">in</span>
                    </div>
                    <span className="text-sm">{profile.contactInfo.linkedin}</span>
                  </a>
                )}
              </div>
            ) : (
              <p className="text-almond/30 italic">No contact information listed.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-sandlewood/10 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-almond/20 text-xs">
            Powered by{" "}
            <span className="text-sandlewood/60">Artisans&apos; Canvas</span>
            {" "}— Built for creatives
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPortfolio;
