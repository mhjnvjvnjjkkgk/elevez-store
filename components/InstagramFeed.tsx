import React, { useState, useEffect } from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';

export const InstagramFeed: React.FC = () => {
  const fallbackPosts = [
    {
      id: "fallback-1",
      image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=400&h=400",
      likes: "1.2k",
      comments: "84",
      caption: "CYBERPUNK HOODIE DROP NOW ONLINE. SECURE THE NEON. ⚡🖤",
      permalink: "https://instagram.com"
    },
    {
      id: "fallback-2",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=400&h=400",
      likes: "2.1k",
      comments: "142",
      caption: "VIRTUAL AESTHETICS MEET REAL STREETS. SHOT ON LOCATION. 🤖🔥",
      permalink: "https://instagram.com"
    },
    {
      id: "fallback-3",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400&h=400",
      likes: "1.8k",
      comments: "97",
      caption: "THE METAVERSE IS TO WEAR. DISCOVER THE NEXT DIMENSION OF FASHION.",
      permalink: "https://instagram.com"
    },
    {
      id: "fallback-4",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400&h=400",
      likes: "942",
      comments: "53",
      caption: "DETAIL RUN: PREMIUM DOUBLE-STITCHED HEM & RAW EDGE DETAILS.",
      permalink: "https://instagram.com"
    },
    {
      id: "fallback-5",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=400&h=400",
      likes: "3.1k",
      comments: "256",
      caption: "LIMITED RE-STOCK ALERT. GRAB YOUR GRAPHIC TS BEFORE THEY ARE GONE.",
      permalink: "https://instagram.com"
    },
    {
      id: "fallback-6",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400&h=400",
      likes: "1.5k",
      comments: "109",
      caption: "STAY BOLD. STAY UNFILTERED. CHOOSE ELEVEZ. 🦾💎",
      permalink: "https://instagram.com"
    }
  ];

  const [posts, setPosts] = useState<any[]>(fallbackPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      try {
        const { initializeApp, getApps, getApp } = await import('firebase/app');
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const { firebaseConfig } = await import('../firebaseConfig');
        
        let app;
        if (getApps().length > 0) {
          app = getApp();
        } else {
          app = initializeApp(firebaseConfig);
        }
        
        const db = getFirestore(app);
        const settingsSnap = await getDoc(doc(db, 'settings', 'instagram'));
        
        if (settingsSnap.exists()) {
          const { feedUrl } = settingsSnap.data();
          if (feedUrl) {
            const response = await fetch(feedUrl);
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped = data.slice(0, 6).map((post: any) => ({
                id: post.id,
                image: post.mediaUrl || post.thumbnailUrl,
                likes: post.likeCount !== undefined ? String(post.likeCount) : String(Math.floor(Math.random() * 500) + 100),
                comments: post.commentsCount !== undefined ? String(post.commentsCount) : String(Math.floor(Math.random() * 50) + 10),
                caption: post.caption || '',
                permalink: post.permalink || 'https://instagram.com'
              }));
              setPosts(mapped);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching live Instagram feed, using fallback mock posts:', err);
      }
      setPosts(fallbackPosts);
      setLoading(false);
    };

    fetchInstagramFeed();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('INSTAFOLLOW15');
    alert('Coupon code "INSTAFOLLOW15" copied to clipboard! Paste it at checkout to get ₹15 OFF.');
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
              Join the crew on Instagram @elevez.studio to stay updated on drops and secure ₹15 discount on your order today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Copy code button */}
            <button
              onClick={handleCopyCode}
              className="bg-white text-black px-6 py-3 border-[3px] border-black font-black uppercase text-[11px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer text-center"
            >
              Copy Code: INSTAFOLLOW15
            </button>
            {/* Link to Instagram page */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-[#00ff88] px-6 py-3 border-[3px] border-black font-black uppercase text-[11px] tracking-widest shadow-[3px_3px_0px_0px_#00ff88] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Instagram size={14} />
              Follow @elevez.studio
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        ) : (
          /* 6 Grid items */
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
                  alt={`Instagram Post ${post.id}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ imageRendering: 'high-quality' }}
                />
                
                {/* Overlay with details */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                  <div className="flex items-center justify-between">
                    <Instagram size={16} className="text-[#00ff88]" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">@elevez.studio</span>
                  </div>
                  
                  <p className="text-[9px] font-bold uppercase tracking-tight text-white line-clamp-3 leading-snug">
                    {post.caption}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-black pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1 text-[#ff0055]">
                      <Heart size={12} fill="#ff0055" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-[#00ff88]">
                      <MessageCircle size={12} fill="#00ff88" />
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
