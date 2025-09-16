import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from 'expo-linear-gradient';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export default function CropDiseaseAnalyzer() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function openCamera() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is required to analyze crop images.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setPhotoUri(asset.uri);
        setPhotoBase64(asset.base64 ?? null);
        setResult(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      Alert.alert("Error", "Unable to access camera. Please try again.");
    }
  }

  async function pickFromGallery() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Gallery access is required to select crop images.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setPhotoUri(asset.uri);
        setPhotoBase64(asset.base64 ?? null);
        setResult(null);
      }
    } catch (err) {
      console.error("Gallery error:", err);
      Alert.alert("Error", "Unable to access gallery. Please try again.");
    }
  }

  async function sendToGemini() {
    if (!photoBase64) {
      Alert.alert("No Image Selected", "Please capture or select an image first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured");
      }

      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { 
                  text: "Analyze this crop image for diseases, pests, or health issues. Provide a detailed assessment including: 1) Disease/pest identification, 2) Severity level, 3) Treatment recommendations, 4) Prevention measures. Be specific and practical in your advice." 
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: photoBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Analysis failed: ${res.status} - ${text}`);
      }

      const json = await res.json();
      const analysis = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "No analysis results available.";
      setResult(analysis);

    } catch (err) {
      console.error("Analysis error:", err);
      Alert.alert("Analysis Failed", "Unable to analyze the image. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={['#1a365d', '#2d5a87']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>CropCare AI</Text>
            <Text style={styles.headerSubtitle}>Advanced Disease Detection & Analysis</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Image Preview Card */}
          <View style={styles.imageCard}>
            <View style={styles.imageContainer}>
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.preview} />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => {
                      setPhotoUri(null);
                      setPhotoBase64(null);
                      setResult(null);
                    }}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.placeholder}>
                  <View style={styles.placeholderIcon}>
                    <Text style={styles.placeholderEmoji}>📸</Text>
                  </View>
                  <Text style={styles.placeholderTitle}>No Image Selected</Text>
                  <Text style={styles.placeholderText}>
                    Capture or select a crop image to begin analysis
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={openCamera}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>📷</Text>
                <Text style={styles.primaryButtonText}>Take Photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={pickFromGallery}>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonIcon}>🖼</Text>
                <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              !photoBase64 && styles.analyzeButtonDisabled,
              loading && styles.analyzeButtonLoading
            ]}
            onPress={sendToGemini}
            disabled={!photoBase64 || loading}
          >
            <LinearGradient
              colors={
                !photoBase64 || loading 
                  ? ['#a0aec0', '#718096'] 
                  : ['#38a169', '#2d7d5a']
              }
              style={styles.analyzeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonIcon}>🔬</Text>
                  <Text style={styles.analyzeButtonText}>Analyze Crop</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Results Section */}
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Analysis Results</Text>
              {result && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>✓ Complete</Text>
                </View>
              )}
            </View>
            
            <View style={styles.resultsContent}>
              {result ? (
                <ScrollView style={styles.resultScroll} nestedScrollEnabled>
                  <Text style={styles.resultText}>{result}</Text>
                </ScrollView>
              ) : (
                <View style={styles.emptyResults}>
                  <Text style={styles.emptyResultsIcon}>🌾</Text>
                  <Text style={styles.emptyResultsText}>
                    Your analysis results will appear here
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#f7fafc',
  },
  imageCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3182ce',
    shadowColor: '#3182ce',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3182ce',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  analyzeButton: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#38a169',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  analyzeButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  analyzeButtonLoading: {
    shadowOpacity: 0.1,
  },
  analyzeButtonGradient: {
    padding: 18,
    borderRadius: 16,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
  },
  statusBadge: {
    backgroundColor: '#c6f6d5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d7d5a',
  },
  resultsContent: {
    minHeight: 160,
  },
  resultScroll: {
    maxHeight: 300,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4a5568',
    fontFamily: 'System',
  },
  emptyResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyResultsText: {
    fontSize: 16,
    color: '#a0aec0',
    textAlign: 'center',
    fontWeight: '500',
  },
});