import Announcement from '../models/Announcement.js';
import Blog from '../models/Blog.js';
import Contact from '../models/Contact.js';
import Event from '../models/Event.js';
import Gallery from '../models/Gallery.js';
import Member from '../models/Member.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler, buildSearchFilter } from '../utils/helpers.js';

const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const buildActivity = (...groups) =>
  groups
    .flat()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 12);

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const twelveMonthsAgo = monthStart(new Date(now.getFullYear(), now.getMonth() - 11, 1));

  const [
    totalMembers,
    activeMembers,
    upcomingEvents,
    totalBlogs,
    publishedBlogs,
    galleryImages,
    unreadContacts,
    activeAnnouncements,
    latestMembers,
    latestEvents,
    latestBlogs,
    latestGallery,
    latestContacts,
    memberGrowth,
  ] = await Promise.all([
    Member.countDocuments(),
    Member.countDocuments({ status: 'active' }),
    Event.countDocuments({ status: 'published', date: { $gte: now } }),
    Blog.countDocuments(),
    Blog.countDocuments({ status: 'published' }),
    Gallery.countDocuments(),
    Contact.countDocuments({ isRead: false }),
    Announcement.countDocuments({ status: 'published' }),
    Member.find().sort({ createdAt: -1 }).limit(5),
    Event.find().sort({ createdAt: -1 }).limit(5),
    Blog.find().sort({ createdAt: -1 }).limit(5),
    Gallery.find().sort({ createdAt: -1 }).limit(5),
    Contact.find().sort({ createdAt: -1 }).limit(5),
    Member.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const recentActivity = buildActivity(
    latestMembers.map((item) => ({
      type: 'member',
      label: item.name,
      description: 'Member profile added',
      createdAt: item.createdAt,
    })),
    latestEvents.map((item) => ({
      type: 'event',
      label: item.title,
      description: 'Event updated',
      createdAt: item.createdAt,
    })),
    latestBlogs.map((item) => ({
      type: 'blog',
      label: item.title,
      description: 'Blog post updated',
      createdAt: item.createdAt,
    })),
    latestGallery.map((item) => ({
      type: 'gallery',
      label: item.title,
      description: 'Gallery image uploaded',
      createdAt: item.createdAt,
    })),
    latestContacts.map((item) => ({
      type: 'contact',
      label: item.subject,
      description: 'Contact message received',
      createdAt: item.createdAt,
    }))
  );

  ApiResponse.success(
    res,
    {
      stats: {
        totalMembers,
        activeMembers,
        upcomingEvents,
        totalBlogs,
        publishedBlogs,
        galleryImages,
        unreadContacts,
        activeAnnouncements,
      },
      recent: {
        members: latestMembers,
        events: latestEvents,
        blogs: latestBlogs,
        gallery: latestGallery,
        contacts: latestContacts,
        activity: recentActivity,
      },
      analytics: {
        memberGrowth,
      },
    },
    'Dashboard overview fetched successfully'
  );
});

export const dashboardSearch = asyncHandler(async (req, res) => {
  const search = req.query.q || req.query.search;
  const limit = Math.min(Number(req.query.limit || 5), 10);

  const [members, events, blogs, announcements, contacts] = await Promise.all([
    Member.find(buildSearchFilter(search, ['name', 'designation', 'department', 'chapter'])).limit(limit),
    Event.find(buildSearchFilter(search, ['title', 'description', 'category', 'location'])).limit(limit),
    Blog.find(buildSearchFilter(search, ['title', 'excerpt', 'category', 'tags'])).limit(limit),
    Announcement.find(buildSearchFilter(search, ['title', 'message'])).limit(limit),
    Contact.find(buildSearchFilter(search, ['name', 'email', 'subject', 'message'])).limit(limit),
  ]);

  ApiResponse.success(
    res,
    { results: { members, events, blogs, announcements, contacts } },
    'Dashboard search completed successfully'
  );
});
