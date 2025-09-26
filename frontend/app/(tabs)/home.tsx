import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";

interface BackendData {
  ambient_humidity: number;
  ambient_temp: number;
  id: number;
  irrigate: number;
  rain_next_48h: number;
  soil_moisture: number;
  soil_ph: number;
  soil_temp: number;
  tank_level: number;
  timestamp: string;
  user_id: number;
  water_litres: number;
}

export default function Dashboard() {
  const [data, setData] = useState<BackendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("http://192.168.1.7:5000/showData");  // apne app ka endpoint dal
      if (!response.ok) {
        throw new Error("Failed to fetch data from backend.");
      }
      const json: BackendData = await response.json();
      setData(json);
    } catch (error) {
      setErrorMsg("Could not fetch data. Please check server connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSoilMoistureColor = (moisture: number) => {
    if (moisture >= 70) return '#10B981'; // Green
    if (moisture >= 40) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 25) return '#3B82F6'; // Blue
    if (temp <= 30) return '#10B981'; // Green
    return '#EF4444'; // Red
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>🌱 Farm Dashboard</Text>
          <Text style={styles.subtitle}>Smart Irrigation Management System</Text>
        </View>
        <View style={styles.headerAccent} />
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Soil Moisture Card */}
        <View style={[styles.statCard, styles.primaryCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>💧</Text>
            </View>
            <Text style={styles.cardTitle}>Soil Moisture</Text>
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <View style={styles.cardContent}>
              <Text style={[styles.primaryValue, { color: getSoilMoistureColor((data?.soil_moisture ?? 0)) }]}>
                {(data?.soil_moisture ?? 0).toFixed(0)}%
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${data?.soil_moisture || 0}%`,
                      backgroundColor: getSoilMoistureColor(data?.soil_moisture || 0)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.cardSubtext}>Optimal level maintained</Text>
            </View>
          )}
        </View>

        {/* Temperature & Humidity Card */}
        <View style={[styles.statCard, styles.temperatureCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>🌡</Text>
            </View>
            <Text style={styles.cardTitle}>Environment</Text>
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1F2937" />
            </View>
          ) : errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <View style={styles.cardContent}>
              <Text style={[styles.primaryValue, { color: getTemperatureColor((data?.ambient_temp ?? 0)) }]}>
                {(data?.ambient_temp ?? 0).toFixed(1)}°C
              </Text>
              <View style={styles.humidityRow}>
                <Text style={styles.humidityLabel}>💨 Humidity</Text>
                <Text style={styles.humidityValue}>{data?.ambient_humidity}%</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Secondary Stats */}
      <View style={styles.secondaryGrid}>
        {/* Water Tank Card */}
        <View style={[styles.secondaryCard, styles.tankCard]}>
          <View style={styles.secondaryHeader}>
            <Text style={styles.secondaryIcon}>🪣</Text>
            <Text style={styles.secondaryTitle}>Water Tank</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : errorMsg ? (
            <Text style={styles.errorTextSmall}>{errorMsg}</Text>
          ) : (
            <>
              <Text style={styles.secondaryValue}>{(data?.tank_level ?? 0).toFixed(0)}%</Text>
              <View style={styles.tankIndicator}>
                <View 
                  style={[
                    styles.tankFill, 
                    { 
                      height: `${data?.tank_level || 0}%`,
                      backgroundColor: data && data.tank_level > 50 ? '#10B981' : '#F59E0B'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.secondarySubtext}>
                {data && data.tank_level > 50 ? "Good level" : "Refill soon"}
              </Text>
            </>
          )}
        </View>

        {/* Irrigation Status Card */}
        <View style={[styles.secondaryCard, styles.irrigationCard]}>
          <View style={styles.secondaryHeader}>
            <Text style={styles.secondaryIcon}>🚿</Text>
            <Text style={styles.secondaryTitle}>Irrigation</Text>
          </View>
          <View style={styles.irrigationStatus}>
            <View style={[
              styles.statusIndicator,
              data?.irrigate === 1 ? styles.statusOn : styles.statusOff
            ]} />
            <Text style={[
              styles.statusText,
              data?.irrigate === 1 ? styles.statusTextOn : styles.statusTextOff
            ]}>
              {data?.irrigate === 1 ? "AUTO ON" : "OFF"}
            </Text>
          </View>
          <Text style={styles.secondarySubtext}>Last watered: 2h ago</Text>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Recent Activity</Text>
          <View style={styles.sectionAccent} />
        </View>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: "#10B981" }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Irrigation completed - Zone A</Text>
              <Text style={styles.activityTime}>15 mins ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: "#3B82F6" }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                Soil moisture sensor: {data?.soil_moisture}%
              </Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: "#F59E0B" }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                Water tank check: {data?.tank_level}%
              </Text>
              <Text style={styles.activityTime}>3 hours ago</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Alerts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🚨 Active Alerts</Text>
          <View style={styles.sectionAccent} />
        </View>
        
        {data && data.tank_level < 40 && (
          <View style={[styles.alertCard, styles.warningAlert]}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>⚠</Text>
              <Text style={styles.alertTitle}>Water Tank Low</Text>
            </View>
            <Text style={styles.alertDescription}>
              Current level: {data?.tank_level}%. Consider refilling soon to maintain optimal irrigation.
            </Text>
          </View>
        )}
        
        {data && data.ambient_temp > 30 && (
          <View style={[styles.alertCard, styles.temperatureAlert]}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>🌡</Text>
              <Text style={styles.alertTitle}>High Temperature</Text>
            </View>
            <Text style={styles.alertDescription}>
              {data?.ambient_temp}°C detected. Consider adjusting irrigation schedule for optimal crop health.
            </Text>
          </View>
        )}

        {(!data || (data.tank_level >= 40 && data.ambient_temp <= 30)) && !errorMsg && (
          <View style={styles.noAlertsContainer}>
            <Text style={styles.noAlertsIcon}>✅</Text>
            <Text style={styles.noAlertsText}>All systems operating normally</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  headerAccent: {
    position: 'absolute',
    bottom: 0,
    left: '40%',
    right: '40%',
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },

  // Stats Grid
  statsGrid: {
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  temperatureCard: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  primaryValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardSubtext: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  humidityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  humidityLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  humidityValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
  },

  // Secondary Grid
  secondaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tankCard: {
    borderTopWidth: 3,
    borderTopColor: '#059669',
  },
  irrigationCard: {
    borderTopWidth: 3,
    borderTopColor: '#DC2626',
  },
  secondaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  secondaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  secondaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  tankIndicator: {
    width: 30,
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  tankFill: {
    borderRadius: 15,
    width: '100%',
  },
  secondarySubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  irrigationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOn: {
    backgroundColor: '#10B981',
  },
  statusOff: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusTextOn: {
    color: '#10B981',
  },
  statusTextOff: {
    color: '#EF4444',
  },

  // Section Styles
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionAccent: {
    width: 40,
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },

  // Activity Styles
  activityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },

  // Alert Styles
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  warningAlert: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  temperatureAlert: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  alertDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  noAlertsContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  noAlertsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#15803D',
    fontWeight: '600',
  },

  // Loading and Error States
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    paddingVertical: 16,
  },
  errorTextSmall: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});