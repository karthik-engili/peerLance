/**
 * @file socketEvents.js
 * @description Socket.io event helper functions.
 * Provides a clean API for emitting events to specific user rooms.
 */

/**
 * Emit an event to a specific user's room.
 * Each user joins a room named `user-{userId}` on connection.
 * @param {Object} io - Socket.io server instance
 * @param {string} userId - Target user's ID
 * @param {string} event - Event name
 * @param {Object} data - Event payload
 */
export const emitToUser = (io, userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data);
};

/**
 * Emit an event to a project's chat room.
 * Used for real-time chat message delivery.
 * @param {Object} io - Socket.io server instance
 * @param {string} projectId - Target project's ID
 * @param {string} event - Event name
 * @param {Object} data - Event payload
 */
export const emitToProject = (io, projectId, event, data) => {
  io.to(`project-${projectId}`).emit(event, data);
};
