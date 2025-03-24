import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VideoDataAccess } from './videoDataAccessClass';
import { query, validationResult } from 'express-validator';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
dotenv.config();

const app = express();
const port = process.env.PORT;

const videoDataAccess = new VideoDataAccess();
videoDataAccess.loadData().then(() => {
        console.log('Video data loaded successfully');
    }).catch((error) => {
        console.error('Error loading video data:', error);
    });

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VEED.io API',
      version: '1.0.0',
      description: 'API documentation for VEED.io endpoints',
    },
    servers: [
      { url: `http://localhost:${port}` }
    ],
  },
  apis: ['./src/server.ts'], // files containing OpenAPI annotations
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/document', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Welcome message
 *     description: Returns a welcome message.
 *     responses:
 *       200:
 *         description: A welcome message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the VEED.io API' });
});

/**
 * @openapi
 * /videos:
 *   get:
 *     summary: Retrieves a list of videos.
 *     description: Retrieves paginated videos with optional filtering by tags, search query, date range, and sorting.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default is 1).
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page (default is 10).
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter in ISO8601 format.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter in ISO8601 format.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date-asc, date-desc, alpha-asc, alpha-desc]
 *         description: Sort order.
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         style: form
 *         explode: true
 *         description: Tags filter.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search text.
 *     responses:
 *       200:
 *         description: Returns a paginated list of videos.
 */
app.get('/videos', [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .toInt()
      .withMessage('Page must be an integer greater than or equal to 1'),
    query('pageSize')
      .optional()
      .isInt({ min: 1 })
      .toInt()
      .withMessage('Page size must be an integer greater than 0'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO8601 date'),
    query('sortBy')
      .optional()
      .isIn(['date-asc', 'date-desc', 'alpha-asc', 'alpha-desc'])
      .withMessage('Invalid sort order')
], async (req: Request, res: Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    // uncomment to test slow response- to see loading state on FE
    // await new Promise(resolve => setTimeout(resolve, 5000));

    const tags = Array.isArray(req.query.tags)
        ? (req.query.tags as string[])
        : req.query.tags
            ? [(req.query.tags as string)]
            : [];
    const searchQuery = (req.query.search as string) || '';
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const sortBy = req.query.sortBy as 'date-asc' | 'date-desc' | 'alpha-asc' | 'alpha-desc';

    const result = videoDataAccess.getPaginatedVideos({
        tags,
        searchQuery,
        page,
        pageSize,
        startDate,
        endDate,
        sortBy
    });
    res.json(result);
});

/**
 * @openapi
 * /tags:
 *   get:
 *     summary: Retrieves a list of unique video tags.
 *     description: Retrieves all unique tags from the videos data.
 *     responses:
 *       200:
 *         description: A list of unique tags.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get('/tags', (req: Request, res: Response) => {
    const tags = videoDataAccess.uniqueTags;
    res.json(tags);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 