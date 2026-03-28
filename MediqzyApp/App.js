import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { configureGoogleSignIn } from './assests/Utils/googleAuthService';
import { initializeNotifications } from './assests/Utils/firebaseMessaging';
import { initializeLocalNotifications } from './assests/Utils/localNotifications';
import { navigationRef, navigate } from './assests/Utils/navigationService';

/* ---------- SCREENS ---------- */
import SplashScreen from './assests/Screens/Auth/SplashScreen';
import OnboardingScreen from './assests/Screens/Auth/OnboardingScreen';
import LoginScreen from './assests/Screens/Auth/LoginScreen';
import SignUpScreen from './assests/Screens/Auth/SignUpScreen';
import ForgotPasswordScreen from './assests/Screens/Auth/ForgotPasswordScreen';
import OTPVerificationScreen from './assests/Screens/Auth/OTPVerificationScreen';
import SuccessScreen from './assests/Screens/Auth/SuccessScreen';

import HomeScreen from './assests/Screens/Home/HomeScreen';
import HealthCoinsScreen from './assests/Screens/HealthCoins/HealthCoinsScreen';
import OffersScreen from './assests/Screens/HealthCoins/OffersScreen';
import OfferDetailScreen from './assests/Screens/HealthCoins/OfferDetailScreen';
import RedeemSuccessScreen from './assests/Screens/HealthCoins/RedeemSuccessScreen';
import CoinsCollectedScreen from './assests/Screens/HealthCoins/CoinsCollectedScreen';
import LocationScreen from './assests/Screens/Home/LocationScreen';
import AddressListScreen from './assests/Screens/Address/AddressListScreen';
import AddEditAddressScreen from './assests/Screens/Address/AddEditAddressScreen';

import PolicyCoverageScreen from './assests/Screens/Insurance/PolicyCoverageScreen';
import CorporatePlansScreen from './assests/Screens/Insurance/CorporatePlansScreen';

import PaymentScreen from './assests/Screens/Payment/PaymentScreen';
import PaymentSuccessScreen from './assests/Screens/Payment/PaymentSuccessScreen';
import PaymentMethodsScreen from './assests/Screens/Payment/PaymentMethodsScreen';

import LabTestsScreen from './assests/Screens/Lab/LabTestsScreen';
import LabListingScreen from './assests/Screens/Lab/LabListingScreen';
import LabDetailsScreen from './assests/Screens/Lab/LabDetailsScreen';
import TestDetailsScreen from './assests/Screens/Lab/TestDetailsScreen';
import LabTestDetailsScreen from './assests/Screens/Lab/LabTestDetailsScreen';
import LabDetailsInfoScreen from './assests/Screens/Lab/LabDetailsInfoScreen';
import LabTestDetailScreen from './assests/Screens/Lab/LabTestDetailScreen';
import LabPaymentScreen from './assests/Screens/Lab/LabPaymentScreen';
import LabBillScreen from './assests/Screens/Lab/LabBillScreen';
import ScheduleLabScreen from './assests/Screens/Lab/ScheduleLabScreen';
import LabOrderConfirmScreen from './assests/Screens/Lab/LabOrderConfirmScreen';
import LabLocationScreen from './assests/Screens/Lab/LabLocationScreen';
import CollectionDetailsScreen from './assests/Screens/Lab/CollectionDetailsScreen';
import SampleCollectedScreen from './assests/Screens/Lab/SampleCollectedScreen';
import CollectionStatusScreen from './assests/Screens/Lab/CollectionStatusScreen';
import LabCartScreen from './assests/Screens/Lab/LabCartScreen';

import CartScreen from './assests/Screens/Orders/CartScreen';
import OrdersScreen from './assests/Screens/Orders/OrdersScreen';
import OrderDetailScreen from './assests/Screens/Orders/OrderDetailScreen';

import UploadPrescriptionScreen from './assests/Screens/Prescription/UploadPrescriptionScreen';
import PrescriptionSuccessScreen from './assests/Screens/Prescription/PrescriptionSuccessScreen';
import MedicinesQuotationScreen from './assests/Screens/Prescription/MedicinesQuotationScreen';
import Prescription from './assests/Screens/Prescription/Prescription';
import QuotationsScreen from './assests/Screens/Prescription/QuotationsScreen';
import LabTestsListScreen from './assests/Screens/Lab/LabTestsListScreen';


