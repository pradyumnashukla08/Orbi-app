import { View } from "react-native";
import Skeleton from "../common/Skeleton";

const UserTasksSkeleton = () => {
  return (
    <View className="gap-3">
      {[1, 2, 3].map((key) => (
        <View
          key={key}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 gap-3"
        >
          <View className="flex-row items-center justify-between">
            <Skeleton width={100} height={18} borderRadius={6} />
            <Skeleton width={60} height={18} borderRadius={12} />
          </View>
          <Skeleton width="85%" height={16} borderRadius={4} />
          <View className="flex-row items-center justify-between pt-1">
            <Skeleton width={80} height={14} borderRadius={4} />
            <Skeleton width={70} height={24} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default UserTasksSkeleton;
