import { View } from "react-native";
import Skeleton from "../common/Skeleton";

const AdminAuditSkeleton = () => {
  return (
    <View className="gap-3">
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 gap-2.5"
        >
          <View className="flex-row items-center justify-between">
            <Skeleton width={140} height={16} borderRadius={4} />
            <Skeleton width={60} height={16} borderRadius={12} />
          </View>
          <Skeleton width="60%" height={12} borderRadius={4} />
          <View className="flex-row items-center justify-between pt-1">
            <Skeleton width={80} height={12} borderRadius={4} />
            <Skeleton width={100} height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default AdminAuditSkeleton;
