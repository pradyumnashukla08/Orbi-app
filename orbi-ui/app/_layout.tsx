import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import toastConfig from "../config/toastConfig";
import "../global.css";

const RootLayout = () => {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={toastConfig} />
    </>
  );
};

export default RootLayout;
