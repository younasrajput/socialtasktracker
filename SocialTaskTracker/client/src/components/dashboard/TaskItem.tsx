import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Task, UserTask } from '@/types';
import { formatDistanceToNow } from 'date-fns';

type TaskItemProps = {
  userTask: UserTask & { task: Task };
};

// Helper function to get appropriate icon for each platform
const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case 'facebook':
      return 'FB';
    case 'instagram':
      return 'IG';
    case 'twitter':
      return 'TW';
    case 'tiktok':
      return 'TT';
    case 'linkedin':
      return 'LI';
    case 'youtube':
      return 'YT';
    default:
      return 'SM';
  }
};

// Helper function to get appropriate color for each platform
const getPlatformColor = (platform: string): string => {
  switch (platform) {
    case 'facebook':
      return 'bg-[#1877F2] text-white';
    case 'instagram':
      return 'bg-[#E1306C] text-white';
    case 'twitter':
      return 'bg-[#1DA1F2] text-white';
    case 'tiktok':
      return 'bg-[#000000] text-white';
    case 'linkedin':
      return 'bg-[#0A66C2] text-white';
    case 'youtube':
      return 'bg-[#FF0000] text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

// Format expiration date
const formatExpiration = (date: Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Format reward amount
const formatReward = (cents: number): string => {
  return `+$${(cents / 100).toFixed(2)}`;
};

const TaskItem = ({ userTask }: TaskItemProps) => {
  const queryClient = useQueryClient();
  const [proofUrl, setProofUrl] = useState('');
  
  const completeTaskMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/user/tasks/${userTask.id}/complete`, { proofUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/tasks/stats'] });
    }
  });

  return (
    <div className="px-6 py-5 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${getPlatformColor(userTask.task.platform)}`}>
            {getPlatformIcon(userTask.task.platform)}
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-900">{userTask.task.title}</h3>
          <p className="text-xs text-gray-500">
            {userTask.task.platform.charAt(0).toUpperCase() + userTask.task.platform.slice(1)} • Expires {formatExpiration(userTask.task.expiresAt)}
          </p>
        </div>
      </div>
      <div>
        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-primary">
          {formatReward(userTask.task.reward)}
        </span>
        {userTask.status === 'active' ? (
          <Button
            onClick={() => completeTaskMutation.mutate()}
            disabled={completeTaskMutation.isPending}
            className="ml-4 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-600 transition-colors"
          >
            {completeTaskMutation.isPending ? 'Completing...' : 'Complete'}
          </Button>
        ) : (
          <span className="ml-4 px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
            Completed
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
