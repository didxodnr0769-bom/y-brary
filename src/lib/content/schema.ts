import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const imageUrlSchema = z.string().refine((value) => value.startsWith("/") || URL.canParse(value), {
  message: "이미지 URL은 절대 URL 또는 /로 시작하는 경로여야 합니다.",
});

export const imageAssetSchema = z.object({
  url: imageUrlSchema,
  alt: z.string().min(1).max(200),
});

export const projectScreenshotSchema = imageAssetSchema.extend({
  id: z.string().min(1),
  caption: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0),
});

const projectPeriodSchema = z
  .object({
    startedAt: dateSchema,
    endedAt: dateSchema,
  })
  .refine(({ endedAt, startedAt }) => startedAt <= endedAt, {
    message: "프로젝트 종료일은 시작일보다 빠를 수 없습니다.",
    path: ["endedAt"],
  });

export const projectSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(300),
  description: z.string().min(1).max(2000),
  thumbnail: imageAssetSchema.nullable(),
  screenshots: z.array(projectScreenshotSchema).max(6),
  githubUrl: z.url().nullable(),
  liveUrl: z.url().nullable(),
  tags: z.array(z.string().min(1).max(30)).max(8).default([]),
  period: projectPeriodSchema.nullable().default(null),
  publishedAt: dateSchema,
  isSample: z.boolean().default(false),
});

export const reviewKindSchema = z.enum(["book", "course"]);

const reviewFields = z.object({
  id: z.string().min(1),
  kind: reviewKindSchema,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  creator: z.string().min(1).max(200),
  consumedOn: dateSchema,
  rating: z.number().min(0.5).max(5).multipleOf(0.5),
  summary: z.string().min(1).max(300),
  body: z.string().min(1).max(2000),
  cover: imageAssetSchema,
  publishedAt: dateSchema,
  isSample: z.boolean().default(false),
});

export const reviewSchema = z.discriminatedUnion("kind", [
  reviewFields.extend({ kind: z.literal("book") }),
  reviewFields.extend({
    kind: z.literal("course"),
    cover: imageAssetSchema.nullable().default(null),
    platform: z.string().min(1).max(120).optional(),
  }),
]);

export const learningNoteSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(300),
  body: z.string().min(1).max(20000),
  studiedOn: dateSchema,
  tags: z.array(z.string().min(1).max(30)).max(8).default([]),
  publishedAt: dateSchema,
  isSample: z.boolean().default(false),
});

export type LearningNote = z.infer<typeof learningNoteSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type ReviewKind = z.infer<typeof reviewKindSchema>;
