import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const learningMaterials = sqliteTable("learning_materials", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  setId: text("set_id"),
  course: text("course").notNull(),
  year: integer("year"),
  semester: integer("semester"),
  category: text("category").notNull().default("Lectures"),
  kind: text("kind").notNull(),
  size: integer("size").notNull(),
  sourceHash: text("source_hash").notNull(),
  optionsKey: text("options_key").notNull(),
  originalKey: text("original_key").notNull(),
  processedKey: text("processed_key").notNull(),
  pageCount: integer("page_count").notNull(),
  chunkCount: integer("chunk_count").notNull(),
  approvedConceptIds: text("approved_concept_ids").notNull().default("[]"),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
}, table => [uniqueIndex("material_owner_set_source_options").on(table.ownerId, table.setId, table.sourceHash, table.optionsKey).where(sql`${table.setId} is not null`)]);

export const courseFolders = sqliteTable("course_folders", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  course: text("course").notNull(),
  createdAt: text("created_at").notNull(),
}, table => [uniqueIndex("course_folder_owner_location").on(table.ownerId, table.year, table.semester, table.course)]);

export const accountSetup = sqliteTable("account_setup", {
  ownerId: text("owner_id").primaryKey(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  completedAt: text("completed_at").notNull(),
});

export const studySets = sqliteTable("study_sets", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  folderId: text("folder_id"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("mint"),
  coverKey: text("cover_key"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastAccessedAt: text("last_accessed_at"),
  plan: text("plan").notNull().default("{}"),
});
