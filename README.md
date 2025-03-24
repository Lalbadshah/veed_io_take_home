## Project Structure

- `frontend/` - Next.js frontend application
- `backend/` - Node.js backend server


### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the Frontend:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### Backend (Node.js)

1. **In a new terminal** - Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5001` - [Port can be edited in the backend/.env file - corresponding file for FE will also need to be updated - frontend/src/lib/api.ts]

for testing a slow response, uncomment the line in backend/src/server.ts that sets a 5 second timeout and runs the server - this will show the loading state on the frontend


## API Documentation

Once the backend is running, the API documentation is available at `http://localhost:5001/document` - it is set up using the openapi spec defined in 'backend/src/server.ts' and deployed using swagger - all api functionality can be tested using this page

## API Example Queries

**GET /videos**

_All query parameters are optional. If omitted, defaults will be applied:_
  - **page**: defaults to 1 (optional)
  - **pageSize**: defaults to 10 (optional)
  - **startDate**: filter videos starting from a date in ISO8601 format (optional)
  - **endDate**: filter videos up to a date in ISO8601 format (optional)
  - **sortBy**: specify sort order; valid values are "date-asc", "date-desc", "alpha-asc", "alpha-desc" (optional)
  - **tags**: filter videos by given tags; can specify multiple tags (optional) - filtering by tags assumes an "and" operation i.e. the video must have all specified tags to be included in the results
  - **search**: filter videos by a text search (optional)

_Examples:_

1. **Default Request** (using default pagination values):
   curl "http://localhost:5001/videos"
   
   Explanation: Returns the first 10 videos.

2. **Applying Pagination**:
   curl "http://localhost:5001/videos?page=2&pageSize=5"
   
   Explanation: Retrieves page 2 with 5 videos per page.

3. **Filtering by Date Range**:
   curl "http://localhost:5001/videos?startDate=2022-01-01&endDate=2022-01-31"
   
   Explanation: Returns videos published between January 1, 2022 and January 31, 2022.

4. **Sorting Videos**:
   curl "http://localhost:5001/videos?sortBy=date-asc"
   
   Explanation: Sorts the videos by date in ascending order.

5. **Searching Videos by Text**:
   curl "http://localhost:5001/videos?search=education"
   
   Explanation: Returns videos that match the search term "education".

Filtering by tags assumes an "and" operation i.e. the video must have all specified tags to be included in the results
6. **Filtering by Tags**:
   curl "http://localhost:5001/videos?tags=programming&tags=javascript"
   
   Explanation: Returns videos that are tagged with both "programming" and "javascript".

7. **Combining Multiple Filters**:
   curl "http://localhost:5001/videos?page=3&pageSize=5&search=technology&startDate=2022-01-01&endDate=2022-06-30&sortBy=alpha-asc&tags=tech&tags=innovation"
   

**GET /tags**

Request:
  curl http://localhost:5001/tags

Response:
  A JSON array of unique tags



