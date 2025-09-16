import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  StatusBar,
  SafeAreaView
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from 'expo-linear-gradient';

const API_KEY = "fnxteIBv9bncAKD99Ga9DQ3Fkec4CB04";

// Backend data structure
interface BackendData {
  soil_moisture: number;
  soil_temp: number;
  soil_ph: number;
  tank_level: number;
  ambient_humidity: number;
  ambient_temp: number;
  timestamp: string;
}

// Weather API structure
interface WeatherData {
  data: {
    values: {
      windSpeed: number;
      weatherCode: number;
    };
  };
}

// Combined structure
interface CombinedData {
  ambient_temp: number;
  ambient_humidity: number;
  soil_moisture: number;
  soil_temp: number;
  soil_ph: number;
  tank_level: number;
  windSpeed: number;
  weatherCode: number;
}

export default function WeatherScreen() {
  const [data, setData] = useState<CombinedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const weatherCodeMapping: { [key: number]: { description: string; emoji: string; gradient: readonly [string, string] } } = {
    1000: { description: "Clear Sky", emoji: "☀", gradient: ["#FFD700", "#FFA500"] as const },
    1100: { description: "Mostly Clear", emoji: "🌤", gradient: ["#87CEEB", "#98D8E8"] as const },
    1001: { description: "Cloudy", emoji: "☁", gradient: ["#B0C4DE", "#D3D3D3"] as const },
    1101: { description: "Partly Cloudy", emoji: "⛅", gradient: ["#87CEEB", "#F0F8FF"] as const },
    1102: { description: "Mostly Cloudy", emoji: "☁", gradient: ["#708090", "#B0C4DE"] as const },
    4000: { description: "Light Drizzle", emoji: "🌦", gradient: ["#4682B4", "#87CEEB"] as const },
    4001: { description: "Rain", emoji: "🌧", gradient: ["#4169E1", "#6495ED"] as const },
    4200: { description: "Light Rain", emoji: "🌧", gradient: ["#4682B4", "#87CEEB"] as const },
    4201: { description: "Heavy Rain", emoji: "⛈", gradient: ["#2F4F4F", "#4682B4"] as const },
    5000: { description: "Snow", emoji: "❄", gradient: ["#E6E6FA", "#F8F8FF"] as const },
    5001: { description: "Flurries", emoji: "❄", gradient: ["#E6E6FA", "#F0F8FF"] as const },
    5100: { description: "Light Snow", emoji: "❄", gradient: ["#F0F8FF", "#E6E6FA"] as const },
    5101: { description: "Heavy Snow", emoji: "🌨", gradient: ["#D3D3D3", "#E6E6FA"] as const },
    6000: { description: "Freezing Drizzle", emoji: "🧊", gradient: ["#B0E0E6", "#E0F6FF"] as const },
    6001: { description: "Freezing Rain", emoji: "🧊", gradient: ["#4682B4", "#B0E0E6"] as const },
    7000: { description: "Ice Pellets", emoji: "🧊", gradient: ["#C0C0C0", "#E6E6FA"] as const },
    7101: { description: "Heavy Ice Pellets", emoji: "🧊", gradient: ["#A9A9A9", "#D3D3D3"] as const },
    8000: { description: "Thunderstorm", emoji: "⛈", gradient: ["#2F2F2F", "#696969"] as const },
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Location permission denied");
          setIsLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});

        // Fetch backend
        const backendResponse = await fetch("http://127.0.0.1:5000/showData");
        if (!backendResponse.ok) throw new Error("Failed to fetch backend data");
        const backendJson: BackendData = await backendResponse.json();

        // Fetch Tomorrow.io
        const weatherResponse = await fetch(
          `https://api.tomorrow.io/v4/weather/realtime?location=${location.coords.latitude},${location.coords.longitude}&units=metric&apikey=${API_KEY}&fields=windSpeed,weatherCode`
        );
        if (!weatherResponse.ok) throw new Error("Failed to fetch weather data");
        const weatherJson: WeatherData = await weatherResponse.json();

        // Merge
        const combined: CombinedData = {
          ambient_temp: backendJson.ambient_temp,
          ambient_humidity: backendJson.ambient_humidity,
          soil_moisture: backendJson.soil_moisture,
          soil_temp: backendJson.soil_temp,
          soil_ph: backendJson.soil_ph,
          tank_level: backendJson.tank_level,
          windSpeed: weatherJson.data.values.windSpeed,
          weatherCode: weatherJson.data.values.weatherCode,
        };

        setData(combined);
      } catch (error) {
        console.error('WeatherScreen data fetch error:', error);
        setErrorMsg("Unable to fetch data. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const getWeatherInfo = (code: number) => {
    return weatherCodeMapping[code] || { 
      description: "Unknown", 
      emoji: "❓", 
      gradient: ["#F5F5F5", "#E5E5E5"] as const
    };
  };

  const getIrrigationRecommendation = (temp: number, humidity: number, wind: number) => {
    if (temp > 30) {
      return {
        text: "High temperature detected",
        detail: "Increase irrigation by 10% to compensate for higher evaporation rates",
        icon: "🔥",
        priority: "high"
      };
    }
    if (humidity > 70) {
      return {
        text: "High humidity detected",
        detail: "Consider reducing irrigation as evaporation rates are lower",
        icon: "💧",
        priority: "medium"
      };
    }
    if (wind > 20) {
      return {
        text: "Strong winds detected",
        detail: "Monitor soil moisture closely and increase irrigation if needed",
        icon: "🌬",
        priority: "medium"
      };
    }
    return {
      text: "Optimal conditions",
      detail: "Current irrigation schedule is appropriate",
      icon: "✅",
      priority: "low"
    };
  };

  const getStatusColor = (value: number, type: 'moisture' | 'ph' | 'tank') => {
    switch (type) {
      case 'moisture':
        if (value > 70) return '#4CAF50'; // Good
        if (value > 40) return '#FF9800'; // Medium
        return '#F44336'; // Low
      case 'ph':
        if (value >= 6.0 && value <= 7.5) return '#4CAF50'; // Good
        if (value >= 5.5 && value <= 8.0) return '#FF9800'; // Medium
        return '#F44336'; // Poor
      case 'tank':
        if (value > 70) return '#4CAF50'; // Good
        if (value > 30) return '#FF9800'; // Medium
        return '#F44336'; // Low
    }
    return '#2196F3';
  };

  const MetricCard = ({ icon, title, value, unit, color, subtitle }: {
    icon: string;
    title: string;
    value: string | number;
    unit: string;
    color?: string;
    subtitle?: string;
  }) => (
    <View style={[styles.metricCard, { borderLeftColor: color || '#2196F3' }]}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <View style={styles.metricContent}>
          <Text style={styles.metricTitle}>{title}</Text>
          <View style={styles.metricValueContainer}>
            <Text style={[styles.metricValue, { color: color || '#2196F3' }]}>
              {value}
            </Text>
            <Text style={styles.metricUnit}>{unit}</Text>
          </View>
          {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Fetching your farm data...</Text>
          <Text style={styles.loadingSubtext}>Getting location, weather & sensor readings</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContent}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const weatherInfo = getWeatherInfo(data?.weatherCode || 0);
  const recommendation = getIrrigationRecommendation(
    data?.ambient_temp || 0,
    data?.ambient_humidity || 0,
    data?.windSpeed || 0
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
      
      {/* Header with Weather */}
      <LinearGradient
        colors={weatherInfo.gradient}
        style={styles.weatherHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.weatherContent}>
          <Text style={styles.weatherEmoji}>{weatherInfo.emoji}</Text>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTemp}>{data?.ambient_temp != null ? data.ambient_temp.toFixed(0) : '--'}°C</Text>
            <Text style={styles.weatherDescription}>{weatherInfo.description}</Text>
            <View style={styles.weatherDetails}>
              <Text style={styles.weatherDetail}>💧 {data?.ambient_humidity != null ? data.ambient_humidity : '--'}%</Text>
              <Text style={styles.weatherDetail}>🌬 {data?.windSpeed != null ? data.windSpeed.toFixed(1) : '--'} km/h</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.headerTitle}>
          <Text style={styles.appTitle}>Farm Dashboard</Text>
          <Text style={styles.appSubtitle}>Smart Agriculture Monitoring</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Irrigation Alert */}
        <View style={[
          styles.alertCard,
          {
            backgroundColor: recommendation.priority === 'high' ? '#FFF3E0' : 
                           recommendation.priority === 'medium' ? '#E8F5E8' : '#F0F7FF',
            borderLeftColor: recommendation.priority === 'high' ? '#FF9800' :
                           recommendation.priority === 'medium' ? '#4CAF50' : '#2196F3'
          }
        ]}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertIcon}>{recommendation.icon}</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{recommendation.text}</Text>
              <Text style={styles.alertDescription}>{recommendation.detail}</Text>
            </View>
          </View>
        </View>

        {/* Soil Metrics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🌱 Soil Analytics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon="💧"
              title="Moisture"
              value={data?.soil_moisture || 0}
              unit="%"
              color={getStatusColor(data?.soil_moisture || 0, 'moisture')}
              subtitle={data?.soil_moisture && data.soil_moisture > 60 ? "Optimal" : 
                       data?.soil_moisture && data.soil_moisture > 40 ? "Monitor" : "Low"}
            />
            <MetricCard
              icon="🌡"
              title="Temperature"
              value={data?.soil_temp || 0}
              unit="°C"
              color="#FF6B35"
            />
            <MetricCard
              icon="⚖"
              title="pH Level"
              value={data?.soil_ph || 0}
              unit=""
              color={getStatusColor(data?.soil_ph || 0, 'ph')}
              subtitle={data?.soil_ph && data.soil_ph >= 6.0 && data.soil_ph <= 7.5 ? "Ideal" : 
                       data?.soil_ph && data.soil_ph >= 5.5 && data.soil_ph <= 8.0 ? "Fair" : "Poor"}
            />
            <MetricCard
              icon="🛢"
              title="Tank Level"
              value={data?.tank_level || 0}
              unit="%"
              color={getStatusColor(data?.tank_level || 0, 'tank')}
              subtitle={data?.tank_level && data.tank_level > 70 ? "Full" : 
                       data?.tank_level && data.tank_level > 30 ? "Medium" : "Refill Soon"}
            />
          </View>
        </View>

        {/* Daily Recommendations */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📋 Today&apos;s Recommendations</Text>
          <View style={styles.recommendationsList}>
            {[
              { icon: "🌅", text: "Water crops during early morning (6-8 AM)" },
              { icon: "📊", text: "Monitor soil moisture levels hourly" },
              { icon: "🌿", text: "Check for pest activity on leaves" },
              { icon: "☂", text: "Prepare shade covers for midday sun" }
            ].map((item, index) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationIcon}>{item.icon}</Text>
                <Text style={styles.recommendationText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 5-Day Forecast */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📅 5-Day Weather Outlook</Text>
          <View style={styles.forecastContainer}>
            {[
              { day: "Today", icon: "☀", high: 28, low: 18 },
              { day: "Tue", icon: "🌧", high: 24, low: 16 },
              { day: "Wed", icon: "☁", high: 26, low: 19 },
              { day: "Thu", icon: "☀", high: 30, low: 20 },
              { day: "Fri", icon: "⛅", high: 27, low: 18 }
            ].map((forecast, index) => (
              <View key={index} style={styles.forecastDay}>
                <Text style={styles.forecastDayText}>{forecast.day}</Text>
                <Text style={styles.forecastIcon}>{forecast.icon}</Text>
                <Text style={styles.forecastTemp}>{forecast.high}°</Text>
                <Text style={styles.forecastTempLow}>{forecast.low}°</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📈 Weekly Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🌧</Text>
              <Text style={styles.summaryLabel}>Rainfall</Text>
              <Text style={styles.summaryValue}>12mm</Text>
              <Text style={styles.summaryStatus}>Above Average</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🌡</Text>
              <Text style={styles.summaryLabel}>Avg Temp</Text>
              <Text style={styles.summaryValue}>26°C</Text>
              <Text style={styles.summaryStatus}>Optimal</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>☀</Text>
              <Text style={styles.summaryLabel}>Sunny Days</Text>
              <Text style={styles.summaryValue}>5/7</Text>
              <Text style={styles.summaryStatus}>Excellent</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  weatherHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherEmoji: {
    fontSize: 64,
    marginRight: 20,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 52,
  },
  weatherDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  weatherDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  weatherDetail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  headerTitle: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  alertCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
  },
  metricsGrid: {
    gap: 16,
  },
  metricCard: {
    backgroundColor: '#F8FAFE',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 4,
  },
  metricUnit: {
    fontSize: 14,
    color: '#95A5A6',
    fontWeight: '500',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recommendationIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  recommendationText: {
    fontSize: 15,
    color: '#34495E',
    flex: 1,
    lineHeight: 20,
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  forecastDay: {
    alignItems: 'center',
    flex: 1,
  },
  forecastDayText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    marginBottom: 8,
  },
  forecastIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2,
  },
  forecastTempLow: {
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFE',
    borderRadius: 12,
    padding: 16,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  summaryStatus: {
    fontSize: 10,
    color: '#27AE60',
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});