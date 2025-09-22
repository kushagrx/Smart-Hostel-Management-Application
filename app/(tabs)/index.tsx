import { Text, View } from "react-native";
import { StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to your smart hostel 🏘️</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    verticalAlign: "top"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});