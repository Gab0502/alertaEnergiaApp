import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from "react-native";
import { Card, Button, Badge } from "react-native-paper";
import { AlertTriangle, Home, Building, DollarSign, Users, Plus, X, Calendar } from "lucide-react-native"; 
import AsyncStorage from "@react-native-async-storage/async-storage"; 

type Severity = "Crítico" | "Alto" | "Médio" | "Baixo"; 

interface DamageReport {
  id: number;
  location: string;
  type: "Residencial" | "Comercial" | "Público" | "Industrial" | "Outro"; 
  affectedUnits: number;
  estimatedCost: number;
  description: string;
  severity: Severity;
  reportedBy: string;
  date: string; 
}

const initialDamageReports: DamageReport[] = [
  {
    id: 1,
    location: "Centro - São Paulo",
    type: "Residencial",
    affectedUnits: 150,
    estimatedCost: 25000,
    description: "Perda de alimentos em geladeiras, danos em equipamentos eletrônicos, interrupção de serviços essenciais.",
    severity: "Alto",
    reportedBy: "João Silva",
    date: "2024-05-20", 
  },
  {
    id: 2,
    location: "Vila Olímpia - SP",
    type: "Comercial",
    affectedUnits: 45,
    estimatedCost: 80000,
    description: "Restaurantes perderam estoque perecível, lojas fecharam durante o período de falta de energia, impacto nas vendas diárias.",
    severity: "Crítico",
    reportedBy: "Maria Santos",
    date: "2024-05-18",
  },
];

const damageCategoriesConfig = [
  { icon: Home, label: "Residencial", type: "Residencial", color: "#E0F2FE", textColor: "#2563EB" }, 
  { icon: Building, label: "Comercial", type: "Comercial", color: "#DCFCE7", textColor: "#16A34A" }, 
  { icon: Users, label: "Público", type: "Público", color: "#EDE9FE", textColor: "#7C3AED" }, 
  { icon: DollarSign, label: "Industrial", type: "Industrial", color: "#FFEDD5", textColor: "#EA580C" }, 
  { icon: AlertTriangle, label: "Outro", type: "Outro", color: "#FEE2E2", textColor: "#DC2626" }, 
];

const severityColors: Record<Severity, { border: string; text: string }> = {
  Crítico: { border: "#EF4444", text: "#DC2626" }, 
  Alto: { border: "#F97316", text: "#EA580C" }, 
  Médio: { border: "#FACC15", text: "#EAB308" }, 
  Baixo: { border: "#22C55E", text: "#16A34A" }, 
};