// Reports Screens
import MyReportsScreen from './assests/Screens/Reports/MyReportsScreen';
import ViewLabReportScreen from './assests/Screens/Reports/ViewLabReportScreen';
import ViewPrescriptionScreen from './assests/Screens/Reports/ViewPrescriptionScreen';
import CompletedLabReportScreen from './assests/Screens/Reports/CompletedLabReportScreen';

import ConsultationScreen from './assests/Screens/Consultation/ConsultationScreen';
import AppointmentHistoryScreen from './assests/Screens/Consultation/AppointmentHistoryScreen';
import AppointmentDetailsScreen from './assests/Screens/Consultation/AppointmentDetailsScreen';
import DoctorBookingScreen from './assests/Screens/Consultation/DoctorBookingScreen';
import SelectPatientScreen from './assests/Screens/Consultation/SelectPatientScreen';
import ConsultationPaymentScreen from './assests/Screens/Consultation/ConsultationPaymentScreen';
import ConsultationBillScreen from './assests/Screens/Consultation/ConsultationBillScreen';
import BookingConfirmScreen from './assests/Screens/Consultation/BookingConfirmScreen';
import CompletedAppointmentScreen from './assests/Screens/Consultation/CompletedAppointmentScreen';
import RescheduleAppointmentScreen from './assests/Screens/Consultation/RescheduleAppointmentScreen';
import DoctorAppointmentsScreen from './assests/Screens/Consultation/DoctorAppointmentsScreen';
import AddPatientScreen from './assests/Screens/Consultation/AddPatientScreen';
import HospitalListingScreen from './assests/Screens/Consultation/HospitalListingScreen';
import HospitalDetailsScreen from './assests/Screens/Consultation/HospitalDetailsScreen';
import BenefitsScreen from './assests/Screens/Consultation/BenefitsScreen';
import CouponScreen from './assests/Screens/Consultation/CouponScreen';
import CancelationScreen from './assests/Screens/Consultation/CancelationScreen';

import ChatsScreen from './assests/Screens/Chat/ChatsScreen';
import DoctorChatScreen from './assests/Screens/Chat/DoctorChatScreen';
import DocVideoCallScreen from './assests/Screens/Chat/DocVideoCallScreen';
import CallScreen from './assests/Screens/Chat/CallScreen';
import CallsHistoryScreen from './assests/Screens/Chat/CallsHistoryScreen';
import PrescriptionDownloadScreen from './assests/Screens/Prescription/PrescriptionDownloadScreen';

import ProfileScreen from './assests/Screens/Profile/ProfileScreen';
import PersonalInfoScreen from './assests/Screens/Profile/PersonalInfoScreen';
import TermsConditionsScreen from './assests/Screens/Profile/TermsConditionsScreen';
import AboutUsScreen from './assests/Screens/Profile/AboutUsScreen';
import PrivacyPolicyScreen from './assests/Screens/Profile/PrivacyPolicyScreen';
import MyPlansScreen from './assests/Screens/Profile/MyPlansScreen';


import ThirdPartyConnectScreen from './assests/Screens/Device/ThirdPartyConnectScreen';

import DeviceListScreen from './assests/Screens/Device/DeviceListScreen';
import DevicePairingScreen from './assests/Screens/Device/DevicePairingScreen';
import DeviceSearchingScreen from './assests/Screens/Device/DeviceSearchingScreen';
import DeviceDetailsScreen from './assests/Screens/Device/DeviceDetailsScreen';
import DeviceSettingsScreen from './assests/Screens/Device/DeviceSettingsScreen';
import AutoMonitorSettingsScreen from './assests/Screens/Device/AutoMonitorSettingsScreen';
import AutoMonitorScreen from './assests/Screens/Device/AutoMonitorScreen';

