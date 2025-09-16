import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ControlsScreen() {
  const [autoMode, setAutoMode] = useState(true);
  const [status, setStatus] = useState("Standby");
  const [lastRun, setLastRun] = useState("2 hours ago");
  const [schedule, setSchedule] = useState({
    frequency: "Daily",
    time: new Date(),
    duration: "15 minutes",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
    if (!autoMode) setStatus("Standby");
  };

  const handleStart = () => {
    if (!autoMode) {
      setStatus("Running");
      setLastRun("Just now");
      setTimeout(() => setStatus("Standby"), 5000);
    }
  };

  const handleStop = () => {
    if (!autoMode) {
      setStatus("Stopped");
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSchedule((prev) => ({ ...prev, time: selectedDate }));
    }
  };

  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setSchedule((prev) => ({ ...prev, time: selectedDate }));
    }
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case "Running": return "#10B981";
      case "Stopped": return "#EF4444";
      default: return "#F59E0B";
    }
  };

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case "Running": return "🟢";
      case "Stopped": return "🔴";
      default: return "🟡";
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎛 Irrigation Control</Text>
          <Text style={styles.headerSubtitle}>Smart irrigation management system</Text>
        </View>
        <View style={styles.headerAccent} />
      </View>

      {/* System Control Card */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>⚡</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>System Control</Text>
              <Text style={styles.cardSubtitle}>Manage automatic and manual irrigation modes</Text>
            </View>
          </View>
        </View>

        {/* Auto Mode Toggle */}
        <View style={styles.autoModeContainer}>
          <View style={[styles.autoModeCard, autoMode && styles.autoModeActive]}>
            <View style={styles.autoModeLeft}>
              <Text style={styles.autoModeIcon}>🤖</Text>
              <View style={styles.autoModeText}>
                <Text style={[styles.autoModeTitle, autoMode && styles.autoModeTitleActive]}>
                  Automatic Mode
                </Text>
                <Text style={[styles.autoModeDesc, autoMode && styles.autoModeDescActive]}>
                  AI-driven irrigation based on sensor data and weather conditions
                </Text>
              </View>
            </View>
            <View style={styles.switchContainer}>
              <Switch 
                value={autoMode} 
                onValueChange={toggleAutoMode}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={autoMode ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>
        </View>

        {/* Manual Controls */}
        <View style={styles.controlSection}>
          <Text style={styles.sectionTitle}>🎮 Manual Override</Text>
          <View style={styles.manualButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.startButton,
                autoMode && styles.disabledButton
              ]}
              disabled={autoMode}
              onPress={handleStart}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>▶</Text>
                <Text style={[styles.buttonText, autoMode && styles.disabledText]}>Start Irrigation</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.stopButton,
                autoMode && styles.disabledButton
              ]}
              disabled={autoMode}
              onPress={handleStop}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>⏹</Text>
                <Text style={[styles.buttonText, autoMode && styles.disabledText]}>Stop Irrigation</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {autoMode && (
            <View style={styles.disabledNotice}>
              <Text style={styles.disabledNoticeIcon}>ℹ</Text>
              <Text style={styles.disabledNoticeText}>
                Manual controls are disabled while in automatic mode
              </Text>
            </View>
          )}
        </View>

        {/* System Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.sectionTitle}>📊 System Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Mode</Text>
              <View style={styles.statusValue}>
                <Text style={styles.modeIcon}>{autoMode ? "🤖" : "👤"}</Text>
                <Text style={styles.statusText}>{autoMode ? "Automatic" : "Manual"}</Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={styles.statusValue}>
                <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
                <Text style={[styles.statusText, { color: getStatusColor(status) }]}>{status}</Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Last Run</Text>
              <View style={styles.statusValue}>
                <Text style={styles.statusIcon}>🕐</Text>
                <Text style={styles.statusText}>{lastRun}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Schedule Management Card */}
      <View style={styles.scheduleCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.iconContainer, styles.scheduleIconContainer]}>
              <Text style={styles.cardIcon}>📅</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Schedule Management</Text>
              <Text style={styles.cardSubtitle}>Configure automated irrigation schedules</Text>
            </View>
          </View>
        </View>

        {/* Current Schedule Display */}
        <View style={styles.currentScheduleContainer}>
          <Text style={styles.sectionTitle}>📋 Current Schedule</Text>
          <View style={styles.scheduleInfoCard}>
            <View style={styles.scheduleInfoRow}>
              <View style={styles.scheduleInfoItem}>
                <Text style={styles.scheduleInfoIcon}>🔄</Text>
                <View>
                  <Text style={styles.scheduleInfoLabel}>Frequency</Text>
                  <Text style={styles.scheduleInfoValue}>{schedule.frequency}</Text>
                </View>
              </View>
              <View style={styles.scheduleInfoItem}>
                <Text style={styles.scheduleInfoIcon}>⏰</Text>
                <View>
                  <Text style={styles.scheduleInfoLabel}>Time</Text>
                  <Text style={styles.scheduleInfoValue}>
                    {schedule.time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.scheduleInfoRow}>
              <View style={styles.scheduleInfoItem}>
                <Text style={styles.scheduleInfoIcon}>⏱</Text>
                <View>
                  <Text style={styles.scheduleInfoLabel}>Duration</Text>
                  <Text style={styles.scheduleInfoValue}>{schedule.duration}</Text>
                </View>
              </View>
              <View style={styles.scheduleInfoItem}>
                <Text style={styles.scheduleInfoIcon}>🚀</Text>
                <View>
                  <Text style={styles.scheduleInfoLabel}>Next Run</Text>
                  <Text style={styles.scheduleInfoValue}>
                    Tomorrow {schedule.time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Schedule Controls */}
        <View style={styles.scheduleControls}>
          <Text style={styles.sectionTitle}>⚙ Update Schedule</Text>
          
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateTimeButtonContent}>
                <Text style={styles.dateTimeIcon}>📅</Text>
                <View style={styles.dateTimeText}>
                  <Text style={styles.dateTimeLabel}>Select Date</Text>
                  <Text style={styles.dateTimeValue}>
                    {schedule.time.toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.dateTimeButtonContent}>
                <Text style={styles.dateTimeIcon}>⏰</Text>
                <View style={styles.dateTimeText}>
                  <Text style={styles.dateTimeLabel}>Select Time</Text>
                  <Text style={styles.dateTimeValue}>
                    {schedule.time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.updateScheduleButton}>
            <View style={styles.updateButtonContent}>
              <Text style={styles.updateButtonIcon}>💾</Text>
              <Text style={styles.updateButtonText}>Update Schedule</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={schedule.time}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={schedule.time}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
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
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },

  // Main Card Styles
  mainCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  
  cardHeader: {
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleIconContainer: {
    backgroundColor: '#FEF3C7',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Auto Mode Styles
  autoModeContainer: {
    marginBottom: 24,
  },
  autoModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  autoModeActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  autoModeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  autoModeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  autoModeText: {
    flex: 1,
  },
  autoModeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  autoModeTitleActive: {
    color: '#065F46',
  },
  autoModeDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  autoModeDescActive: {
    color: '#047857',
  },
  switchContainer: {
    marginLeft: 16,
  },

  // Control Section
  controlSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  manualButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  disabledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  disabledNoticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  disabledNoticeText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },

  // Status Styles
  statusContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  statusGrid: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  modeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Schedule Card
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  // Schedule Info
  currentScheduleContainer: {
    marginBottom: 24,
  },
  scheduleInfoCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  scheduleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scheduleInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduleInfoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  scheduleInfoLabel: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  scheduleInfoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },

  // Schedule Controls
  scheduleControls: {},
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateTimeText: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateTimeValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 2,
  },
  updateScheduleButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  updateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});