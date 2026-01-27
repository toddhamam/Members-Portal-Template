"use client";

import { PostFeed } from "@/components/discussion/PostFeed";

export default function CommunityPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#222222]">Community</h1>
        <p className="text-[#6b7280] mt-1">
          Connect with fellow members, share insights, and ask questions.
        </p>
      </div>

      {/* Post Feed */}
      <PostFeed />
    </div>
  );
}
