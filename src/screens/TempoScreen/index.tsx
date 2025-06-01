import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Feather equivale aos ícones do Lucide

const TempoScreen = () => {
  const activeOutages = [
    {
      id: 1,
      location: 'Centro - São Paulo',
      startTime: '14:30',
      duration: '2h 30min',
      status: 'Em andamento',
      estimatedEnd: '17:30',
    },
    {
      id: 2,
      location: 'Copacabana - RJ',
      startTime: '11:15',
      duration: '3h 45min',
      status: 'Em andamento',
      estimatedEnd: '15:30',
    },
  ];

  const recentOutages = [
    {
      id: 3,
      location: 'Vila Olímpia - SP',
      startTime: '09:00',
      endTime: '10:15',
      totalDuration: '1h 15min',
      status: 'Concluído',
    },
    {
      id: 4,
      location: 'Botafogo - RJ',
      startTime: '08:30',
      endTime: '12:45',
      totalDuration: '4h 15min',
      status: 'Concluído',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Cronômetro Rápido */}
      <View style={[styles.card, styles.blueGradient]}>
        <Icon name="play" size={32} color="#2563EB" style={styles.iconCenter} />
        <Text style={styles.title}>Cronômetro Rápido</Text>
        <Text style={styles.subtitle}>Para registrar uma nova interrupção</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.greenButton]}>
            <Icon name="play" size={16} color="#fff" />
            <Text style={styles.buttonText}> Iniciar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonOutline}>
            <Icon name="pause" size={16} color="#000" />
            <Text style={styles.buttonText}> Pausar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonOutline}>
            <Icon name="square" size={16} color="#000" />
            <Text style={styles.buttonText}> Parar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interrupções Ativas */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Icon name="clock" size={20} color="#DC2626" />
          <Text style={styles.sectionTitle}>Interrupções Ativas</Text>
        </View>
        {activeOutages.map((item) => (
          <View key={item.id} style={styles.outageCardActive}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.timeText}>Iniciado às {item.startTime}</Text>
              </View>
              <Text style={styles.badgeRed}>{item.status}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Duração: </Text>
              <Text style={styles.valueRed}>{item.duration}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Prev. Término: </Text>
              <Text style={styles.value}>{item.estimatedEnd}</Text>
            </View>
            <TouchableOpacity style={styles.buttonOutlineFull}>
              <Text>Finalizar Registro</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Concluídas Recentemente */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Icon name="clock" size={20} color="#16A34A" />
          <Text style={styles.sectionTitle}>Concluídas Recentemente</Text>
        </View>
        {recentOutages.map((item) => (
          <View key={item.id} style={styles.outageCardRecent}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.timeText}>{item.startTime} - {item.endTime}</Text>
              </View>
              <Text style={styles.badgeGreen}>{item.status}</Text>
            </View>
            <Text style={styles.label}>Duração Total:</Text>
            <Text style={styles.valueGreen}>{item.totalDuration}</Text>
            <TouchableOpacity style={styles.buttonOutlineFull}>
              <Text>Ver Relatório</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Estatísticas */}
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.statBoxBlue}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Total de Eventos</Text>
          </View>
          <View style={styles.statBoxOrange}>
            <Text style={styles.statNumber}>3.2h</Text>
            <Text style={styles.statLabel}>Duração Média</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  blueGradient: { backgroundColor: '#EFF6FF', alignItems: 'center' },
  iconCenter: { marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1D4ED8' },
  subtitle: { fontSize: 14, color: '#3B82F6', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16A34A', padding: 8, borderRadius: 6 },
  greenButton: { backgroundColor: '#16A34A' },
  buttonText: { color: '#fff', fontSize: 14 },
  buttonOutline: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 },
  buttonOutlineFull: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginTop: 10, alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  outageCardActive: { backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 10 },
  outageCardRecent: { backgroundColor: '#DCFCE7', borderRadius: 8, padding: 12, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  location: { fontSize: 16, fontWeight: '600' },
  timeText: { fontSize: 12, color: '#555' },
  badgeRed: { backgroundColor: '#DC2626', color: '#fff', fontSize: 12, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeGreen: { backgroundColor: '#BBF7D0', color: '#166534', fontSize: 12, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  row: { flexDirection: 'row', gap: 4 },
  label: { fontSize: 13, color: '#374151' },
  value: { fontSize: 13, fontWeight: 'bold' },
  valueRed: { fontSize: 13, fontWeight: 'bold', color: '#DC2626' },
  valueGreen: { fontSize: 13, fontWeight: 'bold', color: '#16A34A' },
  statsRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  statBoxBlue: { flex: 1, backgroundColor: '#DBEAFE', borderRadius: 8, padding: 12, alignItems: 'center' },
  statBoxOrange: { flex: 1, backgroundColor: '#FFEDD5', borderRadius: 8, padding: 12, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 13, color: '#555' },
});

export default TempoScreen;
