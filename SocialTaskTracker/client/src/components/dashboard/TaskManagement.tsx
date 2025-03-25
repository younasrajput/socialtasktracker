import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TaskItem from './TaskItem';
import { Task, UserTask } from '@/types';

interface TaskManagementProps {
  userId: number;
}

const TaskManagement = ({ userId }: TaskManagementProps) => {
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState('active');
  
  // Fetch user tasks
  const { data: userTasks, isLoading: tasksLoading, isError } = useQuery<(UserTask & { task: Task })[]>({
    queryKey: ['/api/user/tasks'],
    // enabled: !!userId,
  });
  
  if (tasksLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Task Management</CardTitle>
          <CardDescription>View and manage your tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !userTasks) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Task Management</CardTitle>
          <CardDescription>View and manage your tasks</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-red-500">Error loading tasks. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Filter tasks based on status and search query
  const activeTasks = userTasks.filter(task => task.status === 'active');
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const expiredTasks = userTasks.filter(task => task.status === 'expired');
  
  const filteredTasks = {
    active: filter 
      ? activeTasks.filter(task => 
          task.task.title.toLowerCase().includes(filter.toLowerCase()) ||
          task.task.platform.toLowerCase().includes(filter.toLowerCase())
        )
      : activeTasks,
    completed: filter
      ? completedTasks.filter(task => 
          task.task.title.toLowerCase().includes(filter.toLowerCase()) ||
          task.task.platform.toLowerCase().includes(filter.toLowerCase())
        )
      : completedTasks,
    expired: filter
      ? expiredTasks.filter(task => 
          task.task.title.toLowerCase().includes(filter.toLowerCase()) ||
          task.task.platform.toLowerCase().includes(filter.toLowerCase())
        )
      : expiredTasks,
  };
  
  // Total earnings calculations
  const totalEarnings = completedTasks.reduce((total, task) => total + task.task.reward, 0);
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Task Management</CardTitle>
            <CardDescription>View and manage your tasks</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Total Earnings: {formatCurrency(totalEarnings)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-9"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs 
          defaultValue="active" 
          value={tab}
          onValueChange={setTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="relative">
              Active
              {activeTasks.length > 0 && (
                <Badge className="ml-2 bg-primary">
                  {activeTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {completedTasks.length > 0 && (
                <Badge className="ml-2 bg-green-500">
                  {completedTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired
              {expiredTasks.length > 0 && (
                <Badge className="ml-2 bg-gray-500">
                  {expiredTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="border rounded-md mt-4">
            {filteredTasks.active.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredTasks.active.map((userTask) => (
                  <TaskItem key={userTask.id} userTask={userTask} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">No active tasks found</p>
                <Button variant="outline">Browse Available Tasks</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="border rounded-md mt-4">
            {filteredTasks.completed.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredTasks.completed.map((userTask) => (
                  <TaskItem key={userTask.id} userTask={userTask} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No completed tasks found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expired" className="border rounded-md mt-4">
            {filteredTasks.expired.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredTasks.expired.map((userTask) => (
                  <TaskItem key={userTask.id} userTask={userTask} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No expired tasks found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TaskManagement;