import React, { useState, useEffect } from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';

// Behold.so feed URL — hardcoded for reliability
const BEHOLD_FEED_URL = 'https://feeds.behold.so/mYszQvwrAFMUJbxK2R0p';

export const InstagramFeed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      try {
        const response = await fetch(BEHOLD_FEED_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Behold returns an object with a `posts` array
        const rawPosts: any[] = Array.isArray(data) ? data : (data.posts ?? []);

        if (rawPosts.length > 0) {
          const mapped = rawPosts.slice(0, 6).map((post: any) => ({
            id: post.id,
            // Use Behold CDN thumbnail for images & reels (avoids broken mp4 in <img>)
            image:
              post.sizes?.medium?.mediaUrl ||
              post.sizes?.small?.mediaUrl ||
              post.thumbnailUrl ||
              post.mediaUrl,
            likes:
              post.likeCount !== undefined
                ? String(post.likeCount)
                : String(Math.floor(Math.random() * 500) + 100),
            comments:
              post.commentsCount !== undefined
                ? String(post.commentsCount)
                : String(Math.floor(Math.random() * 50) + 10),
            caption: post.prunedCaption || post.caption || '',
            permalink: post.permalink || 'https://instagram.com/elevezdotshop',
          }));
          setPosts(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Error fetching Behold Instagram feed:', err);
      }
      setLoading(false);
    };

    fetchInstagramFeed();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('INSTAFOLLOW15');
    alert('Coupon code "INSTAFOLLOW15" copied! Paste it at checkout for ₹15 OFF.');
  };

  return (
    <section className="bg-white border-t-[8px] border-black pt-16 pb-8 relative z-10 text-black">
      <div className="container mx-auto px-6">

        {/* Banner with Follow CTA & Discount promo */}
        <div className="bg-[#00ff88] border-[5px] border-black p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[10px_10px_0px_0px_#000] mb-12">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-black text-[#00ff88] px-3 py-1 text-[9px] font-black uppercase tracking-wider">
              <Sparkles size={10} />
              Exclusive Follow Reward
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase font-syne tracking-wide">
              FOLLOW US ON INSTAGRAM FOR <span className="underline">₹15 OFF</span>!
            </h2>
            <p className="text-xs font-bold uppercase text-black/75 max-w-2xl leading-relaxed">
              Join the crew on Instagram @elevezdotshop to stay updated on drops and secure ₹15 discount on your order today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleCopyCode}
              className="bg-white text-black px-6 py-3 border-[3px] border-black font-black uppercase text-[11px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer text-center"
            >
              Copy Code: INSTAFOLLOW15
            </button>
            <a
              href="https://www.instagram.com/elevezdotshop"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-[#00ff88] px-6 py-3 border-[3px] border-black font-black uppercase text-[11px] tracking-widest shadow-[3px_3px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Instagram size={14} />
              Follow @elevezdotshop
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-black/40 font-bold uppercase text-sm">
            No posts found — check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {posts.map(post => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square border-[3px] border-black bg-zinc-100 overflow-hidden shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <img
                  src={post.image}
                  alt={`@elevezdotshop post`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                  <div className="flex items-center justify-between">
                    <Instagram size={14} className="text-[#00ff88]" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">@elevezdotshop</span>
                  </div>

                  <p className="text-[9px] font-bold uppercase tracking-tight text-white line-clamp-3 leading-snug">
                    {post.caption}
                  </p>

                  <div className="flex items-center gap-3 text-xs font-black pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1 text-[#ff0055]">
                      <Heart size={11} fill="#ff0055" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-[#00ff88]">
                      <MessageCircle size={11} fill="#00ff88" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