import SOSContactListScreen from './assests/Screens/SOS/SOSContactListScreen';
import EditSOSContactScreen from './assests/Screens/SOS/EditSOSContactScreen';
import SOSContactMainScreen from './assests/Screens/SOS/SOSContactMainScreen';
import SOSContactAddScreen from './assests/Screens/SOS/SOSContactAddScreen';
import AddContactScreen from './assests/Screens/SOS/AddContactScreen';
import EmergencyServicesScreen from './assests/Screens/SOS/EmergencyServicesScreen';


import SetLanguageScreen from './assests/Screens/Device/SetLanguageScreen';
import FactoryResetScreen from './assests/Screens/Device/FactoryResetScreen';

import GoalSettingScreen from './assests/Screens/Fitness/GoalSettingScreen';
import RunningScreen from './assests/Screens/Fitness/RunningScreen';
import CyclingScreen from './assests/Screens/Fitness/CyclingScreen';
import YogaScreen from './assests/Screens/Fitness/YogaScreen';
import ExerciseScreen from './assests/Screens/Fitness/ExerciseScreen';
import CountDown from './assests/Screens/Fitness/CountDown';
import PostWorkoutSummaryScreen from './assests/Screens/Fitness/PostWorkoutSummaryScreen';

// Activity Tracker Screens
import ActivityTrackerScreen from './assests/Screens/ActivityTracker/ActivityTrackerScreen';
import StepTrackerScreen from './assests/Screens/ActivityTracker/StepTrackerScreen';
import CaloriesScreen from './assests/Screens/ActivityTracker/CaloriesScreen';
import SleepTrackerScreen from './assests/Screens/ActivityTracker/SleepTrackerScreen';
import HeartRateScreen from './assests/Screens/ActivityTracker/HeartRateScreen';
import DistanceTrackerScreen from './assests/Screens/ActivityTracker/DistanceTrackerScreen';
import GoalsSettingsScreen from './assests/Screens/ActivityTracker/GoalsSettingsScreen';
import AddActivityScreen from './assests/Screens/ActivityTracker/AddActivityScreen';

// Health Tracker Screens
import HealthTrackerScreen from './assests/Screens/HealthTracker/HealthTrackerScreen';
import HeartRateMonitorScreen from './assests/Screens/HealthTracker/HeartRateMonitorScreen';
import BMIScreen from './assests/Screens/HealthTracker/BMIScreen';
import BloodPressureScreen from './assests/Screens/HealthTracker/BloodPressureScreen';
import SpO2Screen from './assests/Screens/HealthTracker/SpO2Screen';
import TemperatureScreen from './assests/Screens/HealthTracker/TemperatureScreen';
import HRVScreen from './assests/Screens/HealthTracker/HRVScreen';
import StressScreen from './assests/Screens/HealthTracker/StressScreen';
import BloodGlucoseScreen from './assests/Screens/HealthTracker/BloodGlucoseScreen';
import SmartCheckupScreen from './assests/Screens/HealthTracker/SmartCheckupScreen';

import PharmacyScreen from './assests/Screens/Pharmacy/PharmacyScreen';
import PharmacyCartScreen from './assests/Screens/Pharmacy/PharmacyCartScreen';
import PharmacyOrdersScreen from './assests/Screens/Pharmacy/PharmacyOrdersScreen';
import PharmacyBillScreen from './assests/Screens/Pharmacy/PharmacyBillScreen';
import DrugDetailsScreen from './assests/Screens/Pharmacy/DrugDetailsScreen';
import PharmacyListScreen from './assests/Screens/Pharmacy/PharmacyListScreen';
import PharmacyDetailScreen from './assests/Screens/Pharmacy/PharmacyDetailScreen';
import DeliveryStatusScreen from './assests/Screens/Pharmacy/DeliveryStatusScreen';
import DeliverySuccessScreen from './assests/Screens/Pharmacy/DeliverySuccessScreen';
import FavouritesScreen from './assests/Screens/Pharmacy/FavouritesScreen';
import AllProductsScreen from './assests/Screens/Pharmacy/AllProductsScreen';
import ManageProductsScreen from './assests/Screens/Pharmacy/ManageProductsScreen';

