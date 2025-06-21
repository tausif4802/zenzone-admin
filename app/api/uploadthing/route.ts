import { createRouteHandler } from 'uploadthing/next';

import { ourFileRouter } from '@/lib/uploadthing';

/**
 * @swagger
 * /api/uploadthing:
 *   post:
 *     tags: [Upload]
 *     summary: Upload files
 *     description: Upload files using the UploadThing service
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   description: URL of the uploaded file
 *       400:
 *         description: Invalid file or file type
 *       500:
 *         description: Server error
 */

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
