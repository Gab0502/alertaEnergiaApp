import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Card, Button, Badge } from 'react-native-paper'; // Use react-native-paper components
import { Play, Pause, Square, Clock, AlertTriangle, CheckCircle, Info, Calendar } from 'lucide-react-native'; // Lucide icons as requested
import AsyncStorage from '@react-native-async-storage/async-storage'; // For data persistence

// --- Interfaces para Dados ---
interface Outage {
  id: string; // Unique ID for each outage
  location: string;
  startTime: number; // Unix timestamp
  endTime?: number; // Unix timestamp, optional for active outages
  duration?: number; // Duration in milliseconds
  status: 'active' | 'completed';
  estimatedEnd?: number; // Unix timestamp
}

// --- Funções Auxiliares de Tempo ---
const formatDuration = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}min ${seconds}s`;
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const TempoScreen = () => {
  const [activeOutage, setActiveOutage] = useState<Outage | null>(null);
  const [recentOutages, setRecentOutages] = useState<Outage[]>([]);
  const [currentTimerDuration, setCurrentTimerDuration] = useState(0); // Duration for the quick timer
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);

  // --- AsyncStorage Keys ---
  const ACTIVE_OUTAGE_KEY = 'activeOutage';
  const RECENT_OUTAGES_KEY = 'recentOutages';

  // --- Função para carregar dados do AsyncStorage ---
  const loadOutageData = useCallback(async () => {
    setLoading(true);
    try {
      const storedActiveOutage = await AsyncStorage.getItem(ACTIVE_OUTAGE_KEY);
      if (storedActiveOutage) {
        const parsedOutage: Outage = JSON.parse(storedActiveOutage);
        if (parsedOutage.status === 'active') {
          setActiveOutage(parsedOutage);
          // Recalculate duration if app was closed while timer was active
          setCurrentTimerDuration(Date.now() - parsedOutage.startTime);
          // Restart timer if active
          const id = setInterval(() => {
            setCurrentTimerDuration(prev => prev + 1000);
          }, 1000);
          setTimerIntervalId(id);
        } else {
          setActiveOutage(null); // Clear if somehow a completed outage is in active slot
        }
      } else {
        setActiveOutage(null);
      }

      const storedRecentOutages = await AsyncStorage.getItem(RECENT_OUTAGES_KEY);
      if (storedRecentOutages) {
        setRecentOutages(JSON.parse(storedRecentOutages));
      } else {
        setRecentOutages([]); // Initialize empty if nothing found
      }
    } catch (error) {
      console.error("Failed to load outage data:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados de interrupções.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Efeito para carregar dados na montagem do componente ---
  useEffect(() => {
    loadOutageData();

    // Limpar o intervalo ao desmontar o componente
    return () => {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [loadOutageData, timerIntervalId]);


  // --- Funções do Cronômetro Rápido ---
  const handleStartTimer = async () => {
    if (activeOutage) {
      Alert.alert("Interrupção Ativa", "Já existe uma interrupção sendo monitorada. Finalize a atual para iniciar uma nova.");
      return;
    }

    const newOutage: Outage = {
      id: `active-${Date.now()}`,
      location: 'Local Não Definido', // User can edit this later
      startTime: Date.now(),
      status: 'active',
    };
    setActiveOutage(newOutage);
    setCurrentTimerDuration(0);

    const id = setInterval(() => {
      setCurrentTimerDuration(prev => prev + 1000);
    }, 1000);
    setTimerIntervalId(id);

    try {
      await AsyncStorage.setItem(ACTIVE_OUTAGE_KEY, JSON.stringify(newOutage));
      Alert.alert("Cronômetro Iniciado", "Interrupção de energia registrada. Comece a monitorar!");
    } catch (error) {
      console.error("Failed to save active outage:", error);
      Alert.alert("Erro", "Não foi possível salvar a interrupção ativa.");
    }
  };

  const handlePauseTimer = () => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
      Alert.alert("Cronômetro Pausado", "A contagem de tempo foi pausada.");
    }
  };

  const handleStopTimer = async () => {
    if (!activeOutage) {
      Alert.alert("Nenhuma Interrupção Ativa", "Não há interrupção ativa para finalizar.");
      return;
    }
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }

    const completedOutage: Outage = {
      ...activeOutage,
      endTime: Date.now(),
      duration: currentTimerDuration,
      status: 'completed',
    };

    try {
      // Add to recent outages
      const updatedRecentOutages = [completedOutage, ...recentOutages];
      await AsyncStorage.setItem(RECENT_OUTAGES_KEY, JSON.stringify(updatedRecentOutages));
      setRecentOutages(updatedRecentOutages);

      // Clear active outage
      await AsyncStorage.removeItem(ACTIVE_OUTAGE_KEY);
      setActiveOutage(null);
      setCurrentTimerDuration(0);

      Alert.alert("Interrupção Finalizada", `Interrupção de ${formatDuration(completedOutage.duration || 0)} registrada e movida para concluídas.`);
    } catch (error) {
      console.error("Failed to stop and save outage:", error);
      Alert.alert("Erro", "Não foi possível finalizar a interrupção.");
    }
  };

  // --- Função para "Finalizar Registro" de uma interrupção ativa ---
  const handleFinishActiveOutage = async (outageId: string) => {
    if (!activeOutage || activeOutage.id !== outageId) {
      Alert.alert("Erro", "Interrupção ativa não encontrada.");
      return;
    }

    Alert.alert(
      "Finalizar Interrupção",
      "Tem certeza que deseja finalizar este registro de interrupção?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Finalizar",
          onPress: handleStopTimer, // Calls the same stop logic for the active outage
          style: "destructive",
        },
      ]
    );
  };

  // --- Funções para calcular estatísticas ---
  const totalEvents = recentOutages.length + (activeOutage ? 1 : 0); // Active + completed
  const totalDurationMs = recentOutages.reduce((sum, outage) => sum + (outage.duration || 0), 0);
  const averageDurationMs = recentOutages.length > 0 ? totalDurationMs / recentOutages.length : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Carregando dados de interrupções...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cronômetro Rápido */}
      <Card style={[styles.card, styles.blueBackground]}>
        <Card.Content style={styles.quickTimerContent}>
          <Play size={32} color="#2563EB" style={styles.iconCenter} />
          <Text style={styles.quickTimerTitle}>Cronômetro Rápido</Text>
          <Text style={styles.quickTimerSubtitle}>Para registrar uma nova interrupção</Text>
          <Text style={styles.currentTimerText}>{formatDuration(currentTimerDuration)}</Text>
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              icon={() => <Play size={16} color="#fff" />}
              onPress={handleStartTimer}
              style={styles.actionButton}
              labelStyle={styles.actionButtonLabel}
              disabled={!!activeOutage}
            >
              Iniciar
            </Button>
            <Button
              mode="outlined"
              icon={() => <Pause size={16} color="#000" />}
              onPress={handlePauseTimer}
              style={styles.actionButtonOutline}
              labelStyle={styles.actionButtonOutlineLabel}
              disabled={!activeOutage || !timerIntervalId}
            >
              Pausar
            </Button>
            <Button
              mode="outlined"
              icon={() => <Square size={16} color="#000" />}
              onPress={handleStopTimer}
              style={styles.actionButtonOutline}
              labelStyle={styles.actionButtonOutlineLabel}
              disabled={!activeOutage}
            >
              Parar
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Interrupções Ativas */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>Interrupções Ativas</Text>
          </View>
          {activeOutage ? (
            <View style={styles.outageCardActive}>
              <View style={styles.outageHeader}>
                <View>
                  <Text style={styles.location}>{activeOutage.location}</Text>
                  <Text style={styles.timeText}>Iniciado em {formatDate(activeOutage.startTime)} às {formatTime(activeOutage.startTime)}</Text>
                </View>
                <Badge style={styles.badgeRed}>Em andamento</Badge>
              </View>
              <View style={styles.outageDetailsRow}>
                <Text style={styles.label}>Duração Atual: </Text>
                <Text style={styles.valueRed}>{formatDuration(currentTimerDuration)}</Text>
              </View>
              {activeOutage.estimatedEnd && (
                <View style={styles.outageDetailsRow}>
                  <Text style={styles.label}>Prev. Término: </Text>
                  <Text style={styles.value}>{formatTime(activeOutage.estimatedEnd)}</Text>
                </View>
              )}
              <Button
                mode="outlined"
                onPress={() => handleFinishActiveOutage(activeOutage.id)}
                style={styles.buttonOutlineFull}
                labelStyle={styles.buttonOutlineFullLabel}
              >
                Finalizar Registro
              </Button>
            </View>
          ) : (
            <Text style={styles.noOutagesText}>Nenhuma interrupção ativa no momento.</Text>
          )}
        </Card.Content>
      </Card>

      {/* Concluídas Recentemente */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <CheckCircle size={20} color="#16A34A" />
            <Text style={styles.sectionTitle}>Concluídas Recentemente</Text>
          </View>
          {recentOutages.length > 0 ? (
            recentOutages.map((item) => (
              <View key={item.id} style={styles.outageCardRecent}>
                <View style={styles.outageHeader}>
                  <View>
                    <Text style={styles.location}>{item.location}</Text>
                    <Text style={styles.timeText}>
                      {formatDate(item.startTime)}: {formatTime(item.startTime)} - {item.endTime ? formatTime(item.endTime) : 'N/A'}
                    </Text>
                  </View>
                  <Badge style={styles.badgeGreen}>Concluído</Badge>
                </View>
                <View style={styles.outageDetailsRow}>
                  <Text style={styles.label}>Duração Total: </Text>
                  <Text style={styles.valueGreen}>{formatDuration(item.duration || 0)}</Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => Alert.alert("Detalhes", `Ver relatório da interrupção em ${item.location}`)}
                  style={styles.buttonOutlineFull}
                  labelStyle={styles.buttonOutlineFullLabel}
                >
                  Ver Relatório
                </Button>
              </View>
            ))
          ) : (
            <Text style={styles.noOutagesText}>Nenhum registro de interrupção concluída.</Text>
          )}
        </Card.Content>
      </Card>

      {/* Estatísticas */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Info size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>Estatísticas Gerais</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalEvents}</Text>
              <Text style={styles.statLabel}>Total de Eventos</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#FFEDD5' }]}>
              <Text style={styles.statNumber}>{formatDuration(averageDurationMs)}</Text>
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
    backgroundColor: '#F4F7F6', // Soft background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7F6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2, // Softer shadow
  },
  // --- Cronômetro Rápido ---
  blueBackground: {
    backgroundColor: '#EFF6FF', // Light blue
    alignItems: 'center',
  },
  quickTimerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconCenter: {
    marginBottom: 8,
  },
  quickTimerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  quickTimerSubtitle: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 16, // More space
  },
  currentTimerText: {
    fontSize: 32, // Larger time display
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10, // Consistent gap
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#16A34A', // Green for start
  },
  actionButtonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonOutline: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#D1D5DB', // Light gray border
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  actionButtonOutlineLabel: {
    color: '#374151', // Darker text
    fontSize: 14,
    fontWeight: '600',
  },
  // --- Seções Gerais ---
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18, // Larger section title
    fontWeight: '700', // Bolder
    color: '#1F2937',
  },
  noOutagesText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 20,
    fontSize: 14,
  },
  // --- Cards de Interrupção ---
  outageCardActive: {
    backgroundColor: '#FEE2E2', // Light red
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5', // Soft red border
  },
  outageCardRecent: {
    backgroundColor: '#DCFCE7', // Light green
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#86EFAC', // Soft green border
  },
  outageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  badgeRed: {
    backgroundColor: '#DC2626',
    color: '#fff',
    fontSize: 11, // Slightly smaller badge text
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16, // Pill shape
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  badgeGreen: {
    backgroundColor: '#16A34A',
    color: '#fff',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  outageDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#374151',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  valueRed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  valueGreen: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  buttonOutlineFull: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonOutlineFullLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  // --- Estatísticas ---
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#DBEAFE', // Light blue for general stats
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statNumber: {
    fontSize: 28, // Larger number
    fontWeight: '800', // Extra bold
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },
});

export default TempoScreen;