import FindDoctorScreen from './assests/Screens/Consultation/FindDoctorScreen';
import OnlineConsultationScreen from './assests/Screens/Consultation/OnlineConsultationScreen';
import DoctorDetailsScreen from './assests/Screens/Consultation/DoctorDetailsScreen';
import PatientDetailsScreen from './assests/Screens/Consultation/PatientDetailsScreen';
import BookingSuccessScreen from './assests/Screens/Consultation/BookingSuccessScreen';
import BookAppointmentScreen from './assests/Screens/Consultation/BookAppointmentScreen';

// Settings Screens
import NotificationSettingsScreen from './assests/Screens/Settings/NotificationSettingsScreen';
import NotificationsScreen from './assests/Screens/Notifications/NotificationsScreen';
import MedicineReminderScreen from './assests/Screens/Settings/MedicineReminderScreen';
import AIAssistantScreen from './assests/Screens/AIAssistant/AIAssistantScreen';
import DoctorsReviewsScreen from './assests/Screens/Consultation/DoctorReviewsScreen';
import AllSpecialtiesScreen from './assests/Screens/Consultation/AllSpecialtiesScreen';
import CheckupHistoryScreen from './assests/Screens/HealthTracker/CheckupHistoryScreen';
import HealthEducationScreen from './assests/Screens/HealthTracker/HealthEducationScreen';
import YouTubePlayerScreen from './assests/Screens/HealthTracker/YouTubePlayerScreen';


/* ---------- NAVIGATORS ---------- */
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const DeviceStackNav = createNativeStackNavigator();

