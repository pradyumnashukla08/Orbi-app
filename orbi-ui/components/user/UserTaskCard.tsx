import { Pressable, Text, View } from "react-native";
import Badge from "../common/Badge";
import type { BadgeVariant } from "../common/Badge";

export type UserTask = {
  id: string;
  title: string;
  category: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
};

type UserTaskCardProps = {
  task: UserTask;
  onToggleStatus: (id: string) => void;
};

const PRIORITY_VARIANTS: Record<string, BadgeVariant> = {
  high: "error",
  medium: "warning",
  low: "default",
};

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  completed: "success",
  in_progress: "info",
  pending: "default",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending",
};

const UserTaskCard = ({ task, onToggleStatus }: UserTaskCardProps) => {
  const isCompleted = task.status === "completed";

  return (
    <View className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          {task.category}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Badge label={task.priority} variant={PRIORITY_VARIANTS[task.priority]} />
          <Badge label={STATUS_LABELS[task.status]} variant={STATUS_VARIANTS[task.status]} />
        </View>
      </View>

      <Text
        className={`text-base font-semibold ${
          isCompleted ? "text-slate-500 line-through" : "text-white"
        }`}
      >
        {task.title}
      </Text>

      <View className="mt-3 flex-row items-center justify-between border-t border-slate-800/60 pt-3">
        <Text className="text-xs text-slate-400">Due: {task.dueDate}</Text>
        <Pressable
          accessibilityLabel={isCompleted ? "Mark task as incomplete" : "Mark task as complete"}
          accessibilityRole="button"
          onPress={() => onToggleStatus(task.id)}
          className={`rounded-lg px-3 py-1.5 border ${
            isCompleted
              ? "border-slate-700 bg-slate-800/80 active:bg-slate-700"
              : "border-indigo-600 bg-indigo-600 active:bg-indigo-700"
          }`}
        >
          <Text className="text-xs font-semibold text-white">
            {isCompleted ? "Undo" : "Mark Done"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default UserTaskCard;
