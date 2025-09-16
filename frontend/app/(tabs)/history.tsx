import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📊 History & Reports</Text>

      {/* Summary Cards */}
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Water Used</Text>
          <Text style={styles.cardValue}>875 L</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Avg Soil Moisture</Text>
          <Text style={styles.cardValue}>43.6%</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Irrigation Sessions</Text>
          <Text style={styles.cardValue}>14</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>System Uptime</Text>
          <Text style={styles.cardValue}>99.2%</Text>
        </View>
      </View>

      {/* Soil Moisture Graph */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Soil Moisture Over Time</Text>
        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                data: [45, 42, 38, 40, 43, 46, 44],
              },
            ],
          }}
          width={screenWidth - 50}
          height={220}
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#f0fff4",
            backgroundGradientTo: "#e6f7f1",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(27, 67, 50, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          bezier
          style={{ borderRadius: 12, marginTop: 10 }}
        />
        <Text style={styles.subSection}>Key Insights:</Text>
        <Text style={styles.text}>• Levels stable throughout week</Text>
        <Text style={styles.text}>• Peak on Saturday due to rain</Text>
        <Text style={styles.text}>• Lowest on Wed → Auto irrigation</Text>
      </View>

      {/* System Performance */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>System Performance</Text>
        <Text style={styles.text}>⚙️ Sensor Accuracy: 96%</Text>
        <Text style={styles.text}>⚡ Pump Efficiency: 92%</Text>
        <Text style={styles.text}>📡 Network Connectivity: 99%</Text>
      </View>

      {/* Recent Events */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        <Text style={styles.text}>✅ Maintenance completed (2 days ago)</Text>
        <Text style={styles.text}>🌧️ Weather station sync (3 days ago)</Text>
        <Text style={styles.text}>🔧 Sensor recalibration (5 days ago)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6fff8", padding: 15 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#1b4332" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: { fontSize: 14, color: "#555" },
  cardValue: { fontSize: 18, fontWeight: "bold", color: "#2d6a4f" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#2d6a4f" },
  subSection: { fontSize: 16, fontWeight: "bold", marginTop: 8, color: "#40916c" },
  text: { fontSize: 14, marginBottom: 4, color: "#333" },
});
