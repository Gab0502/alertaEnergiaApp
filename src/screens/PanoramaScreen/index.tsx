import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Card, Badge, Button } from "react-native-paper";
import { AlertTriangle, Zap, Clock, Users, X } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';

type EventStatus = "Ativo" | "Resolvido";
type EventSeverity = "Crítico" | "Alto" | "Médio" | "Baixo";

interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface RecentEvent {
  id: number;
  location: string;
  duration: string;
  status: EventStatus;
  severity: EventSeverity;
  timestamp: number;
}

const initialRecentEvents: RecentEvent[] = [
  {
    id: 1,
    location: "Centro - São Paulo",
    duration: "2h 30min",
    status: "Ativo",
    severity: "Alto",
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 2,
    location: "Vila Olímpia - SP",
    duration: "1h 15min",
    status: "Resolvido",
    severity: "Médio",
    timestamp: Date.now() - 3600000 * 5,
  },
];

const getSeverityBadgeStyle = (severity: EventSeverity) => {
  switch (severity) {
    case "Crítico":
      return { borderColor: "#dc2626", color: "#dc2626" };
    case "Alto":
      return { borderColor: "#f97316", color: "#f97316" };
    case "Médio":
      return { borderColor: "#eab308", color: "#eab308" };
    case "Baixo":
      return { borderColor: "#22c55e", color: "#22c55e" };
    default:
      return { borderColor: "#6b7280", color: "#6b7280" };
  }
};

const getStatusBadgeStyle = (status: EventStatus) => {
  switch (status) {
    case "Ativo":
      return { borderColor: "#dc2626", color: "#dc2626" };
    case "Resolvido":
      return { borderColor: "#22c55e", color: "#22c55e" };
    default:
      return { borderColor: "#6b7280", color: "#6b7280" };
  }
};