/* ---------- TABS ---------- */
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#23238E',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { height: 60, paddingBottom: 8 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home-outline',
            Devices: 'watch-outline',
            Records: 'document-text-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Devices" component={DeviceStack} />
      <Tab.Screen name="Records" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/* ---------- MAIN STACK ---------- */
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />

      {/* Main App with Tabs */}
      <Stack.Screen name="HomeScreen" component={AppTabs} />

      <Stack.Screen name="HealthCoinsScreen" component={HealthCoinsScreen} />
      <Stack.Screen name="OffersScreen" component={OffersScreen} />
      <Stack.Screen name="OfferDetailScreen" component={OfferDetailScreen} />
      <Stack.Screen name="RedeemSuccessScreen" component={RedeemSuccessScreen} />
      <Stack.Screen name="CoinsCollectedScreen" component={CoinsCollectedScreen} />
      <Stack.Screen name="LocationScreen" component={LocationScreen} />
      <Stack.Screen name="AddressListScreen" component={AddressListScreen} />
      <Stack.Screen name="AddEditAddressScreen" component={AddEditAddressScreen} />

      <Stack.Screen name="PolicyCoverageScreen" component={PolicyCoverageScreen} />
      <Stack.Screen name="CorporatePlansScreen" component={CorporatePlansScreen} />

      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
      <Stack.Screen name="PaymentMethodsScreen" component={PaymentMethodsScreen} />

      <Stack.Screen name="LabTestsScreen" component={LabTestsScreen} />
      <Stack.Screen name="LabListingScreen" component={LabListingScreen} />
      <Stack.Screen name="LabDetailsScreen" component={LabDetailsScreen} />
      <Stack.Screen name="TestDetailsScreen" component={TestDetailsScreen} />
      <Stack.Screen name="LabTestDetailsScreen" component={LabTestDetailsScreen} />
      <Stack.Screen name="LabDetailsInfoScreen" component={LabDetailsInfoScreen} />
      <Stack.Screen name="LabTestDetailScreen" component={LabTestDetailScreen} />
      <Stack.Screen name="LabPaymentScreen" component={LabPaymentScreen} />
      <Stack.Screen name="LabBillScreen" component={LabBillScreen} />
      <Stack.Screen name="ScheduleLabScreen" component={ScheduleLabScreen} />
      <Stack.Screen name="LabOrderConfirmScreen" component={LabOrderConfirmScreen} />
      <Stack.Screen name="LabLocationScreen" component={LabLocationScreen} />
      <Stack.Screen name="CollectionDetailsScreen" component={CollectionDetailsScreen} />
      <Stack.Screen name="SampleCollectedScreen" component={SampleCollectedScreen} />
      <Stack.Screen name="CollectionStatusScreen" component={CollectionStatusScreen} />
      <Stack.Screen name="LabCartScreen" component={LabCartScreen} />
      <Stack.Screen name="LabTestsListScreen" component={LabTestsListScreen} />


      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
      {/* OrdersScreen is now in Tabs, but keeping direct access if needed */}
      <Stack.Screen name="MyOrdersScreen" component={OrdersScreen} />
      <Stack.Screen name="OrdersScreen" component={OrdersScreen} />

      <Stack.Screen name="UploadPrescriptionScreen" component={UploadPrescriptionScreen} />
      <Stack.Screen name="PrescriptionSuccessScreen" component={PrescriptionSuccessScreen} />
      <Stack.Screen name="MedicinesQuotationScreen" component={MedicinesQuotationScreen} />
      <Stack.Screen name="Prescription" component={Prescription} />
      <Stack.Screen name="QuotationsScreen" component={QuotationsScreen} />

      {/* Reports Screens */}
      <Stack.Screen name="MyReportsScreen" component={MyReportsScreen} />
      <Stack.Screen name="ViewLabReportScreen" component={ViewLabReportScreen} />
      <Stack.Screen name="ViewPrescriptionScreen" component={ViewPrescriptionScreen} />
      <Stack.Screen name="CompletedLabReportScreen" component={CompletedLabReportScreen} />

      <Stack.Screen name="ConsultationScreen" component={ConsultationScreen} />
      <Stack.Screen name="AppointmentHistoryScreen" component={AppointmentHistoryScreen} />
      <Stack.Screen name="AppointmentDetailsScreen" component={AppointmentDetailsScreen} />
      <Stack.Screen name="DoctorBookingScreen" component={DoctorBookingScreen} />
      <Stack.Screen name="SelectPatientScreen" component={SelectPatientScreen} />
      <Stack.Screen name="ConsultationPaymentScreen" component={ConsultationPaymentScreen} />
      <Stack.Screen name="ConsultationBillScreen" component={ConsultationBillScreen} />
      <Stack.Screen name="BookingConfirmScreen" component={BookingConfirmScreen} />
      <Stack.Screen name="CompletedAppointmentScreen" component={CompletedAppointmentScreen} />
      <Stack.Screen name="RescheduleAppointmentScreen" component={RescheduleAppointmentScreen} />
      <Stack.Screen name="DoctorAppointmentsScreen" component={DoctorAppointmentsScreen} />
      <Stack.Screen name="HospitalListingScreen" component={HospitalListingScreen} />
      <Stack.Screen name="HospitalDetailsScreen" component={HospitalDetailsScreen} />
      <Stack.Screen name="BenefitsScreen" component={BenefitsScreen} />
      <Stack.Screen name="CouponScreen" component={CouponScreen} />
      <Stack.Screen name="CancelationScreen" component={CancelationScreen} />
      <Stack.Screen name="AddPatientScreen" component={AddPatientScreen} />

      <Stack.Screen name="ChatsScreen" component={ChatsScreen} />
      <Stack.Screen name="DoctorChatScreen" component={DoctorChatScreen} />
      <Stack.Screen name="DocVideoCallScreen" component={DocVideoCallScreen} />
      <Stack.Screen name="CallScreen" component={CallScreen} />
      <Stack.Screen name="CallsHistoryScreen" component={CallsHistoryScreen} />
      <Stack.Screen name="PrescriptionDownloadScreen" component={PrescriptionDownloadScreen} />

      {/* Profile sub-screens */}
      <Stack.Screen name="PersonalInfoScreen" component={PersonalInfoScreen} />
      <Stack.Screen name="TermsConditionsScreen" component={TermsConditionsScreen} />
      <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
      <Stack.Screen name="MyPlansScreen" component={MyPlansScreen} />


      <Stack.Screen name="ThirdPartyConnectScreen" component={ThirdPartyConnectScreen} />

      <Stack.Screen name="GoalSettingScreen" component={GoalSettingScreen} />
      <Stack.Screen name="RunningScreen" component={RunningScreen} />
      <Stack.Screen name="CyclingScreen" component={CyclingScreen} />
      <Stack.Screen name="YogaScreen" component={YogaScreen} />
      <Stack.Screen name="ExerciseScreen" component={ExerciseScreen} />
      <Stack.Screen name="CountDown" component={CountDown} />
      <Stack.Screen name="PostWorkoutSummary" component={PostWorkoutSummaryScreen} />

      {/* Activity Tracker Screens */}
      <Stack.Screen name="ActivityTrackerScreen" component={ActivityTrackerScreen} />
      <Stack.Screen name="StepTrackerScreen" component={StepTrackerScreen} />
      <Stack.Screen name="CaloriesScreen" component={CaloriesScreen} />
      <Stack.Screen name="SleepTrackerScreen" component={SleepTrackerScreen} />
      <Stack.Screen name="HeartRateScreen" component={HeartRateScreen} />
      <Stack.Screen name="DistanceTrackerScreen" component={DistanceTrackerScreen} />
      <Stack.Screen name="GoalsSettingsScreen" component={GoalsSettingsScreen} />
      <Stack.Screen name="AddActivityScreen" component={AddActivityScreen} />

      {/* Health Tracker Screens */}
      <Stack.Screen name="HealthTrackerScreen" component={HealthTrackerScreen} />
      <Stack.Screen name="HeartRateMonitorScreen" component={HeartRateMonitorScreen} />
      <Stack.Screen name="BMIScreen" component={BMIScreen} />
      <Stack.Screen name="BloodPressureScreen" component={BloodPressureScreen} />
      <Stack.Screen name="SpO2Screen" component={SpO2Screen} />
      <Stack.Screen name="TemperatureScreen" component={TemperatureScreen} />
      <Stack.Screen name="HRVScreen" component={HRVScreen} />
      <Stack.Screen name="StressScreen" component={StressScreen} />
      <Stack.Screen name="BloodGlucoseScreen" component={BloodGlucoseScreen} />
      <Stack.Screen name="SmartCheckupScreen" component={SmartCheckupScreen} />

      <Stack.Screen name="PharmacyScreen" component={PharmacyScreen} />
      <Stack.Screen name="PharmacyCartScreen" component={PharmacyCartScreen} />
      <Stack.Screen name="PharmacyOrdersScreen" component={PharmacyOrdersScreen} />
      <Stack.Screen name="PharmacyBillScreen" component={PharmacyBillScreen} />
      <Stack.Screen name="DrugDetailsScreen" component={DrugDetailsScreen} />
      <Stack.Screen name="PharmacyListScreen" component={PharmacyListScreen} />
      <Stack.Screen name="PharmacyDetailScreen" component={PharmacyDetailScreen} />
      <Stack.Screen name="DeliveryStatusScreen" component={DeliveryStatusScreen} />
      <Stack.Screen name="DeliverySuccessScreen" component={DeliverySuccessScreen} />
      <Stack.Screen name="FavouritesScreen" component={FavouritesScreen} />
      <Stack.Screen name="AllProductsScreen" component={AllProductsScreen} />
      <Stack.Screen name="ManageProductsScreen" component={ManageProductsScreen} />

      <Stack.Screen name="FindDoctorScreen" component={FindDoctorScreen} />
      <Stack.Screen name="OnlineConsultationScreen" component={OnlineConsultationScreen} />
      <Stack.Screen name="DoctorDetailsScreen" component={DoctorDetailsScreen} />
      <Stack.Screen name="PatientDetailsScreen" component={PatientDetailsScreen} />
      <Stack.Screen name="BookingSuccessScreen" component={BookingSuccessScreen} />
      <Stack.Screen name="BookAppointmentScreen" component={BookAppointmentScreen} />

      <Stack.Screen name="NotificationSettingsScreen" component={NotificationSettingsScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationsScreen} />
      <Stack.Screen name="MedicineReminderScreen" component={MedicineReminderScreen} />
      <Stack.Screen name="AIAssistantScreen" component={AIAssistantScreen} />
      <Stack.Screen name="YouTubePlayer" component={YouTubePlayerScreen} />
      <Stack.Screen name="DoctorReviewsScreen" component={DoctorsReviewsScreen} />
      <Stack.Screen name="AllSpecialtiesScreen" component={AllSpecialtiesScreen} />
      <Stack.Screen name="CheckupHistoryScreen" component={CheckupHistoryScreen} />
      <Stack.Screen name="HealthEducationScreen" component={HealthEducationScreen} />
      <Stack.Screen name="EmergencyServicesScreen" component={EmergencyServicesScreen} />

    </Stack.Navigator>

  );
}

