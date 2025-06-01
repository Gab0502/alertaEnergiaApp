import React from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Badge, Button } from "react-native-paper";
import { AlertTriangle, Zap, Clock, Users } from "lucide-react-native";

const stats = [
  {
    title: "Eventos Ativos",
    value: "5",
    change: "+2 nas últimas 24h",
    icon: AlertTriangle,
    color: "#dc2626", // red-600
    bgColor: "#fee2e2", // red-50
  },
  {
    title: "Regiões Afetadas",
    value: "12",
    change: "Em 3 cidades",
    icon: Zap,
    color: "#ea580c", // orange-600
    bgColor: "#ffedd5", // orange-50
  },
  {
    title: "Tempo Médio",
    value: "4.5h",
    change: "Duração média",
    icon: Clock,
    color: "#2563eb", // blue-600
    bgColor: "#dbeafe", // blue-50
  },
  {
    title: "Pessoas Afetadas",
    value: "2.1k",
    change: "Estimativa total",
    icon: Users,
    color: "#7c3aed", // purple-600
    bgColor: "#ede9fe", // purple-50
  },
];

const recentEvents = [
  {
    id: 1,
    location: "Centro - São Paulo",
    duration: "2h 30min",
    status: "Ativo",
    severity: "Alto",
  },
  {
    id: 2,
    location: "Vila Olímpia - SP",
    duration: "1h 15min",
    status: "Resolvido",
    severity: "Médio",
  },
  {
    id: 3,
    location: "Copacabana - RJ",
    duration: "3h 45min",
    status: "Ativo",
    severity: "Crítico",
  },
];

export default function PanoramaScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} style={styles.card}>
              <Card.Content>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
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

      {/* Recent Events */}
      <Card style={styles.fullCard}>
        <Card.Title title="Eventos Recentes" />
        <Card.Content>
          {recentEvents.map((event) => (
            <View key={event.id} style={styles.eventRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventLocation}>{event.location}</Text>
                <Text style={styles.eventDuration}>Duração: {event.duration}</Text>
              </View>
              <View style={styles.badgesColumn}>
                <Badge
                  style={[
                    styles.badge,
                    event.status === "Ativo" ? styles.badgeDestructive : styles.badgeSecondary,
                  ]}
                >
                  {event.status}
                </Badge>
                <Badge
                  style={[
                    styles.badge,
                    event.severity === "Crítico"
                      ? styles.badgeCritical
                      : event.severity === "Alto"
                      ? styles.badgeHigh
                      : styles.badgeMedium,
                  ]}
                >
                  {event.severity}
                </Badge>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.fullCard}>
        <Card.Title title="Ações Rápidas" />
        <Card.Content>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#dbeafe", borderColor: "#3b82f6" }]}>
              <Zap color="#2563eb" width={28} height={28} />
              <Text style={[styles.actionText, { color: "#1e40af" }]}>Reportar Evento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#dcfce7", borderColor: "#22c55e" }]}>
              <AlertTriangle color="#16a34a" width={28} height={28} />
              <Text style={[styles.actionText, { color: "#166534" }]}>Ver Alertas</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: "48%",
    marginBottom: 16,
  },
    fullCard: {
    width: "100%",
    marginBottom: 16,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    color: "#111827", // gray-900
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563", // gray-600
  },
  statChange: {
    fontSize: 12,
    color: "#6b7280", // gray-500
    marginTop: 4,
  },
  eventRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f9fafb", // gray-50
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  eventLocation: {
    fontWeight: "600",
    fontSize: 14,
    color: "#111827",
  },
  eventDuration: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 4,
  },
  badgesColumn: {
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 6,
  },
  badge: {
    fontSize: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderWidth: 1,
  },
  badgeDestructive: {
    backgroundColor: "transparent",
    borderColor: "#dc2626",
    color: "#dc2626",
  },
  badgeSecondary: {
    backgroundColor: "transparent",
    borderColor: "#6b7280",
    color: "#6b7280",
  },
  badgeCritical: {
    backgroundColor: "transparent",
    borderColor: "#dc2626",
    color: "#dc2626",
  },
  badgeHigh: {
    backgroundColor: "transparent",
    borderColor: "#f97316",
    color: "#f97316",
  },
  badgeMedium: {
    backgroundColor: "transparent",
    borderColor: "#facc15",
    color: "#facc15",
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  actionText: {
    marginTop: 8,
    fontWeight: "600",
    fontSize: 14,
  },
});