export default function PanoramaScreen() {
  const [currentStats, setCurrentStats] = useState<StatItem[]>([]);
  const [currentRecentEvents, setCurrentRecentEvents] = useState<RecentEvent[]>(
    []
  );
  const [loadingData, setLoadingData] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDuration, setNewEventDuration] = useState("");
  const [newEventSeverity, setNewEventSeverity] =
    useState<EventSeverity>("Médio");
    const navigation = useNavigation();

  const updateStats = useCallback((events: RecentEvent[]) => {
    const activeEventsCount = events.filter((e) => e.status === "Ativo").length;
    const affectedCities = new Set(
      events.map((e) => e.location.split(" - ")[1])
    ).size;

    const activeDurations = events
      .filter((e) => e.status === "Ativo" && e.duration.includes("h"))
      .map((e) => {
        const parts = e.duration.split("h");
        const hours = parseFloat(parts[0]);
        const minutes = parts[1]
          ? parseFloat(parts[1].replace("min", "")) / 60
          : 0;
        return hours + minutes;
      })
      .filter((d) => !isNaN(d));

    const averageDuration =
      activeDurations.length > 0
        ? (
            activeDurations.reduce((sum, d) => sum + d, 0) /
            activeDurations.length
          ).toFixed(1)
        : "0.0";

    const estimatedAffectedPeople = (
      activeEventsCount * 400 +
      Math.floor(Math.random() * 200)
    ).toFixed(0);

    setCurrentStats([
      {
        title: "Eventos Ativos",
        value: activeEventsCount.toString(),
        change: ``,
        icon: AlertTriangle,
        color: "#dc2626",
        bgColor: "#fee2e2",
      },
      {
        title: "Regiões Afetadas",
        value: affectedCities.toString(),
        change: `Em ${affectedCities} cidades`,
        icon: Zap,
        color: "#ea580c",
        bgColor: "#ffedd5",
      },
      {
        title: "Tempo de Resposta",
        value: "5min",
        change: "Padrão mantido",
        icon: Clock,
        color: "#0e7490",
        bgColor: "#cffafe",
      },
      {
        title: "Pessoas Afetadas",
        value: `${(parseFloat(estimatedAffectedPeople) / 100).toFixed(1)}k`,
        change: "Estimativa total",
        icon: Users,
        color: "#7c3aed",
        bgColor: "#ede9fe",
      },
    ]);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const savedEvents = await AsyncStorage.getItem("powerOutageEvents");
        let eventsToUse: RecentEvent[] = savedEvents
          ? JSON.parse(savedEvents)
          : initialRecentEvents;

        if (!savedEvents) {
          await AsyncStorage.setItem(
            "powerOutageEvents",
            JSON.stringify(initialRecentEvents)
          );
        }

        setCurrentRecentEvents(
          eventsToUse.sort((a, b) => b.timestamp - a.timestamp)
        );
        updateStats(eventsToUse);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setCurrentRecentEvents(initialRecentEvents);
        updateStats(initialRecentEvents);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [updateStats]);

  useEffect(() => {
    if (currentRecentEvents.length === 0) return;

    const activeEvents = currentRecentEvents.filter(
      (event) => event.status === "Ativo"
    );
    if (activeEvents.length === 0) return;

    const timers = activeEvents.map((event) => {

      const randomTime = Math.floor(Math.random() * 25 * 60) + 5 * 60;
      console.log(randomTime);
      return setTimeout(async () => {
        try {
          const updatedEvents = currentRecentEvents.map((e) =>
            e.id === event.id ? { ...e, status: "Resolvido" as EventStatus } : e
          );

          const sortedEvents = updatedEvents.sort(
            (a, b) => b.timestamp - a.timestamp
          );
          setCurrentRecentEvents(sortedEvents);
          updateStats(sortedEvents);
          await AsyncStorage.setItem(
            "powerOutageEvents",
            JSON.stringify(sortedEvents)
          );
        } catch (error) {
          console.error("Erro ao atualizar evento:", error);
        }
      }, randomTime);
    });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [currentRecentEvents, updateStats]);

  const handleReportEvent = async () => {
    if (!newEventLocation.trim() || !newEventDuration.trim()) {
      Alert.alert("Erro", "Preencha todos os campos para reportar o evento.");
      return;
    }

    const newEvent: RecentEvent = {
      id: Date.now(),
      location: newEventLocation.trim(),
      duration: newEventDuration.trim(),
      status: "Ativo",
      severity: newEventSeverity,
      timestamp: Date.now(),
    };

    try {
      const updatedEvents = [newEvent, ...currentRecentEvents];
      setCurrentRecentEvents(updatedEvents);
      await AsyncStorage.setItem(
        "powerOutageEvents",
        JSON.stringify(updatedEvents)
      );
      updateStats(updatedEvents);

      setNewEventLocation("");
      setNewEventDuration("");
      setNewEventSeverity("Médio");
      setShowReportModal(false);

      Alert.alert("Sucesso", "Evento reportado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      Alert.alert("Erro", "Não foi possível reportar o evento.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loadingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Carregando resumo...</Text>
        </View>
      ) : (
        <>
          {}
          <View style={styles.statsGrid}>
            {currentStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} style={styles.statCard}>
                  <Card.Content style={styles.statCardContent}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: stat.bgColor },
                      ]}
                    >
                      <Icon color={stat.color} width={24} height={24} />
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                    <Text style={styles.statChange}>{stat.change}</Text>
                  </Card.Content>
                </Card>
              );
            })}
          </View>

          {}
          <Card style={styles.fullWidthCard}>
            <Card.Title
              title="Eventos Recentes"
              titleStyle={styles.cardTitle}
              style={styles.cardHeader}
            />
            <Card.Content>
              {currentRecentEvents.length > 0 ? (
                currentRecentEvents.map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventLocation}>{event.location}</Text>
                      <Text style={styles.eventDuration}>
                        Duração: {event.duration}
                      </Text>
                      <Text style={styles.eventTimestamp}>
                        Reportado:{" "}
                        {new Date(event.timestamp).toLocaleString("pt-BR")}
                      </Text>
                    </View>
                    <View style={styles.badgesColumn}>
                      <Badge
                        style={[
                          styles.badge,
                          getStatusBadgeStyle(event.status),
                        ]}
                      >
                        {event.status}
                      </Badge>
                      <Badge
                        style={[
                          styles.badge,
                          getSeverityBadgeStyle(event.severity),
                        ]}
                      >
                        {event.severity}
                      </Badge>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noEventsText}>
                  Nenhum evento recente registrado.
                </Text>
              )}
            </Card.Content>
          </Card>

          {}
          <Card style={styles.fullWidthCard}>
            <Card.Title
              title="Ações Rápidas"
              titleStyle={styles.cardTitle}
              style={styles.cardHeader}
            />
            <Card.Content>
              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#e0f2fe", borderColor: "#3b82f6" },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setShowReportModal(true)}
                >
                  <Zap color="#2563eb" width={28} height={28} />
                  <Text style={[styles.actionText, { color: "#1e40af" }]}>
                    Reportar Evento
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#dcfce7", borderColor: "#22c55e" },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("Localizacao" as never)}
                >
                  <AlertTriangle color="#16a34a" width={28} height={28} />
                  <Text style={[styles.actionText, { color: "#166534" }]}>
                    Ver Alertas
                  </Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </>
      )}

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReportModal}
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReportModal(false)}
            >
              <X color="#6b7280" size={24} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Reportar Nova Falta de Energia
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Localização (ex: Bairro - Cidade)"
              placeholderTextColor="#9ca3af"
              value={newEventLocation}
              onChangeText={setNewEventLocation}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Duração estimada (ex: 2h 30min)"
              placeholderTextColor="#9ca3af"
              value={newEventDuration}
              onChangeText={setNewEventDuration}
            />
            <View style={styles.severityPickerContainer}>
              <Text style={styles.severityLabel}>Severidade:</Text>
              {["Baixo", "Médio", "Alto", "Crítico"].map((severityOption) => (
                <TouchableOpacity
                  key={severityOption}
                  style={[
                    styles.severityOption,
                    newEventSeverity === severityOption &&
                      styles.severityOptionSelected,
                    getSeverityBadgeStyle(severityOption as EventSeverity),
                  ]}
                  onPress={() =>
                    setNewEventSeverity(severityOption as EventSeverity)
                  }
                >
                  <Text
                    style={[
                      styles.severityOptionText,
                      newEventSeverity === severityOption &&
                        styles.severityOptionTextSelected,
                      {
                        color: getSeverityBadgeStyle(
                          severityOption as EventSeverity
                        ).color,
                      },
                    ]}
                  >
                    {severityOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowReportModal(false)}
                style={styles.modalActionButton}
                labelStyle={styles.modalButtonLabel}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleReportEvent}
                style={[
                  styles.modalActionButton,
                  { backgroundColor: "#2563eb" },
                ]}
                labelStyle={styles.modalButtonLabel}
              >
                Reportar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f4f7f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 2,
  },
  statCard: {
    flexBasis: "48%",
    elevation: 2,
    borderRadius: 12,
  },
  statCardContent: {
    padding: 16,
  },
  fullWidthCard: {
    width: "100%",
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  iconContainer: {
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  statValue: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 12,
    color: "#111827",
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 2,
  },
  statChange: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  eventDetails: {
    flex: 1,
    marginRight: 10,
  },
  eventLocation: {
    fontWeight: "600",
    fontSize: 15,
    color: "#111827",
  },
  eventDuration: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 4,
  },
  eventTimestamp: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  badgesColumn: {
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 6,
  },
  badge: {
    fontSize: 10,
    paddingVertical: 1,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    textTransform: "uppercase",
    fontWeight: "bold",
    minWidth: 70,
    textAlign: "center",
    backgroundColor: "#fffff",
  },
  noEventsText: {
    textAlign: "center",
    color: "#6b7280",
    paddingVertical: 20,
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    marginTop: 10,
    fontWeight: "700",
    fontSize: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1f2937",
  },
  modalInput: {
    width: "100%",
    height: 50,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#374151",
  },
  severityPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginRight: 10,
  },
  severityOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#f9fafb",
  },
  severityOptionSelected: {
    backgroundColor: "#eff6ff",
  },
  severityOptionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  severityOptionTextSelected: {},
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
    gap: 10,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
  },
  modalButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});