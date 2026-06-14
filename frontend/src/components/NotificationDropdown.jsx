import React, { useEffect, useRef } from "react";
import { Link } from "react-router";
import { Bell, CheckCheck, Circle } from "lucide-react";
import { useNotification } from "../store/notificationStore";
import { formatDistanceToNow } from "date-fns";

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotification();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = async (id, project) => {
    await markAsRead(id);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#181818] border border-[#2A2A2A] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] bg-[#212121]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#1DB954]" />
          <span className="font-bold text-white text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-[#1DB954] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-[#1DB954] hover:text-[#1ED760] font-semibold flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-[#2A2A2A]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-[#B3B3B3] text-sm">
            You don't have any notifications yet.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleNotificationClick(n._id, n.project)}
              className={`p-4 flex gap-3 hover:bg-[#212121] transition-colors cursor-pointer relative ${
                !n.isRead ? "bg-[#1DB954]/5" : ""
              }`}
            >
              {!n.isRead && (
                <div className="absolute right-4 top-4 text-[#1DB954]">
                  <Circle className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
              
              <div className="flex-1">
                <p className="text-sm text-white leading-relaxed pr-4">
                  {n.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#535353]">
                    {formatDistanceToNow(new Date(n.createdAt))} ago
                  </span>
                  {n.project && (
                    <Link
                      to={`/project/${n.project._id || n.project}`}
                      className="text-xs text-[#1DB954] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View project
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
