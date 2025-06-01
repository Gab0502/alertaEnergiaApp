import React from "react";
import { SafeAreaView, Platform, StatusBar } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import {
  BarChart3,
  MapPin,
  Clock,
  AlertTriangle,
  Lightbulb,
} from "lucide-react-native";

import PanoramaScreen from "../screens/PanoramaScreen";
import LocalizacaoScreen from "../screens/LocalizacaoScreen";
import TempoScreen from "../screens/TempoScreen";
import PrejuizosScreen from "../screens/PrejuizoScreen";
import RecomendacoesScreen from "../screens/RecomendacoesScreen";

const Tab = createBottomTabNavigator();

export default function Navigation() {
  return (
    <SafeAreaView style={{ 
      flex: 1,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
    }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let Icon;

              switch (route.name) {
                case "Panorama":
                  Icon = BarChart3;
                  break;
                case "Localizacao":
                  Icon = MapPin;
                  break;
                case "Tempo":
                  Icon = Clock;
                  break;
                case "Prejuizos":
                  Icon = AlertTriangle;
                  break;
                case "Recomendacoes":
                  Icon = Lightbulb;
                  break;
                default:
                  Icon = BarChart3;
              }

              return <Icon color={color} size={size} />;
            },
            tabBarActiveTintColor: "#2563eb",
            tabBarInactiveTintColor: "gray",
            headerShown: false,
            tabBarLabelStyle: {
              paddingBottom: 5,
              fontSize: 12,
            },
            tabBarItemStyle: {
              padding: 5,
            },
            tabBarStyle: {
              height: 60,
              paddingTop: 5,
            },
          })}
        >
          <Tab.Screen name="Panorama" component={PanoramaScreen} />
          <Tab.Screen name="Localizacao" component={LocalizacaoScreen} />
          <Tab.Screen name="Tempo" component={TempoScreen} />
          <Tab.Screen name="Prejuizos" component={PrejuizosScreen} />
          <Tab.Screen name="Recomendacoes" component={RecomendacoesScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}