import React, { useState, useEffect } from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink, Sparkles, Play } from 'lucide-react';

const BEHOLD_FEED_URL = 'https://feeds.behold.so/mYszQvwrAFMUJbxK2R0p';

interface InstaPost {
  id: string;
  image: string;
  likes: string;
  comments: string;
  caption: string;
  permalink: string;
  isReel: boolean;
}

export const InstagramFeed: React.FC = () => {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch(BEHOLD_FEED_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Behold returns { posts: [...] }
        const rawPosts: any[] = Array.isArray(data) ? data : (data.posts ?? []);

        if (rawPosts.length > 0) {
          const mapped: InstaPost[] = rawPosts.slice(0, 6).map((p: any) => ({
            id: p.id,
            // Always prefer Behold CDN proxy image (works for reels/carousels too)
            image:
              p.sizes?.medium?.mediaUrl ||
              p.sizes?.small?.mediaUrl ||
              p.thumbnailUrl ||
              p.mediaUrl ||
              '',
            likes:
              p.likeCount !== undefined
                ? p.likeCount >= 1000
                  ? `${(p.likeCount / 1000).toFixed(1)}k`
                  : String(p.likeCount)
                : '—',
            comments:
              p.commentsCount !== undefined ? String(p.commentsCount) : '—',
            caption: (p.prunedCaption || p.caption || '').slice(0, 120),
            permalink: p.permalink || 'https://www.instagram.com/elevezdotshop',
            isReel: p.isReel === true || p.mediaType === 'VIDEO',
          }));
          setPosts(mapped);
        }
      } catch (err) {
        console.warn('Behold feed error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('INSTAFOLLOW15').catch(() => {});
    alert('Code "INSTAFOLLOW15" copied! Use it at checkout for ₹15 OFF.');
  };

  return (
    <section className="bg-white border-t-[8px] border-black pt-14 pb-14 relative z-10 text-black">
      <div className="container mx-auto px-4 sm:px-6">

        {/* ── Header banner ── */}
        <div className="bg-[#00ff88] border-[5px] border-black p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[10px_10px_0px_0px_#000] mb-12">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-black text-[#00ff88] px-3 py-1 text-[9px] font-black uppercase tracking-wider">
              <Sparkles size={10} />
              Exclusive Follow Reward
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
              FOLLOW US ON INSTAGRAM FOR <span className="underline">₹15 OFF</span>!
            </h2>
            <p className="text-xs font-bold uppercase text-black/70 max-w-xl leading-relaxed">
              Follow @elevezdotshop and use the code below at checkout to grab ₹15 off your order instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleCopyCode}
              className="bg-white text-black px-5 py-3 border-[3px] border-black font-black uppercase text-[11px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer text-center"
            >
              Copy Code: INSTAFOLLOW15
            </button>
            <a
              href="https://www.instagram.com/elevezdotshop"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-[#00ff88] px-5 py-3 border-[3px] border-black font-black uppercase text-[11px] tracking-widest shadow-[3px_3px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Instagram size={14} />
              Follow @elevezdotshop
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* ── Section title ── */}
        <div className="flex items-center gap-4 mb-8">
          <Instagram size={20} className="text-black" />
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-black">Latest from @elevezdotshop</h3>
        </div>

        {/* ── Post grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-black/40 font-bold uppercase text-sm tracking-widest">
            No posts yet — check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-200 overflow-hidden"
              >
                {/* Image area */}
                <div className="relative aspect-square bg-zinc-100 overflow-hidden">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt="@elevezdotshop"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-200">
                      <Instagram size={40} className="text-zinc-400" />
                    </div>
                  )}

                  {/* Reel badge */}
                  {post.isReel && (
                    <div className="absolute top-2 left-2 bg-black/80 text-white flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-wider">
                      <Play size={9} fill="white" />
                      Reel
                    </div>
                  )}

                  {/* Hover overlay with stats */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                    <span className="flex items-center gap-1.5 text-white font-black text-sm">
                      <Heart size={16} fill="white" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5 text-white font-black text-sm">
                      <MessageCircle size={16} fill="white" />
                      {post.comments}
                    </span>
                  </div>
                </div>

                {/* Always-visible info strip */}
                <div className="p-3 border-t-[2px] border-black bg-white">
                  {/* Likes + comments row */}
                  <div className="flex items-center gap-4 mb-2">
                    <span className="flex items-center gap-1 text-[11px] font-black text-black">
                      <Heart size={12} fill="#ff0055" className="text-[#ff0055]" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-black text-black">
                      <MessageCircle size={12} className="text-black" />
                      {post.comments}
                    </span>
                    <span className="ml-auto text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                      @elevezdotshop
                    </span>
                  </div>

                  {/* Caption */}
                  {post.caption && (
                    <p className="text-[11px] text-zinc-600 leading-snug line-clamp-2">
                      {post.caption}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* ── View more link ── */}
        {posts.length > 0 && (
          <div className="mt-10 text-center">
            <a
              href="https://www.instagram.com/elevezdotshop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-[#00ff88] px-8 py-3 border-[3px] border-black font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Instagram size={14} />
              View All Posts on Instagram
              <ExternalLink size={12} />
            </a>
          </div>
        )}

      </div>
    </section>
  );
};
