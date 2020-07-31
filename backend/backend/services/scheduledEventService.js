const ScheduledEventModel = require('../models/scheduledEvent');
const UserModel = require('../models/user');
const ErrorService = require('../services/errorService');
const MonitorService = require('./monitorService');
const RealTimeService = require('./realTimeService');

module.exports = {
    create: async function({ projectId }, data) {
        try {
            let monitorData = [];
            if (!data.monitors || data.monitors.length === 0) {
                // select all monitors in a project if no monitor was selected
                const monitors = await MonitorService.findBy({ projectId });
                if (monitors.length > 0) {
                    monitorData = monitors.map(monitor => ({
                        monitorId: monitor._id,
                    }));
                }
            } else {
                monitorData = data.monitors.map(monitor => ({
                    monitorId: monitor,
                }));
            }
            // reassign data.monitors with the restructured monitor data
            data.monitors = monitorData;
            data.projectId = projectId;

            let scheduledEvent = await ScheduledEventModel.create({
                ...data,
            });

            scheduledEvent = await scheduledEvent
                .populate('monitors.monitorId', 'name')
                .populate('projectId', 'name')
                .populate('createdById', 'name')
                .execPopulate();

            await RealTimeService.addScheduledEvent(scheduledEvent);

            return scheduledEvent;
        } catch (error) {
            ErrorService.log('scheduledEventService.create', error);
            throw error;
        }
    },

    updateOneBy: async function(query, data) {
        if (!query) {
            query = {};
        }

        if (!query.deleted) query.deleted = false;

        try {
            let updatedScheduledEvent = await ScheduledEventModel.findOneAndUpdate(
                query,
                {
                    $set: data,
                },
                { new: true }
            );

            updatedScheduledEvent = await updatedScheduledEvent
                .populate('monitors.monitorId', 'name')
                .populate('projectId', 'name')
                .populate('createdById', 'name')
                .execPopulate();

            if (!updatedScheduledEvent) {
                const error = new Error(
                    'Scheduled Event not found or does not exist'
                );
                error.code = 400;
                throw error;
            }

            await RealTimeService.updateScheduledEvent(updatedScheduledEvent);

            return updatedScheduledEvent;
        } catch (error) {
            ErrorService.log('scheduledEventService.updateOneBy', error);
            throw error;
        }
    },

    updateBy: async function(query, data) {
        try {
            if (!query) {
                query = {};
            }

            if (!query.deleted) query.deleted = false;
            let updatedData = await ScheduledEventModel.updateMany(query, {
                $set: data,
            });
            updatedData = await this.findBy(query);
            return updatedData;
        } catch (error) {
            ErrorService.log('scheduledEventService.updateMany', error);
            throw error;
        }
    },

    deleteBy: async function(query, userId) {
        try {
            const scheduledEvent = await ScheduledEventModel.findOneAndUpdate(
                query,
                {
                    $set: {
                        deleted: true,
                        deletedAt: Date.now(),
                        deletedById: userId,
                    },
                },
                { new: true }
            );

            if (!scheduledEvent) {
                const error = new Error(
                    'Scheduled Event not found or does not exist'
                );
                error.code = 400;
                throw error;
            }

            return scheduledEvent;
        } catch (error) {
            ErrorService.log('scheduledEventService.deleteBy', error);
            throw error;
        }
    },

    findBy: async function(query, limit, skip) {
        try {
            if (!skip) skip = 0;

            if (!limit) limit = 0;

            if (typeof skip === 'string') {
                skip = Number(skip);
            }

            if (typeof limit === 'string') {
                limit = Number(limit);
            }

            if (!query) {
                query = {};
            }

            query.deleted = false;
            const scheduledEvents = await ScheduledEventModel.find(query)
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .populate('monitors.monitorId', 'name')
                .populate('projectId', 'name')
                .populate('createdById', 'name')
                .lean();

            return scheduledEvents;
        } catch (error) {
            ErrorService.log('scheduledEventService.findBy', error);
            throw error;
        }
    },

    findOneBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }

            query.deleted = false;
            const scheduledEvent = await ScheduledEventModel.findOne(query)
                .populate('monitors.monitorId', 'name')
                .populate('projectId', 'name')
                .populate('createdById', 'name')
                .lean();

            if (scheduledEvent) {
                if (scheduledEvent.createdById === 'API') {
                    scheduledEvent.createdById = {
                        name: 'API',
                        _id: null,
                    };
                } else {
                    const user = await UserModel.findOne({
                        _id: scheduledEvent.createdById,
                    }).lean();
                    scheduledEvent.createdById = {
                        _id: user._id,
                        name: user.name,
                    };
                }
            }

            return scheduledEvent;
        } catch (error) {
            ErrorService.log('scheduledEventService.findOneBy', error);
            throw error;
        }
    },

    countBy: async function(query) {
        try {
            if (!query) {
                query = {};
            }
            query.deleted = false;
            const count = await ScheduledEventModel.countDocuments(query);
            return count;
        } catch (error) {
            ErrorService.log('scheduledEventService.countBy', error);
            throw error;
        }
    },

    hardDeleteBy: async function(query) {
        try {
            await ScheduledEventModel.deleteMany(query);
            return 'Event(s) removed successfully!';
        } catch (error) {
            ErrorService.log('scheduledEventService.hardDeleteBy', error);
            throw error;
        }
    },
};
