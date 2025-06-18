const User = require('../models/User');

// @desc    Get all users (for user switching)
// @route   GET /api/users
// @access  Protected
const getUsers = async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const cursor = req.query.cursor;

    try {
        let query = {};
        if (cursor) {
            // For cursor-based pagination, sort by a unique field such as _id
            query._id = { $gt: cursor };
        }

        const count = await User.countDocuments({});
        const users = await User.find(query)
            .sort({ username: 1 })
            .limit(pageSize)
            .select('username email _id');

        const nextCursor = users.length === pageSize ? users[users.length - 1]._id : null;

        res.json({
            users,
            page,
            pages: Math.ceil(count / pageSize),
            nextCursor,
            totalUsers: count
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching users' });
    }
};

module.exports = { getUsers };