/* ---------- DEVICE STACK ---------- */
function DeviceStack() {
  return (
    <DeviceStackNav.Navigator screenOptions={{ headerShown: false }}>
      <DeviceStackNav.Screen name="DeviceListScreen" component={DeviceListScreen} />
      <DeviceStackNav.Screen name="DevicePairingScreen" component={DevicePairingScreen} />
      <DeviceStackNav.Screen name="DeviceSearchingScreen" component={DeviceSearchingScreen} />
      <DeviceStackNav.Screen name="DeviceDetailsScreen" component={DeviceDetailsScreen} />
      <DeviceStackNav.Screen name="DeviceSettingsScreen" component={DeviceSettingsScreen} />
      <DeviceStackNav.Screen name="AutoMonitorSettingsScreen" component={AutoMonitorSettingsScreen} />
      <DeviceStackNav.Screen name="AutoMonitorScreen" component={AutoMonitorScreen} />
      <DeviceStackNav.Screen name="SOSContactMainScreen" component={SOSContactMainScreen} />
      <DeviceStackNav.Screen name="SOSContactListScreen" component={SOSContactListScreen} />
      <DeviceStackNav.Screen name="SOSContactAddScreen" component={SOSContactAddScreen} />
      <DeviceStackNav.Screen name="AddContactScreen" component={AddContactScreen} />
      <DeviceStackNav.Screen name="EditSOSContactScreen" component={EditSOSContactScreen} />
      <DeviceStackNav.Screen name="SetLanguageScreen" component={SetLanguageScreen} />
      <DeviceStackNav.Screen name="FactoryResetScreen" component={FactoryResetScreen} />
    </DeviceStackNav.Navigator>
  );
}

