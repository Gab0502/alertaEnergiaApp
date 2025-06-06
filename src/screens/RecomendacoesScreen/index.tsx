import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";
import {
  Lightbulb,
  Shield,
  Battery,
  Zap,
  Home,
  AlertTriangle,
  CheckCircle,
  Phone,
} from "lucide-react-native";

const emergencyContacts = [
  { name: "Defesa Civil", number: "199", icon: Shield },
  { name: "Bombeiros", number: "193", icon: AlertTriangle },
  { name: "SAMU", number: "192", icon: Phone },
];

const preventiveTips = [
  {
    category: "Antes da Falta de Energia",
    icon: Battery,
    color: "#bfdbfe", 
    textColor: "#1e40af", 
    tips: [
      "Mantenha lanternas e pilhas sempre à mão",
      "Tenha um kit de emergência com água e alimentos não perecíveis",
      "Carregue dispositivos móveis e power banks",
      "Conheça a localização do disjuntor principal",
      "Tenha velas e fósforos em local seguro",
    ],
  },
  {
    category: "Durante a Interrupção",
    icon: Zap,
    color: "#fed7aa", 
    textColor: "#c2410c", 
    tips: [
      "Desligue equipamentos eletrônicos para evitar danos",
      "Evite abrir geladeira e freezer desnecessariamente",
      "Use lanternas ao invés de velas sempre que possível",
      "Mantenha a calma e ajude vizinhos se necessário",
      "Relate a falta de energia para a concessionária",
    ],
  },
  {
    category: "Após o Restabelecimento",
    icon: CheckCircle,
    color: "#bbf7d0", 
    textColor: "#166534", 
    tips: [
      "Ligue equipamentos gradualmente",
      "Verifique se alimentos refrigerados estão próprios para consumo",
      "Ajuste relógios e equipamentos eletrônicos",
      "Documente prejuízos para eventual indenização",
      "Relate problemas persistentes à concessionária",
    ],
  },
];

const safetyAlerts = [
  {
    title: "⚠️ Nunca toque em fios caídos",
    description: "Mantenha distância de pelo menos 8 metros de fios no chão",
  },
  {
    title: "🔥 Cuidado com velas e lamparinas",
    description: "Nunca deixe velas acesas sem supervisão",
  },
  {
    title: "🏠 Ventilação em geradores",
    description: "Use geradores apenas em áreas bem ventiladas",
  },
  {
    title: "📱 Economize bateria do celular",
    description: "Use modo de economia de energia durante emergências",
  },
];

export default function RecomendacoesScreen() {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {}
      <View style={[styles.card, { backgroundColor: "#fee2e2"  }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Phone color="#b91c1c" width={20} height={20} />
            <Text style={[styles.cardTitle, { color: "#7f1d1d" }]}>Contatos de Emergência</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          {emergencyContacts.map(({ name, number, icon: Icon }, idx) => (
            <View key={idx} style={styles.contactRow}>
              <View style={styles.contactInfo}>
                <Icon color="#b91c1c" width={20} height={20} />
                <Text style={styles.contactName}>{name}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCall(number)}
              >
                <Text style={styles.callButtonText}>{number}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <AlertTriangle color="#d97706" width={20} height={20} />
            <Text style={styles.cardTitle}>Alertas de Segurança</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          {safetyAlerts.map(({ title, description }, idx) => (
            <View key={idx} style={styles.alertBox}>
              <Text style={styles.alertTitle}>{title}</Text>
              <Text style={styles.alertDescription}>{description}</Text>
            </View>
          ))}
        </View>
      </View>

      {}
      {preventiveTips.map(({ category, icon: Icon, color, textColor, tips }, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: color }]}>
                <Icon color={textColor} width={20} height={20} />
              </View>
              <Text style={styles.cardTitle}>{category}</Text>
            </View>
          </View>
          <View style={styles.cardContent}>
            {tips.map((tip, tipIdx) => (
              <View key={tipIdx} style={styles.tipRow}>
                <CheckCircle color="#16a34a" width={16} height={16} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  card: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f9fafb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {

  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical:5
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactName: {
    fontWeight: "500",
    fontSize: 16,
    marginLeft: 8,
  },
  callButton: {
    backgroundColor: "#b91c1c",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  callButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  alertBox: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 8,
  },
  alertTitle: {
    fontWeight: "700",
    color: "#78350f",
    marginBottom: 4,
  },
  alertDescription: {
    color: "#92400e",
  },
  iconCircle: {
    padding: 6,
    borderRadius: 6,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 6,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionButton: {
    width: "48%",
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  additionalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  additionalText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  resourceButton: {
    borderWidth: 1,
    borderColor: "#93c5fd",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resourceButtonText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});