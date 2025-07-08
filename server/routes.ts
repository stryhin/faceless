import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get feed posts
  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get user posts
  app.get('/api/users/:userId/posts', async (req, res) => {
    try {
      const { userId } = req.params;
      const posts = await storage.getUserPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  // Create post
  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Get post comments
  app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create comment
  app.post('/api/posts/:postId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.postId);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId,
        postId,
      });
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Subscribe/unsubscribe
  app.post('/api/users/:userId/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const subscriberId = req.user.claims.sub;
      const { userId: subscribedToId } = req.params;
      await storage.subscribe(subscriberId, subscribedToId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error subscribing:", error);
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });

  app.delete('/api/users/:userId/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const subscriberId = req.user.claims.sub;
      const { userId: subscribedToId } = req.params;
      await storage.unsubscribe(subscriberId, subscribedToId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });

  // Check subscription status
  app.get('/api/users/:userId/subscription-status', isAuthenticated, async (req: any, res) => {
    try {
      const subscriberId = req.user.claims.sub;
      const { userId: subscribedToId } = req.params;
      const isSubscribed = await storage.isSubscribed(subscriberId, subscribedToId);
      res.json({ isSubscribed });
    } catch (error) {
      console.error("Error checking subscription:", error);
      res.status(500).json({ message: "Failed to check subscription" });
    }
  });

  // Like/unlike post
  app.post('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.postId);
      await storage.likePost(userId, postId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.postId);
      await storage.unlikePost(userId, postId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Check like status
  app.get('/api/posts/:postId/like-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.postId);
      const isLiked = await storage.isPostLiked(userId, postId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  // Save/unsave post
  app.post('/api/posts/:postId/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.postId);
      await storage.savePost(userId, postId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving post:", error);
      res.status(500).json({ message: "Failed to save post" });
    }
  });

  app.delete('/api/posts/:postId/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.postId);
      await storage.unsavePost(userId, postId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving post:", error);
      res.status(500).json({ message: "Failed to unsave post" });
    }
  });

  // Check save status
  app.get('/api/posts/:postId/save-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.postId);
      const isSaved = await storage.isPostSaved(userId, postId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Error checking save status:", error);
      res.status(500).json({ message: "Failed to check save status" });
    }
  });

  // Get saved posts
  app.get('/api/auth/user/saved-posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const posts = await storage.getUserSavedPosts(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      res.status(500).json({ message: "Failed to fetch saved posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