const PrejuizosScreen = () => {
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const [newReportLocation, setNewReportLocation] = useState("");
  const [newReportType, setNewReportType] = useState<DamageReport['type']>("Residencial");
  const [newReportAffectedUnits, setNewReportAffectedUnits] = useState("");
  const [newReportEstimatedCost, setNewReportEstimatedCost] = useState("");
  const [newReportDescription, setNewReportDescription] = useState("");
  const [newReportSeverity, setNewReportSeverity] = useState<Severity>("Médio");
  const [newReportReportedBy, setNewReportReportedBy] = useState("");
  const [newReportDate, setNewReportDate] = useState(new Date().toISOString().split('T')[0]); 

  const [damageSummary, setDamageSummary] = useState({
    categories: damageCategoriesConfig.map(cat => ({ ...cat, count: 0 })),
    totalCost: 0,
    totalAffectedPeople: 0,
  });

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const storedReports = await AsyncStorage.getItem("damageReports");
      let reports: DamageReport[] = [];
      if (storedReports) {
        reports = JSON.parse(storedReports);
      } else {

        reports = initialDamageReports;
        await AsyncStorage.setItem("damageReports", JSON.stringify(initialDamageReports));
      }
      setDamageReports(reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Erro ao carregar relatórios de prejuízos:", error);
      Alert.alert("Erro", "Não foi possível carregar os relatórios de prejuízos.");

      setDamageReports(initialDamageReports);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDamageSummary = useCallback((reports: DamageReport[]) => {
    let totalCost = 0;
    let totalAffectedPeople = 0;
    const categoriesCount: Record<DamageReport['type'], number> = {
      Residencial: 0, Comercial: 0, Público: 0, Industrial: 0, Outro: 0
    };

    reports.forEach(report => {
      totalCost += report.estimatedCost;
      totalAffectedPeople += report.affectedUnits; 
      if (categoriesCount[report.type] !== undefined) {
        categoriesCount[report.type]++;
      }
    });

    const updatedCategories = damageCategoriesConfig.map(cat => ({
      ...cat,
      count: categoriesCount[cat.type as "Residencial" | "Comercial" | "Público" | "Industrial" | "Outro"] || 0,
    }));

    setDamageSummary({
      categories: updatedCategories,
      totalCost,
      totalAffectedPeople,
    });
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    updateDamageSummary(damageReports);
  }, [damageReports, updateDamageSummary]);

  const resetForm = () => {
    setNewReportLocation("");
    setNewReportType("Residencial");
    setNewReportAffectedUnits("");
    setNewReportEstimatedCost("");
    setNewReportDescription("");
    setNewReportSeverity("Médio");
    setNewReportReportedBy("");
    setNewReportDate(new Date().toISOString().split('T')[0]);
  };

  const handleReportSubmit = async () => {
    if (!newReportLocation || !newReportAffectedUnits || !newReportEstimatedCost || !newReportDescription || !newReportReportedBy || !newReportDate) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cost = parseFloat(newReportEstimatedCost.replace(",", "."));
    const units = parseInt(newReportAffectedUnits, 10);

    if (isNaN(cost) || cost <= 0) {
      Alert.alert("Erro", "O custo estimado deve ser um número válido e maior que zero.");
      return;
    }
    if (isNaN(units) || units <= 0) {
      Alert.alert("Erro", "As unidades afetadas devem ser um número inteiro válido e maior que zero.");
      return;
    }

    const newDamage: DamageReport = {
      id: Date.now(), 
      location: newReportLocation,
      type: newReportType,
      affectedUnits: units,
      estimatedCost: cost,
      description: newReportDescription,
      severity: newReportSeverity,
      reportedBy: newReportReportedBy,
      date: newReportDate,
    };

    try {
      const updatedReports = [newDamage, ...damageReports]; 
      await AsyncStorage.setItem("damageReports", JSON.stringify(updatedReports));
      setDamageReports(updatedReports); 
      setShowReportModal(false);
      resetForm();
      Alert.alert("Sucesso", "Relatório de prejuízo enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar o relatório de prejuízo:", error);
      Alert.alert("Erro", "Não foi possível enviar o relatório. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Carregando relatórios...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardHeaderTitle}>Resumo dos Prejuízos</Text>
          <View style={styles.grid}>
            {damageSummary.categories.map(({ icon: Icon, label, count, color, textColor }, i) => (
              <View key={i} style={[styles.categoryBox, { backgroundColor: color }]}>
                <View style={styles.categoryHeader}>
                  <Icon color={textColor} size={20} />
                  <Text style={[styles.categoryLabel, { color: textColor }]}>{label}</Text>
                </View>
                <Text style={[styles.categoryCount, { color: textColor }]}>{count}</Text>
                <Text style={[styles.categorySubText, { color: textColor }]}>Relatórios</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      
      <Card style={styles.card}>
        <Card.Content>
          <TouchableOpacity
            style={styles.reportActionButton}
            onPress={() => setShowReportModal(true)}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#2563eb" />
            <Text style={styles.reportActionText}>Reportar Novo Prejuízo</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardHeaderTitle}>Relatórios Recentes</Text>
          {damageReports.length > 0 ? (
            damageReports.map((report) => {
              const colors = severityColors[report.severity];
              return (
                <View key={report.id} style={styles.reportBox}>
                  <View style={styles.reportHeader}>
                    <View>
                      <Text style={styles.reportLocation}>{report.location}</Text>
                      <Text style={styles.reportSubtitle}>{`${report.type} • ${report.date}`}</Text>
                    </View>
                    <Badge
                      size={24}
                      style={[
                        styles.severityBadge,
                        {
                          borderColor: colors.border,
                          backgroundColor: "transparent",
                          color: colors.text,
                        }
                      ]}
                    >
                      {report.severity}
                    </Badge>
                  </View>
                  <Text style={styles.reportDescription}>{report.description}</Text>
                  <View style={styles.reportDetailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.reportLabel}>Unid. Afetadas:</Text>
                      <Text style={styles.reportValue}>{report.affectedUnits}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.reportLabel}>Custo Estimado:</Text>
                      <Text style={[styles.reportValue, styles.estimatedCostValue]}>
                        R$ {report.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportReportedBy}>Reportado por: {report.reportedBy}</Text>
                  
                </View>
              );
            })
          ) : (
            <Text style={styles.noReportsText}>Nenhum relatório de prejuízo encontrado.</Text>
          )}
        </Card.Content>
      </Card>

      
      <Card style={[styles.card, styles.totalImpactCard]}>
        <Card.Content style={styles.totalImpactContent}>
          <AlertTriangle size={32} color="#B91C1C" style={{ marginBottom: 12 }} />
          <Text style={[styles.cardHeaderTitle, { color: "#991B1B" }]}>Impacto Total Acumulado</Text>
          <View style={styles.totalImpactGrid}>
            <View style={styles.totalImpactItem}>
              <Text style={styles.totalImpactValue}>
                R$ {damageSummary.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.totalImpactLabel}>Prejuízos Totais</Text>
            </View>
            <View style={styles.totalImpactItem}>
              <Text style={styles.totalImpactValue}>{damageSummary.totalAffectedPeople.toLocaleString('pt-BR')}</Text>
              <Text style={styles.totalImpactLabel}>Unidades Afetadas</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReportModal}
        onRequestClose={() => {
          setShowReportModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalCenteredView}>
          <ScrollView contentContainerStyle={styles.modalScrollViewContent}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowReportModal(false);
                  resetForm();
                }}
              >
                <X color="#6b7280" size={24} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Reportar Novo Prejuízo</Text>

              <Text style={styles.inputLabel}>Localização:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Bairro - Cidade"
                placeholderTextColor="#9ca3af"
                value={newReportLocation}
                onChangeText={setNewReportLocation}
              />

              <Text style={styles.inputLabel}>Tipo de Prejuízo:</Text>
              <View style={styles.typeSelectorContainer}>
                {damageCategoriesConfig.map((cat) => (
                  <TouchableOpacity
                    key={cat.type}
                    style={[
                      styles.typeOption,
                      { backgroundColor: cat.color },
                      newReportType === cat.type && styles.typeOptionSelected,
                    ]}
                    onPress={() => setNewReportType(cat.type as "Residencial" | "Comercial" | "Público" | "Industrial" | "Outro")}                  >
                    <cat.icon color={cat.textColor} size={18} />
                    <Text style={[styles.typeOptionText, { color: cat.textColor }]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Unidades Afetadas:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: 150 (residências, lojas, etc.)"
                placeholderTextColor="#9ca3af"
                value={newReportAffectedUnits}
                onChangeText={setNewReportAffectedUnits}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Custo Estimado (R$):</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: 25000.00"
                placeholderTextColor="#9ca3af"
                value={newReportEstimatedCost}
                onChangeText={setNewReportEstimatedCost}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Descrição Detalhada:</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                placeholder="Descreva os danos e o impacto observado."
                placeholderTextColor="#9ca3af"
                multiline
                value={newReportDescription}
                onChangeText={setNewReportDescription}
              />

              <Text style={styles.inputLabel}>Severidade:</Text>
              <View style={styles.severityPickerContainer}>
                {Object.keys(severityColors).map((sev) => {
                  const currentSeverity = sev as Severity;
                  const colors = severityColors[currentSeverity];
                  return (
                    <TouchableOpacity
                      key={currentSeverity}
                      style={[
                        styles.severityOption,
                        { borderColor: colors.border },
                        newReportSeverity === currentSeverity && { backgroundColor: colors.border + '1A' } 
                      ]}
                      onPress={() => setNewReportSeverity(currentSeverity)}
                    >
                      <Text style={[styles.severityOptionText, { color: colors.text }]}>
                        {currentSeverity}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Reportado por:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Seu nome ou organização"
                placeholderTextColor="#9ca3af"
                value={newReportReportedBy}
                onChangeText={setNewReportReportedBy}
              />

              <Text style={styles.inputLabel}>Data do Prejuízo:</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => Alert.alert("Funcionalidade", "Seletor de data em desenvolvimento. Por favor, digite a data manualmente.")}>
                  <Text style={styles.datePickerButtonText}>{newReportDate || 'Selecionar Data'}</Text>
                  <Calendar size={20} color="#374151" />
              </TouchableOpacity>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={newReportDate}
                onChangeText={setNewReportDate}
                keyboardType="numbers-and-punctuation" 
              />

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowReportModal(false);
                    resetForm();
                  }}
                  style={styles.modalActionButton}
                  labelStyle={styles.modalButtonLabel}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleReportSubmit}
                  style={[styles.modalActionButton, { backgroundColor: "#2563eb" }]}
                  labelStyle={styles.modalButtonLabel}
                >
                  Enviar
                </Button>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F6", 
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#F4F7F6",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2, 
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "700", 
    color: "#1F2937",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12, 
  },
  categoryBox: {
    width: "48%",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)', 
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  categoryLabel: {
    fontWeight: "600",
    fontSize: 15,
  },
  categoryCount: {
    fontWeight: "800", 
    fontSize: 28,
  },
  categorySubText: {
    fontSize: 12,
    opacity: 0.9,
  },

  reportActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#E0F2FE", 
    borderColor: "#3B82F6",
    borderWidth: 1,
    gap: 10,
  },
  reportActionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E40AF",
  },

  reportBox: {
    backgroundColor: "#FFFFFF", 
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB", 
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", 
    marginBottom: 8,
  },
  reportLocation: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1F2937",
  },
  reportSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  severityBadge: {
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16, 
    textTransform: "uppercase",
    fontWeight: "bold",
    minWidth: 70,
    textAlign: "center",
  },
  reportDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 20, 
  },
  reportDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  detailItem: {
    flex: 1,
  },
  reportLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  reportValue: {
    fontWeight: "700",
    fontSize: 15,
    color: "#1F2937",
  },
  estimatedCostValue: {
    color: "#DC2626", 
  },
  reportReportedBy: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: 'italic',
  },
  reportActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  reportActionButtonSmall: {
    flex: 1,
    borderRadius: 8,
  },
  reportButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  noReportsText: {
    textAlign: "center",
    color: "#6B7280",
    paddingVertical: 20,
    fontSize: 14,
  },

  totalImpactCard: {
    backgroundColor: "#FEE2E2", 
    borderColor: "#DC2626", 
    borderWidth: 1,
  },
  totalImpactContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  totalImpactGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
    gap: 20,
  },
  totalImpactItem: {
    alignItems: "center",
    flex: 1,
  },
  totalImpactValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#B91C1C", 
    marginBottom: 4,
  },
  totalImpactLabel: {
    fontSize: 13,
    color: "#991B1B", 
    textAlign: 'center',
  },

  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)", 
  },
  modalScrollViewContent: {
    flexGrow: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20, 
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    width: "92%", 
    position: 'relative',
    marginVertical: 20, 
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22, 
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1F2937",
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 10,
  },
  modalInput: {
    width: "100%",
    minHeight: 48, 
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10, 
    fontSize: 16,
    color: "#374151",
    backgroundColor: '#F9FAFB', 
  },
  modalTextarea: {
    height: 100, 
    textAlignVertical: "top", 
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', 
    marginBottom: 15,
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent', 
  },
  typeOptionSelected: {
    borderColor: '#3B82F6', 
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  severityPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8,
  },
  severityOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  severityOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: "100%",
    minHeight: 48,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    gap: 10,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
  },
  modalButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PrejuizosScreen;