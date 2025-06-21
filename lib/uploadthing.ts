import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  blogImageUploader: f({ image: { maxFileSize: '4MB' } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      // You can add authentication here if needed
      return { userId: 'admin' }; // Whatever is returned here is accessible in onUploadComplete as `metadata`
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.url);

      // Return anything from this function that you want to pass to the client
      return { uploadedBy: metadata.userId };
    }),

  // Audio uploader for breathing guides
  breathingGuideAudioUploader: f({ audio: { maxFileSize: '8MB' } })
    .middleware(async ({ req }) => {
      return { userId: 'admin' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Audio upload complete for userId:', metadata.userId);
      console.log('audio file url', file.url);

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
