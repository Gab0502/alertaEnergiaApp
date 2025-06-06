import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Card, Button, Badge } from "react-native-paper";
import {
  Play,
  Pause,
  CircleStop,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PowerOutage {
  id: string;
  location: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "active" | "completed";
}

const formatDuration = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(
    seconds
  )}`;
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

const OutageTrackerScreen = () => {
  const [activeOutage, setActiveOutage] = useState<PowerOutage | null>(null);
  const [pastOutages, setPastOutages] = useState<PowerOutage[]>([]);
  const [outageDuration, setOutageDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  const ACTIVE_OUTAGE_KEY = "activePowerOutage";
  const PAST_OUTAGES_KEY = "pastPowerOutages";

  const loadOutageData = async () => {
    try {
      const activeData = await AsyncStorage.getItem(ACTIVE_OUTAGE_KEY);
      if (activeData) {
        const outage: PowerOutage = JSON.parse(activeData);
        if (outage.status === "active") {
          setActiveOutage(outage);
          const duration = Date.now() - outage.startTime;
          setOutageDuration(duration);
          startTimer();
        }
      }

      const pastData = await AsyncStorage.getItem(PAST_OUTAGES_KEY);
      setPastOutages(pastData ? JSON.parse(pastData) : []);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados de interrupções");
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(true);
    lastUpdateRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setOutageDuration((prev) => prev + elapsed);
    }, 1000);
  };

  const startNewOutage = async () => {
    if (activeOutage) {
      Alert.alert(
        "Atenção",
        "Finalize a interrupção atual antes de iniciar outra"
      );
      return;
    }

    const newOutage: PowerOutage = {
      id: `outage-${Date.now()}`,
      location: "Minha Região",
      startTime: Date.now(),
      status: "active",
    };

    try {
      await AsyncStorage.setItem(ACTIVE_OUTAGE_KEY, JSON.stringify(newOutage));
      setActiveOutage(newOutage);
      setOutageDuration(0);
      startTimer();
      setIsRunning(true);
    } catch (error) {
      Alert.alert("Erro", "Falha ao registrar nova interrupção");
    }
  };

  const finishOutage = async () => {
    if (!activeOutage) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const completedOutage: PowerOutage = {
      ...activeOutage,
      endTime: Date.now(),
      duration: outageDuration,
      status: "completed",
    };

    try {
      const updatedHistory = [completedOutage, ...pastOutages];
      await AsyncStorage.setItem(
        PAST_OUTAGES_KEY,
        JSON.stringify(updatedHistory)
      );
      setPastOutages(updatedHistory);

      await AsyncStorage.removeItem(ACTIVE_OUTAGE_KEY);
      setActiveOutage(null);
      setOutageDuration(0);
    } catch (error) {
      Alert.alert("Erro", "Falha ao finalizar registro");
    }
  };
  const [isRunning, setIsRunning] = useState(false);
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false)
    }
  };

  useEffect(() => {
    loadOutageData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const totalEvents = pastOutages.length + (activeOutage ? 1 : 0);
  const totalDuration = pastOutages.reduce(
    (sum, outage) => sum + (outage.duration || 0),
    0
  );
  const avgDuration =
    pastOutages.length > 0 ? totalDuration / pastOutages.length : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {}
      <Card style={styles.controlPanel}>
        <Card.Content style={styles.timerPanel}>
          <Text style={styles.timerDisplay}>
            {formatDuration(outageDuration)}
          </Text>
          <Text style={styles.timerLabel}>Tempo Sem Energia</Text>

          <View style={styles.controlButtons}>
            {!activeOutage ? (
              <Button
                mode="contained"
                icon={() => <Play size={16} color="white" />}
                onPress={startNewOutage}
                style={styles.startButton}
                labelStyle={styles.buttonLabel}
              >
                Iniciar Registro
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button
                    mode="outlined"
                    icon={() => <Pause size={16} color="#6b7280" />}
                    onPress={pauseTimer}
                    style={styles.pauseButton}
                    labelStyle={styles.buttonLabel}
                  >
                    Pausar
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    icon={() => <Play size={16} color="white" />}
                    onPress={startTimer}
                    style={styles.resumeButton}
                    labelStyle={styles.buttonLabel}
                  >
                    Retomar
                  </Button>
                )}

                <Button
                  mode="contained"
                  icon={() => <CircleStop size={16} color="white" />}
                  onPress={finishOutage}
                  style={styles.stopButton}
                  labelStyle={styles.buttonLabel}
                >
                  Finalizar
                </Button>
              </>
            )}
          </View>
        </Card.Content>
      </Card>

      {activeOutage && (
        <Card style={styles.activeCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#dc2626" />
              <Text style={styles.sectionTitle}>Interrupção em Andamento</Text>
            </View>

            <View style={styles.outageDetails}>
              <Text style={styles.location}>{activeOutage.location}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Início:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(activeOutage.startTime)} às{" "}
                  {formatTime(activeOutage.startTime)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Duração:</Text>
                <Text style={styles.durationValue}>
                  {formatDuration(outageDuration)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {}
      <Card style={styles.historyCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <CheckCircle size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Histórico de Interrupções</Text>
          </View>

          {pastOutages.length > 0 ? (
            pastOutages.map((outage) => (
              <View key={outage.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.location}>{outage.location}</Text>
                  <Badge style={styles.completedBadge}>Concluído</Badge>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duração:</Text>
                  <Text style={styles.detailValue}>
                    {formatDuration(outage.duration || 0)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Período:</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(outage.startTime)} -{" "}
                    {outage.endTime ? formatTime(outage.endTime) : "N/D"}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma interrupção registrada</Text>
          )}
        </Card.Content>
      </Card>

      {}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Estatísticas</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalEvents}</Text>
              <Text style={styles.statLabel}>Total de Interrupções</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDuration(avgDuration)}
              </Text>
              <Text style={styles.statLabel}>Duração Média</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    color: "#64748b",
    fontSize: 16,
  },
  controlPanel: {
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    marginBottom: 20,
    elevation: 3,
  },
  timerPanel: {
    alignItems: "center",
    paddingVertical: 24,
  },
  timerDisplay: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1e40af",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  timerLabel: {
    fontSize: 18,
    color: "#3b82f6",
    marginBottom: 20,
    fontWeight: "500",
  },
  controlButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  startButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 8,
  },
  pauseButton: {
    flex: 1,
    borderColor: "#94a3b8",
    borderRadius: 8,
    paddingVertical: 8,
  },
  resumeButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    paddingVertical: 8,
  },
  stopButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontWeight: "600",
    fontSize: 15,
  },
  activeCard: {
    borderRadius: 12,
    backgroundColor: "#ffedd5",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fdba74",
    elevation: 2,
  },
  historyCard: {
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#86efac",
    elevation: 2,
  },
  statsCard: {
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  outageDetails: {
    paddingHorizontal: 8,
  },
  location: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  detailLabel: {
    width: 90,
    color: "#475569",
    fontWeight: "500",
    fontSize: 16,
  },
  detailValue: {
    flex: 1,
    color: "#334155",
    fontSize: 16,
  },
  durationValue: {
    flex: 1,
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 18,
  },
  historyItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  completedBadge: {
    backgroundColor: "#16a34a",
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    paddingVertical: 20,
    fontSize: 16,
    fontStyle: "italic",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  statLabel: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    fontWeight: "500",
  },
});

export default OutageTrackerScreen;
