"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import type {
  PostWithAuthor,
  CommentWithAuthor,
  ReactionType,
  EmbeddedMedia,
} from "@/lib/supabase/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface PostsResponse {
  posts: PostWithAuthor[];
  pagination: Pagination;
}

interface PostResponse {
  post: PostWithAuthor;
}

interface CommentsResponse {
  comments: CommentWithAuthor[];
}

// ============================================
// usePosts - Fetch posts with pagination
// ============================================

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(
          `/api/discussion/posts?page=${page}&limit=20`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data: PostsResponse = await response.json();

        if (append) {
          setPosts((prev) => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts);
        }
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch posts"));
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !isLoading) {
      fetchPosts(pagination.page + 1, true);
    }
  }, [fetchPosts, pagination.hasMore, pagination.page, isLoading]);

  const createPost = useCallback(
    async (body: string, imageUrls: string[] = [], embeddedMedia: EmbeddedMedia[] = []) => {
      const response = await fetch("/api/discussion/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          image_urls: imageUrls,
          embedded_media: embeddedMedia,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      const data: PostResponse = await response.json();
      // Add new post to the beginning of the list
      setPosts((prev) => [data.post, ...prev]);
      return data.post;
    },
    []
  );

  const updatePost = useCallback(
    async (postId: string, updates: { body?: string; image_urls?: string[]; embedded_media?: EmbeddedMedia[] }) => {
      const response = await fetch(`/api/discussion/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
      }

      const data: PostResponse = await response.json();
      // Update the post in the list
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? data.post : p))
      );
      return data.post;
    },
    []
  );

  const deletePost = useCallback(async (postId: string) => {
    const response = await fetch(`/api/discussion/posts/${postId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete post");
    }

    // Remove post from list
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    hasMore: pagination.hasMore,
    loadMore,
    createPost,
    updatePost,
    deletePost,
    refresh: () => fetchPosts(1, false),
  };
}

// ============================================
// usePost - Fetch single post with comments
// ============================================

export function usePost(postId: string) {
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPost = useCallback(async () => {
    if (!user || !postId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch post and comments in parallel
      const [postResponse, commentsResponse] = await Promise.all([
        fetch(`/api/discussion/posts/${postId}`),
        fetch(`/api/discussion/posts/${postId}/comments`),
      ]);

      if (!postResponse.ok) {
        throw new Error("Failed to fetch post");
      }

      const postData: PostResponse = await postResponse.json();
      setPost(postData.post);

      if (commentsResponse.ok) {
        const commentsData: CommentsResponse = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch post"));
    } finally {
      setIsLoading(false);
    }
  }, [user, postId]);

  const addComment = useCallback(
    async (body: string, parentId?: string, imageUrls: string[] = []) => {
      const response = await fetch(`/api/discussion/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          parent_id: parentId,
          image_urls: imageUrls,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add comment");
      }

      // Refresh comments
      const commentsResponse = await fetch(`/api/discussion/posts/${postId}/comments`);
      if (commentsResponse.ok) {
        const commentsData: CommentsResponse = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }

      // Update comment count on post
      if (post) {
        setPost({ ...post, comment_count: post.comment_count + 1 });
      }
    },
    [postId, post]
  );

  const updatePost = useCallback(
    async (updates: { body?: string; image_urls?: string[]; embedded_media?: EmbeddedMedia[] }) => {
      const response = await fetch(`/api/discussion/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
      }

      const data: PostResponse = await response.json();
      setPost(data.post);
      return data.post;
    },
    [postId]
  );

  const deletePost = useCallback(async () => {
    const response = await fetch(`/api/discussion/posts/${postId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete post");
    }

    setPost(null);
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return {
    post,
    comments,
    isLoading,
    error,
    addComment,
    updatePost,
    deletePost,
    refresh: fetchPost,
  };
}

// ============================================
// useReaction - Handle post/comment reactions
// ============================================

export function useReaction() {
  const [isLoading, setIsLoading] = useState(false);

  const react = useCallback(
    async (
      type: ReactionType,
      postId?: string,
      commentId?: string
    ): Promise<ReactionType | null> => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/discussion/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reaction_type: type,
            post_id: postId,
            comment_id: commentId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to react");
        }

        const data = await response.json();
        return data.reaction?.reaction_type || null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const unreact = useCallback(
    async (postId?: string, commentId?: string): Promise<void> => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (postId) params.set("post_id", postId);
        if (commentId) params.set("comment_id", commentId);

        const response = await fetch(`/api/discussion/reactions?${params}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to remove reaction");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { react, unreact, isLoading };
}
