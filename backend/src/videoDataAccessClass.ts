import fs from 'fs';
import path from 'path';

interface Video {
  id: string;
  title: string;
  thumbnail_url: string;
  created_at: string;
  duration: number;
  views: number;
  tags: string[];
}

interface PaginationOptions {
    tags: string[];
    searchQuery: string;
    page: number;
    pageSize: number;
    startDate?: string;
    endDate?: string;
    sortBy?: 'date-asc' | 'date-desc' | 'alpha-asc' | 'alpha-desc';
}


class VideoDataAccess {
  data: Record<string, Video>;
  filePath: string;
  uniqueTags: string[];
  tagToVideoIds: Record<string, string[]>;

  /**
   * Constructor initializes and loads the video data from JSON file
   * @param filePath Path to the videos JSON file
   */
  constructor(filePath: string = path.join(__dirname, 'data', 'videos.json')) {
    this.filePath = filePath;
    this.data = {};
    this.uniqueTags = [];
    this.tagToVideoIds = {};
  }

  /**
   * Load and parse the JSON data from file asynchronously
   * @returns Promise of parsed video data
   */
   async loadData(): Promise<void> {
    try {
      const fileContent = await fs.promises.readFile(this.filePath, 'utf-8');
      try {
        // Parse JSON and convert array to dictionary
        const parsedData = JSON.parse(fileContent) as { videos: Video[] };
        const videosDict = parsedData.videos.reduce((acc: Record<string, Video>, video) => {
          acc[video.id] = video;
          return acc;
        }, {});

        this.data = videosDict;
        
        const allTags = Object.values(this.data).flatMap(video => video.tags);
        this.uniqueTags = [...new Set(allTags)].sort();
        
        // mapping of tags to video IDs for quick filtering later
        Object.values(this.data).forEach(video => {
          video.tags.forEach(tag => {
            if (!this.tagToVideoIds[tag]) {
              this.tagToVideoIds[tag] = [];
            }
            this.tagToVideoIds[tag].push(video.id);
          });
        });
      } catch (parseError) {
        console.error('Error parsing video data JSON:', parseError);
        this.data = {};
        this.uniqueTags = [];
        this.tagToVideoIds = {};
      }
    } catch (error) {
      console.error('Error loading video data file:', error);
      this.data = {};
      this.uniqueTags = [];
      this.tagToVideoIds = {};
    }
  }


  /**
   * Get videos filtered by tag using mapping made during parsing
   * @param tag Tag to filter by
   * @returns dictionary of videos that contain the specified tag
   */
  getVideosByTag(tag: string): Record<string, Video> {
    const videoIds = this.tagToVideoIds[tag];
    return videoIds.reduce((acc: Record<string, Video>, id) => {
      acc[id] = this.data[id];
      return acc;
    }, {});
  }

  private filterVideosByTags(tags: string[]): Video[] {
    let videoIds: string[];
    if (tags.length > 0) {
      videoIds = this.tagToVideoIds[tags[0]] || [];
      for (let i = 1; i < tags.length; i++) {
        const nextTagIds = new Set(this.tagToVideoIds[tags[i]] || []);
        videoIds = videoIds.filter(id => nextTagIds.has(id));
      }
    } else {
      videoIds = Object.keys(this.data);
    }
    return videoIds.map(id => this.data[id]);
  }

  private filterVideosByDate(videos: Video[], startDate?: string, endDate?: string): Video[] {
    if (!startDate && !endDate) return videos;
    return videos.filter(video => {
      const videoDate = new Date(video.created_at);
      if (startDate) {
        const startDateObj = new Date(startDate);
        if (videoDate < startDateObj) return false;
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        // set to end of day
        endDateObj.setHours(23, 59, 59, 999);
        if (videoDate > endDateObj) return false;
      }
      return true;
    });
  }

  private filterVideosBySearchQuery(videos: Video[], searchQuery: string): Video[] {
    const query = searchQuery.toLowerCase();
    return videos.filter(video => video.title.toLowerCase().includes(query));
  }

  private sortVideos(
    videos: Video[],
    sortBy: 'date-asc' | 'date-desc' | 'alpha-asc' | 'alpha-desc'
  ): Video[] {
    return videos.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }

  getPaginatedVideos(options: PaginationOptions) {
    const { tags, searchQuery, page, pageSize, startDate, endDate, sortBy } = options;
    
    let filteredVideos = this.filterVideosByTags(tags);
    
    filteredVideos = this.filterVideosByDate(filteredVideos, startDate, endDate);
    
    if (searchQuery) {
      filteredVideos = this.filterVideosBySearchQuery(filteredVideos, searchQuery);
    }
    
    if (sortBy) {
      filteredVideos = this.sortVideos(filteredVideos, sortBy);
    }

    const totalVideos = filteredVideos.length;
    const totalPages = Math.ceil(totalVideos / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedVideos = filteredVideos.slice(start, end);
    
    return {
      videos: paginatedVideos,
      metadata: {
        currentPage: page,
        pageSize: pageSize,
        totalPages: totalPages,
        totalVideos: totalVideos,
        appliedFilters: { tags, searchQuery, startDate, endDate, sortBy }
      }
    };
  }
}

export { VideoDataAccess, Video };
