import {
  users,
  posts,
  comments,
  subscriptions,
  likes,
  saves,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type InsertSubscription,
  type InsertLike,
  type InsertSave,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getUserPosts(userId: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getPostComments(postId: number): Promise<Comment[]>;

  // Subscription operations
  subscribe(subscriberId: string, subscribedToId: string): Promise<void>;
  unsubscribe(subscriberId: string, subscribedToId: string): Promise<void>;
  isSubscribed(subscriberId: string, subscribedToId: string): Promise<boolean>;

  // Like operations
  likePost(userId: string, postId: number): Promise<void>;
  unlikePost(userId: string, postId: number): Promise<void>;
  isPostLiked(userId: string, postId: number): Promise<boolean>;

  // Save operations
  savePost(userId: string, postId: number): Promise<void>;
  unsavePost(userId: string, postId: number): Promise<void>;
  isPostSaved(userId: string, postId: number): Promise<boolean>;
  getUserSavedPosts(userId: string): Promise<Post[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPosts(limit = 20, offset = 0): Promise<Post[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        type: posts.type,
        content: posts.content,
        mediaUrls: posts.mediaUrls,
        category: posts.category,
        createdAt: posts.createdAt,
        username: users.username,
        profileImageUrl: users.profileImageUrl,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result as any[];
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt));
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    const result = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        postId: comments.postId,
        content: comments.content,
        createdAt: comments.createdAt,
        username: users.username,
        profileImageUrl: users.profileImageUrl,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return result as any[];
  }

  // Subscription operations
  async subscribe(subscriberId: string, subscribedToId: string): Promise<void> {
    await db.insert(subscriptions).values({
      subscriberId,
      subscribedToId,
    });
  }

  async unsubscribe(subscriberId: string, subscribedToId: string): Promise<void> {
    await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, subscriberId),
          eq(subscriptions.subscribedToId, subscribedToId)
        )
      );
  }

  async isSubscribed(subscriberId: string, subscribedToId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.subscriberId, subscriberId),
          eq(subscriptions.subscribedToId, subscribedToId)
        )
      );
    return !!result;
  }

  // Like operations
  async likePost(userId: string, postId: number): Promise<void> {
    await db.insert(likes).values({
      userId,
      postId,
    });
  }

  async unlikePost(userId: string, postId: number): Promise<void> {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
  }

  async isPostLiked(userId: string, postId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    return !!result;
  }

  // Save operations
  async savePost(userId: string, postId: number): Promise<void> {
    await db.insert(saves).values({
      userId,
      postId,
    });
  }

  async unsavePost(userId: string, postId: number): Promise<void> {
    await db
      .delete(saves)
      .where(and(eq(saves.userId, userId), eq(saves.postId, postId)));
  }

  async isPostSaved(userId: string, postId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(saves)
      .where(and(eq(saves.userId, userId), eq(saves.postId, postId)));
    return !!result;
  }

  async getUserSavedPosts(userId: string): Promise<Post[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        type: posts.type,
        content: posts.content,
        mediaUrls: posts.mediaUrls,
        category: posts.category,
        createdAt: posts.createdAt,
      })
      .from(saves)
      .leftJoin(posts, eq(saves.postId, posts.id))
      .where(eq(saves.userId, userId))
      .orderBy(desc(saves.createdAt));

    return result.map(r => r as Post).filter(Boolean);
  }
}

export const storage = new DatabaseStorage();
