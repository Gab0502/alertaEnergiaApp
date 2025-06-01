import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Alert,
} from "react-native";
import { Card, Badge, Button } from "react-native-paper";
import { Plus, MapPin, Search, Filter, AlertTriangle, CheckCircle } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Status = "Normal" | "Problema" | "Crítico";
type Location = {
  id: number;
  name: string;
  city: string;
  cep: string;
  status: Status;
  lastUpdate: string;
};

type ViaCepResponse = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

const initialLocations: Location[] = [
  {
    id: 1,
    name: "Centro",
    city: "São Paulo",
    cep: "01010-000",
    status: "Normal",
    lastUpdate: new Date().toLocaleTimeString(),
  },
  {
    id: 2,
    name: "Vila Olímpia",
    city: "São Paulo",
    cep: "04551-060",
    status: "Normal",
    lastUpdate: new Date().toLocaleTimeString(),
  },
  {
    id: 3,
    name: "Copacabana",
    city: "Rio de Janeiro",
    cep: "22070-900",
    status: "Normal",
    lastUpdate: new Date().toLocaleTimeString(),
  },
];

export default function MonitoramentoScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [searchError, setSearchError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viaCepData, setViaCepData] = useState<ViaCepResponse | null>(null);
  const [newLocationModal, setNewLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id' | 'lastUpdate'>>({
    name: "",
    city: "",
    cep: "",
    status: "Normal",
  });

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const saved = await AsyncStorage.getItem("savedLocations");
        if (saved) {
          const parsedLocations = JSON.parse(saved);
          setAllLocations(parsedLocations);
          setFilteredLocations(parsedLocations);
          startStatusRandomizer(parsedLocations);
        } else {
          setAllLocations(initialLocations);
          setFilteredLocations(initialLocations);
          await AsyncStorage.setItem("savedLocations", JSON.stringify(initialLocations));
          startStatusRandomizer(initialLocations);
        }
      } catch (error) {
        console.error("Erro ao carregar localizações:", error);
        setAllLocations(initialLocations);
        setFilteredLocations(initialLocations);
        startStatusRandomizer(initialLocations);
      }
    };
    loadLocations();
  }, []);

  const startStatusRandomizer = (locations: Location[]) => {
    const interval = setInterval(() => {
      setAllLocations(prevLocations => {
        const updatedLocations = prevLocations.map(location => {
          if (Math.random() < 0.1) {
            const statuses: Status[] = ["Normal", "Problema", "Crítico"];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            return {
              ...location,
              status: newStatus,
              lastUpdate: new Date().toLocaleTimeString()
            };
          }
          return location;
        });
        
        AsyncStorage.setItem("savedLocations", JSON.stringify(updatedLocations));
        return updatedLocations;
      });
    }, 30000);

    return () => clearInterval(interval);
  };

  const handleSearch = async () => {
    const term = searchTerm.trim().replace(/\D/g, "");
    setSearchError(false);
    setViaCepData(null);
    setLoading(true);

    if (term.length !== 8) {
      setSearchError(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${term}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setSearchError(true);
        setFilteredLocations([]);
        setViaCepData(null);
      } else {
        setViaCepData(data);
        const filtered = allLocations.filter(
          (loc) => 
            loc.cep.replace(/\D/g, "").startsWith(term.substring(0, 5)) ||
            loc.city.toLowerCase() === data.localidade.toLowerCase()
        );
        setFilteredLocations(filtered.length > 0 ? filtered : allLocations);
      }
    } catch (error) {
      console.error("Erro na busca do CEP:", error);
      setSearchError(true);
      setFilteredLocations([]);
      setViaCepData(null);
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.city || !newLocation.cep) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const newId = allLocations.length > 0 
        ? Math.max(...allLocations.map(loc => loc.id)) + 1 
        : 1;
      
      const locationToAdd: Location = {
        id: newId,
        ...newLocation,
        lastUpdate: new Date().toLocaleTimeString(),
      };

      const updatedLocations = [...allLocations, locationToAdd];
      
      setAllLocations(updatedLocations);
      setFilteredLocations(updatedLocations);
      await AsyncStorage.setItem("savedLocations", JSON.stringify(updatedLocations));
      
      setNewLocation({
        name: "",
        city: "",
        cep: "",
        status: "Normal",
      });
      setNewLocationModal(false);
      
      Alert.alert("Sucesso", "Área de monitoramento adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar área:", error);
      Alert.alert("Erro", "Não foi possível adicionar a área");
    }
  };

  const openNewLocationModal = () => {
    if (viaCepData) {
      setNewLocation({
        name: viaCepData.bairro || "",
        city: viaCepData.localidade,
        cep: viaCepData.cep,
        status: "Normal",
      });
    }
    setNewLocationModal(true);
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Normal":
        return { backgroundColor: "#96f6b7", color: "#16A34A" };
      case "Problema":
        return { backgroundColor: "#FEF9C3", color: "#CA8A04" };
      case "Crítico":
        return { backgroundColor: "#FEE2E2", color: "#DC2626" };
      default:
        return { backgroundColor: "#E5E7EB", color: "#6B7280" };
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "Normal":
        return <CheckCircle color="#16A34A" width={20} height={20} />;
      case "Problema":
      case "Crítico":
        return <AlertTriangle color={status === "Crítico" ? "#DC2626" : "#CA8A04"} width={20} height={20} />;
      default:
        return <MapPin color="#6B7280" width={20} height={20} />;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Search color="#9CA3AF" width={16} height={16} style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar área por CEP"
                value={searchTerm}
                onChangeText={(text) => {
                  const formatted = text
                    .replace(/\D/g, "")
                    .replace(/(\d{5})(\d)/, "$1-$2")
                    .substring(0, 9);
                  setSearchTerm(formatted);
                }}
                onSubmitEditing={handleSearch}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
            <Button
              mode="outlined"
              onPress={handleSearch}
              compact
              contentStyle={{ padding: 4 }}
              style={[
                styles.filterButton,
                searchError && { borderColor: "red", borderWidth: 2 },
              ]}
              disabled={loading}
            >
              <Filter width={16} height={16} color="#374151" />
            </Button>
          </View>

          {loading && (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginTop: 8 }} />
          )}

          {searchError && !loading && (
            <Text style={{ color: "red", marginTop: 8 }}>
              CEP inválido ou não encontrado.
            </Text>
          )}

          {viaCepData && !searchError && (
            <View style={styles.viaCepResult}>
              <Text style={styles.viaCepText}>Bairro: {viaCepData.bairro || "N/A"}</Text>
              <Text style={styles.viaCepText}>Cidade: {viaCepData.localidade}</Text>
              <Text style={styles.viaCepText}>Estado: {viaCepData.uf}</Text>
              <Text style={styles.viaCepText}>CEP: {viaCepData.cep}</Text>
            </View>
          )}

          <Button
            mode="contained"
            icon={() => <Plus width={16} height={16} color="#fff" />}
            onPress={openNewLocationModal}
            style={{ marginTop: 12 }}
            contentStyle={{ flexDirection: "row-reverse", justifyContent: "center" }}
          >
            Adicionar Nova Área
          </Button>
        </Card.Content>
      </Card>

      {newLocationModal && (
        <Card style={[styles.card, { marginTop: 16 }]}>
          <Card.Content>
            <Text style={styles.modalTitle}>Nova Área de Monitoramento</Text>
            
            <TextInput
              placeholder="Nome da área"
              value={newLocation.name}
              onChangeText={(text) => setNewLocation({...newLocation, name: text})}
              style={styles.modalInput}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              placeholder="Cidade"
              value={newLocation.city}
              onChangeText={(text) => setNewLocation({...newLocation, city: text})}
              style={styles.modalInput}
              placeholderTextColor="#9CA3AF"
            />
            
            <TextInput
              placeholder="CEP"
              value={newLocation.cep}
              onChangeText={(text) => {
                const formatted = text
                  .replace(/\D/g, "")
                  .replace(/(\d{5})(\d)/, "$1-$2")
                  .substring(0, 9);
                setNewLocation({...newLocation, cep: formatted});
              }}
              style={styles.modalInput}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={9}
            />
            
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined" 
                onPress={() => setNewLocationModal(false)}
                style={styles.modalButton}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handleAddLocation}
                style={styles.modalButton}
              >
                Monitorar Área
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <View style={{ marginTop: 16 }}>
        {filteredLocations.length > 0 ? (
          filteredLocations.map((location) => {
            const statusStyle = getStatusColor(location.status);
            return (
              <Card key={location.id} style={[styles.card, { marginBottom: 12 }]}>
                <Card.Content>
                  <View style={styles.locationHeader}>
                    <View style={styles.locationTitle}>
                      {getStatusIcon(location.status)}
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.locationName}>{location.name}</Text>
                        <Text style={styles.locationCity}>{location.city}</Text>
                      </View>
                    </View>
                    <Badge
                      style={[
                        styles.badge,
                        { 
                          backgroundColor: statusStyle.backgroundColor,
                          color: statusStyle.color,
                        }
                      ]}
                    >
                      {location.status}
                 </Badge>
                  </View>

                  <View style={styles.locationInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>CEP:</Text>
                      <Text style={styles.infoValue}>{location.cep}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Última atualização:</Text>
                      <Text style={styles.infoValue}>{location.lastUpdate}</Text>
                    </View>
                  </View>

                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Text style={{ textAlign: "center", color: "#6B7280", marginTop: 20 }}>
            Nenhuma área monitorada encontrada.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    elevation: 2,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  input: {
    height: 40,
    backgroundColor: "#F9FAFB",
    paddingLeft: 36,
    borderRadius: 6,
    fontSize: 14,
    color: "#111827",
  },
  filterButton: {
    marginLeft: 8,
  },
  viaCepResult: {
    marginTop: 12,
    backgroundColor: "#EFF6FF",
    padding: 8,
    borderRadius: 6,
  },
  viaCepText: {
    fontSize: 14,
    color: "#1E40AF",
    marginBottom: 2,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#111827",
  },
  locationCity: {
    fontSize: 14,
    color: "#6B7280",
  },
  badge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    textTransform: "uppercase",
  },
  locationInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    color: "#4B5563",
    fontSize: 14,
  },
  infoValue: {
    fontWeight: "600",
    fontSize: 14,
    color: "#111827",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
    textAlign: "center",
  },
  modalInput: {
    height: 40,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});