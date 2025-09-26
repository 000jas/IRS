import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// This is a multiple select dropdown component for crop types
const MultiSelectDropdown = ({ options, selectedOptions, onToggleOption }: { options: string[]; selectedOptions: string[]; onToggleOption: (option: string) => void; }) => (
  <View style={styles.dropdownContainer}>
    {options.map((option) => (
      <TouchableOpacity
        key={option}
        style={[
          styles.dropdownItem,
          selectedOptions.includes(option) && styles.selectedDropdownItem,
        ]}
        onPress={() => onToggleOption(option)}
      >
        <Text style={[
          styles.dropdownItemText,
          selectedOptions.includes(option) && styles.selectedDropdownText,
        ]}>
          {option}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New state for location and area
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [farmArea, setFarmArea] = useState('');

  const handleToggleCrop = (crop: string) => {
    setCropTypes((prev: string[]) => {
      if (prev.includes(crop)) {
        return prev.filter(c => c !== crop);
      } else {
        return [...prev, crop];
      }
    });
  };

  const handleGetLocation = async () => {
    // Request permission on Android
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to get your farm coordinates.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission was denied. Please enter the coordinates manually.');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }
    
    // Get the current position
    Geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        Alert.alert('Location Fetched', 'Your farm location has been captured!');
      },
      (error) => {
        Alert.alert('Location Error', error.message);
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const handleRegistration = async () => {
    if (!name || !email || !password || !confirmPassword || !sowingDate || cropTypes.length === 0 || !farmArea || latitude === null || longitude === null) {
      Alert.alert('Error', 'Please fill all the required fields and get your location.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    const registrationData = {
      name,
      email,
      password,
      crop_type: cropTypes.join(', '),
      sowing_date: sowingDate,
      farm_location: {
        latitude: latitude,
        longitude: longitude,
      },
      farm_area: farmArea,
      registered_on: new Date().toISOString(),
    };

    try {
      const response = await fetch('http://www.something.com/transfer_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        Alert.alert('Registration Successful', 'Your details have been submitted.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSowingDate('');
        setCropTypes([]);
        setLatitude(null);
        setLongitude(null);
        setFarmArea('');
      } else {
        Alert.alert('Registration Failed', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert('Network Error', 'Could not connect to the server. Please check your internet connection and the server URL.');
    } finally {
      setLoading(false);
    }
  };

  const cropOptions: string[] = ['wheat', 'rice', 'maize', 'millets'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Farmer Registration</Text>
        <Text style={styles.subtitle}>Enter your details to get started</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Sowing Date (YYYY-MM-DD)"
          value={sowingDate}
          onChangeText={setSowingDate}
        />
        
        {/* New Farm Location Section */}
        <Text style={styles.label}>Farm Location</Text>
        <TouchableOpacity style={styles.button} onPress={handleGetLocation}>
          <Text style={styles.buttonText}>Get Current Location</Text>
        </TouchableOpacity>
        <View style={styles.locationDisplay}>
          <Text style={styles.locationText}>
            Latitude: {latitude !== null ? latitude.toFixed(6) : 'N/A'}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {longitude !== null ? longitude.toFixed(6) : 'N/A'}
          </Text>
        </View>

        {/* New Farm Area Section */}
        <TextInput
          style={styles.input}
          placeholder="Farm Area (in acres)"
          value={farmArea}
          onChangeText={setFarmArea}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Select Crop Type(s)</Text>
        <MultiSelectDropdown
          options={cropOptions}
          selectedOptions={cropTypes}
          onToggleOption={handleToggleCrop}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegistration}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Registering...' : 'Register'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5a3d',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    backgroundColor: '#fff',
  },
  selectedDropdownItem: {
    backgroundColor: '#48bb78',
    borderColor: '#48bb78',
  },
  dropdownItemText: {
    color: '#4a5568',
    fontWeight: '500',
  },
  selectedDropdownText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationDisplay: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#555',
  },
});