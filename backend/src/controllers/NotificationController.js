const { Notification } = require('../models');

exports.getMyNotifications = async (req, res) => {
    try {
        const data = await Notification.findAll({
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.status(200).json({ status: 'success', data });
    } catch (error) { res.status(500).json({ error: error.message }); }
};