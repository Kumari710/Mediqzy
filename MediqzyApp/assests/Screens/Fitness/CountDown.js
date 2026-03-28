import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, StatusBar, Animated } from "react-native";
import { moderateScale } from "../../Utils/responsive";

export default function Countdown({ navigation, route }) {
  const [count, setCount] = useState(3);
  const activeTab = route.params?.activeTab;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count === 0) {
      // 🚀 Redirect to appropriate screen based on activeTab
      const targetScreen = activeTab === 'Cycling' ? 'CyclingScreen'
        : activeTab === 'Running' ? 'RunningScreen'
          : activeTab === 'Walking' ? 'RunningScreen'
            : activeTab === 'Yoga' ? 'YogaScreen'
              : activeTab === 'Swimming' ? 'RunningScreen'
                : activeTab === 'Strength' ? 'RunningScreen'
                  : 'RunningScreen'; // Default fallback

      navigation.replace(targetScreen, { activeTab });
      return;
    }

    // Bounce animation on count change
    scaleAnim.setValue(0.5);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, activeTab]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#23238E" barStyle="light-content" />
      <Animated.Text style={[styles.countText, { transform: [{ scale: scaleAnim }] }]}>
        {count === 0 ? "GO!" : count}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23238E",
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: moderateScale(120),
    fontWeight: "900",
  },
});
