import React, { useState } from 'react';
import { 
  FaPlusCircle, FaUserPlus, FaShippingFast, FaTicketAlt, 
  FaCheckCircle, FaHistory, FaRedo, FaTrash 
} from 'react-icons/fa';
import { activityService } from '../../../services/activity/activityService';

const getActivityIcon = (type) => {
  switch (type) {
    case 'PRODUCT_ADDED':
      return <FaPlusCircle className="text-emerald-500" size={15} />;
    case 'ADMIN_ADDED':
      return <FaUserPlus className="text-purple-500" size={15} />;
    case 'USER_ROLE_UPDATED':
      return <FaUserPlus className="text-blue-500" size={15} />;
    case 'ORDER_UPDATED':
      return <FaShippingFast className="text-amber-500" size={15} />;
    case 'COUPON_CREATED':
      return <FaTicketAlt className="text-pink-500" size={15} />;
    case 'ACCOUNT_DELETED':
      return <FaTrash className="text-rose-500" size={15} />;
    default:
      return <FaCheckCircle className="text-primary" size={15} />;
  }
};

const formatTimeAgo = (createdAt) => {
  if (!createdAt) return 'Recently';
  const date = typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt);
  const diffInSecs = Math.floor((new Date() - date) / 1000);
  if (isNaN(diffInSecs) || diffInSecs < 0) return 'Just now';
  if (diffInSecs < 60) return 'Just now';
  if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
  if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * RecentActivityFeed Component
 * Displays essential audit logs: Admin added, Product added, Order status updated, Coupon created.
 * Includes a manual Refresh button to fetch the latest audit logs on demand.
 */
export default function RecentActivityFeed({ activities: initialActivities = [], onRefresh, loading: parentLoading = false }) {
  const [localActivities, setLocalActivities] = useState(initialActivities);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state if parent activities change
  React.useEffect(() => {
    setLocalActivities(initialActivities);
  }, [initialActivities]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        const freshData = await activityService.getRecentActivities(15);
        setLocalActivities(freshData);
      }
    } catch (err) {
      console.warn("Failed to refresh activity logs:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const activities = onRefresh ? initialActivities : localActivities;
  const isLoading = parentLoading || isRefreshing;

  return (
    <div className="bg-card border border-border-subtle rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <FaHistory size={14} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-text-base">Recent Audit Activity</h3>
            <p className="text-[10px] text-text-muted">Necessary admin activity and updates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-border-subtle bg-bg-surface hover:bg-card-hover text-text-muted hover:text-primary transition cursor-pointer flex items-center gap-1 text-[11px] font-bold active:scale-95 disabled:opacity-50"
            title="Refresh Activity Logs"
          >
            <FaRedo size={11} className={isLoading ? "animate-spin text-primary" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase">
            Live Feed
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3 overflow-y-auto max-h-[350px] pr-1 flex-1">
        {activities.length === 0 ? (
          <div className="py-10 text-center text-text-muted text-xs space-y-2">
            <p>No activity logs recorded yet.</p>
            <button
              onClick={handleRefresh}
              className="text-primary font-bold hover:underline text-xs"
            >
              Click to Refresh
            </button>
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-bg-base border border-border-subtle hover:border-primary/40 transition-all text-xs"
            >
              <div className="p-2 rounded-lg bg-card border border-border-subtle shrink-0 mt-0.5">
                {getActivityIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-text-base text-xs truncate">{act.title}</h4>
                  <span className="text-[10px] text-text-muted shrink-0 font-medium">
                    {formatTimeAgo(act.createdAt)}
                  </span>
                </div>
                {act.description && (
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{act.description}</p>
                )}
                {act.userEmail && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-card border border-border-subtle text-[9px] font-bold text-text-muted">
                      By: {act.userEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
