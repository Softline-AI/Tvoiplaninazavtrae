import React, { useState } from 'react';
import { Crown, Users, MessageCircle, TrendingUp, Star, ExternalLink } from 'lucide-react';

interface CommunityMember {
  id: string;
  username: string;
  avatar: string;
  tier: 'legend' | 'pro' | 'elite';
  reputation: number;
  totalReturn: string;
  followers: number;
  posts: number;
  joinedDate: string;
  isOnline: boolean;
  badges: string[];
}

interface CommunityPost {
  id: string;
  author: CommunityMember;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  isAlpha: boolean;
}

const LegendCommunity: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [filter, setFilter] = useState('all');

  const members: CommunityMember[] = [
    {
      id: '1',
      username: 'SolanaWhaleKing',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      tier: 'legend',
      reputation: 9850,
      totalReturn: '+456.7%',
      followers: 2340,
      posts: 156,
      joinedDate: 'Jan 2024',
      isOnline: true,
      badges: ['Alpha Hunter', 'Whale Spotter', 'DeFi Expert']
    },
    {
      id: '2',
      username: 'DeFiAlphaMaster',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=56&h=56&dpr=1',
      tier: 'legend',
      reputation: 8920,
      totalReturn: '+234.1%',
      followers: 1890,
      posts: 203,
      joinedDate: 'Feb 2024',
      isOnline: false,
      badges: ['Strategy Master', 'Risk Manager']
    }
  ];

  const posts: CommunityPost[] = [
    {
      id: '1',
      author: members[0],
      content: 'Just spotted massive accumulation in $JUP by three different whale wallets. This could be the setup we\'ve been waiting for. Check the on-chain data - volume is spiking but price hasn\'t moved yet. 👀',
      timestamp: '2 hours ago',
      likes: 45,
      comments: 12,
      tags: ['JUP', 'WhaleAlert', 'Alpha'],
      isAlpha: true
    },
    {
      id: '2',
      author: members[1],
      content: 'New DCA strategy showing 89% win rate over 30 days. Sharing the full breakdown with Legend members. The key is timing entries during low volatility periods.',
      timestamp: '4 hours ago',
      likes: 67,
      comments: 23,
      tags: ['DCA', 'Strategy', 'WinRate'],
      isAlpha: false
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'legend':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'pro':
        return 'text-purple-500 bg-purple-500/10';
      case 'elite':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-white/70 bg-white/10';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'legend':
        return <Crown className="w-4 h-4" />;
      case 'pro':
        return <Star className="w-4 h-4" />;
      case 'elite':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full mx-auto max-w-screen-xl px-0 md:px-10 py-5 relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
        style={{ mixBlendMode: 'screen' }}
      >
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          video.currentTime = 0.1;
        }}
        <source src="https://i.imgur.com/sg6HXew.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl mb-1 font-semibold text-white flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          Legend Community
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-noir-dark border border-white/20 rounded-xl p-1">
        {[
          { id: 'feed', label: 'Alpha Feed', icon: <MessageCircle className="w-4 h-4" /> },
          { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
          { id: 'leaderboard', label: 'Leaderboard', icon: <TrendingUp className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-noir-black'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alpha Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Post Filters */}
          <div className="flex items-center gap-4">
            <div className="flex h-fit gap-1 items-center flex-nowrap rounded-xl bg-noir-dark border border-white/20 p-1">
              {['all', 'alpha', 'strategies', 'alerts'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    filter === filterType
                      ? 'bg-white text-noir-black'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="noir-card rounded-xl p-6">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={post.author.avatar}
                        alt={post.author.username}
                        className="w-10 h-10 rounded-full border-2 border-white/30"
                      />
                      {post.author.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-noir-dark"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{post.author.username}</span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(post.author.tier)}`}>
                          {getTierIcon(post.author.tier)}
                          {post.author.tier.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-xs text-white/70">{post.timestamp}</div>
                    </div>
                  </div>
                  {post.isAlpha && (
                    <div className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-xs font-bold">
                      🔥 ALPHA
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-white leading-relaxed">{post.content}</p>
                </div>

                {/* Post Tags */}
                <div className="flex items-center gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-noir-dark text-white/70 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors">
                      <TrendingUp className="w-4 h-4" />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </button>
                  </div>
                  <button className="text-sm text-white/70 hover:text-white transition-colors">
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="noir-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.username}
                      className="w-12 h-12 rounded-full border-2 border-white/30"
                    />
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-noir-dark"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-white">{member.username}</span>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(member.tier)}`}>
                        {getTierIcon(member.tier)}
                        {member.tier.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span>{member.followers} followers</span>
                      <span>•</span>
                      <span>{member.posts} posts</span>
                      <span>•</span>
                      <span>Joined {member.joinedDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 mb-1">{member.totalReturn}</div>
                  <div className="text-sm text-white/70">{member.reputation} reputation</div>
                </div>
              </div>

              {/* Member Badges */}
              <div className="flex items-center gap-2 mt-4">
                {member.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-noir-dark text-white/70 rounded text-xs"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="noir-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-noir-dark border-b border-white/20">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Member
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Total Return
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Reputation
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold text-white tracking-wider">
                    Followers
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {members.map((member, index) => (
                  <tr key={member.id} className="transition-all duration-300 hover:bg-white/5">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-base font-bold text-white mr-2">#{index + 1}</span>
                        {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.username}
                          className="w-8 h-8 rounded-full border border-white/30"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{member.username}</div>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(member.tier)}`}>
                            {getTierIcon(member.tier)}
                            {member.tier.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-base font-bold text-green-600">{member.totalReturn}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-base font-bold text-white">{member.reputation.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-base font-bold text-white">{member.followers.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LegendCommunity;