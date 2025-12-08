/**
 * Storage service for handling file uploads to Supabase Storage
 */
import { supabaseBrowser } from "@/src/lib/supabase";

export class StorageService {
  private static readonly POST_IMAGES_BUCKET = "post-images";
  private static readonly COMMENT_IMAGES_BUCKET = "comment-images";

  /**
   * Upload an image for a post
   */
  static async uploadPostImage(
    file: File,
    userId: string
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabaseBrowser.storage
        .from(this.POST_IMAGES_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { url: null, error: new Error(error.message) };
      }

      const {
        data: { publicUrl },
      } = supabaseBrowser.storage
        .from(this.POST_IMAGES_BUCKET)
        .getPublicUrl(data.path);

      return { url: publicUrl, error: null };
    } catch (error) {
      return {
        url: null,
        error: error instanceof Error ? error : new Error("Upload failed"),
      };
    }
  }

  /**
   * Upload an image for a comment
   */
  static async uploadCommentImage(
    file: File,
    userId: string
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabaseBrowser.storage
        .from(this.COMMENT_IMAGES_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { url: null, error: new Error(error.message) };
      }

      const {
        data: { publicUrl },
      } = supabaseBrowser.storage
        .from(this.COMMENT_IMAGES_BUCKET)
        .getPublicUrl(data.path);

      return { url: publicUrl, error: null };
    } catch (error) {
      return {
        url: null,
        error: error instanceof Error ? error : new Error("Upload failed"),
      };
    }
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size too large. Maximum size is 5MB.",
      };
    }

    return { valid: true };
  }
}
