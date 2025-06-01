import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Button, Badge } from "react-native-paper";
import { AlertTriangle, Home, Building, DollarSign, Users, Plus } from "lucide-react-native";

type Severity = "Crítico" | "Alto" | "Médio";

interface DamageReport {
  id: number;
  location: string;
  type: string;
  affectedUnits: number;
  estimatedCost: number;
  description: string;
  severity: Severity;
  reportedBy: string;
  date: string;
}

const PrejuizosScreen = () => {
  const [newReport, setNewReport] = useState("");

  const damageReports: DamageReport[] = [
    {
      id: 1,
      location: "Centro - São Paulo",
      type: "Residencial",
      affectedUnits: 150,
      estimatedCost: 25000,
      description: "Perda de alimentos em geladeiras, danos em equipamentos eletrônicos",
      severity: "Alto",
      reportedBy: "João Silva",
      date: "2024-01-15",
    },
    {
      id: 2,
      location: "Vila Olímpia - SP",
      type: "Comercial",
      affectedUnits: 45,
      estimatedCost: 80000,
      description: "Restaurantes perderam estoque, lojas fecharam durante o período",
      severity: "Crítico",
      reportedBy: "Maria Santos",
      date: "2024-01-14",
    },
    {
      id: 3,
      location: "Copacabana - RJ",
      type: "Misto",
      affectedUnits: 200,
      estimatedCost: 45000,
      description: "Prédios residenciais e estabelecimentos comerciais afetados",
      severity: "Médio",
      reportedBy: "Carlos Oliveira",
      date: "2024-01-13",
    },
  ];

  const damageCategories = [
    { icon: Home, label: "Residencial", count: 12, color: "#BFDBFE", textColor: "#1E40AF" },
    { icon: Building, label: "Comercial", count: 8, color: "#DCFCE7", textColor: "#166534" },
    { icon: Users, label: "Público", count: 3, color: "#E9D5FF", textColor: "#6B21A8" },
    { icon: DollarSign, label: "Industrial", count: 5, color: "#FFEDD5", textColor: "#C2410C" },
  ];

  const severityColors: Record<Severity, { border: string; text: string }> = {
    Crítico: { border: "#EF4444", text: "#DC2626" },
    Alto: { border: "#F97316", text: "#EA580C" },
    Médio: { border: "#F59E0B", text: "#D97706" },
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 16 }}>
      {/* Resumo dos Prejuízos */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Resumo dos Prejuízos</Text>
          <View style={styles.grid}>
            {damageCategories.map(({ icon: Icon, label, count, color, textColor }, i) => (
              <View key={i} style={[styles.categoryBox, { backgroundColor: color }]}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Icon color={textColor} size={20} />
                  <Text style={[styles.categoryLabel, { color: textColor, marginLeft: 8 }]}>{label}</Text>
                </View>
                <Text style={[styles.categoryCount, { color: textColor }]}>{count}</Text>
                <Text style={[styles.categorySubText, { color: textColor }]}>Relatórios</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Reportar Prejuízo */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Plus size={20} color="#000" />
            <Text style={[styles.cardTitle, { marginLeft: 8 }]}>Reportar Prejuízo</Text>
          </View>
          <TextInput
            multiline
            placeholder="Descreva os prejuízos observados (residências, estabelecimentos, equipamentos afetados, etc.)"
            value={newReport}
            onChangeText={setNewReport}
            style={styles.textarea}
          />
          <View style={{ flexDirection: "row", marginTop: 12, gap: 8 }}>
            <Button
              mode="contained"
              icon={() => <AlertTriangle color="#fff" size={16} />}
              onPress={() => {
                // ação para enviar relatório
              }}
              style={{ flex: 1 }}
            >
              Enviar Relatório
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                // ação para anexar foto
              }}
              style={{ flex: 1 }}
            >
              Anexar Foto
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Relatórios Recentes</Text>
          {damageReports.map((report) => {
            const colors = severityColors[report.severity];
            return (
              <View key={report.id} style={styles.reportBox}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <View>
                    <Text style={styles.reportLocation}>{report.location}</Text>
                    <Text style={styles.reportSubtitle}>{`${report.type} • ${report.date}`}</Text>
                  </View>
                  <Badge
                    size={24}
                    style={{
                      borderColor: colors.border,
                      borderWidth: 1,
                      backgroundColor: "transparent",
                      color: colors.text, 
                      fontSize: 12
                    }}
                  >
                    {report.severity}
                  </Badge>
                </View>
                <Text style={styles.reportDescription}>{report.description}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <View>
                    <Text style={styles.reportLabel}>Unidades Afetadas:</Text>
                    <Text style={styles.reportValue}>{report.affectedUnits}</Text>
                  </View>
                  <View>
                    <Text style={styles.reportLabel}>Custo Estimado:</Text>
                    <Text style={[styles.reportValue, { color: "#DC2626" }]}>
                      R$ {report.estimatedCost.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reportReportedBy}>Reportado por: {report.reportedBy}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button mode="outlined" style={{ flex: 1 }} onPress={() => {}}>
                    Ver Detalhes
                  </Button>
                  <Button mode="outlined" style={{ flex: 1 }} onPress={() => {}}>
                    Editar
                  </Button>
                </View>
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* Impacto Total */}
      <Card style={[styles.card, { backgroundColor: "#FEE2E2" }]}>
        <Card.Content style={{ alignItems: "center" }}>
          <AlertTriangle size={32} color="#B91C1C" style={{ marginBottom: 12 }} />
          <Text style={[styles.cardTitle, { color: "#991B1B" }]}>Impacto Total do Mês</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 12 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 24, fontWeight: "700", color: "#B91C1C" }}>R$ 450k</Text>
              <Text style={{ color: "#B91C1C" }}>Prejuízos Totais</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 24, fontWeight: "700", color: "#B91C1C" }}>1.2k</Text>
              <Text style={{ color: "#B91C1C" }}>Pessoas Afetadas</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryBox: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryLabel: {
    fontWeight: "500",
    fontSize: 14,
  },
  categoryCount: {
    fontWeight: "700",
    fontSize: 24,
  },
  categorySubText: {
    fontSize: 12,
    opacity: 0.8,
  },
  textarea: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
  },
  reportBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reportLocation: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },
  reportSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  reportDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  reportLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  reportValue: {
    fontWeight: "700",
    fontSize: 14,
  },
  reportReportedBy: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 8,
  },
});

export default PrejuizosScreen;