/* ---------- APP ---------- */
export default function App() {
  useEffect(() => {
    // 1. Initialize Google Sign-In
    configureGoogleSignIn();

    // 2. Initialize Notifications
    const initNotifications = async () => {
      const unsubscribes = await initializeNotifications({
        onNotificationReceived: (message) => {
          console.log('FCM Notification Received:', message);
        },
        onNotificationTapped: (message) => {
          console.log('FCM Notification Tapped:', message);
          if (message.data) {
            const { type, cartType, appointmentId } = message.data;
            if (type === 'cart_add') {
              navigate(cartType === 'lab' ? 'LabCartScreen' : 'PharmacyCartScreen');
            } else if (type === 'medicine_reminder') {
              navigate('MedicineReminderScreen');
            } else if (type === 'appointment_reminder') {
              navigate('AppointmentDetailsScreen', { appointmentId });
            }
          }
        },
      });

      return () => {
        if (unsubscribes.unsubscribeForeground) unsubscribes.unsubscribeForeground();
        if (unsubscribes.unsubscribeOpened) unsubscribes.unsubscribeOpened();
        if (unsubscribes.unsubscribeTokenRefresh) unsubscribes.unsubscribeTokenRefresh();
      };
    };

    initNotifications();
    initializeLocalNotifications();

    // 3. Health Connect Setup
    const setupHealth = async () => {
      try {
        await initialize();
        await healthConnectService.init();
        await healthConnectService.requestPermissions();
      } catch (e) {
        console.log('Health Connect setup failed:', e);
      }
    };
    setupHealth();
  }, []);

  return (
    <View style={styles.container}>
      <NavigationContainer ref={navigationRef}>
        <MainStack />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
