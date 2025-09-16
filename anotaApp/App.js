import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "anotacoes_do_app";
const BG_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/f/fc/Agata_Station%2C_T%C5%8Dbu_Isesaki_Line_%E6%9D%B1%E6%AD%A6%E4%BC%8A%E5%8B%A2%E5%B4%8E%E7%B7%9A_%E7%9C%8C%E9%A7%85_-_panoramio.jpg";

export default function App() {
  const [texto, setTexto] = useState("");
  const [notas, setNotas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    carregarNotas();
  }, []);

  const salvarNotas = async (novasNotas) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novasNotas));
    } catch (e) {
      console.error("Erro ao salvar:", e);
    }
  };

  const carregarNotas = async () => {
    try {
      const dados = await AsyncStorage.getItem(STORAGE_KEY);
      if (dados !== null) {
        setNotas(JSON.parse(dados));
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    }
  };

  const adicionarOuEditarNota = () => {
    if (texto.trim() === "") return;

    if (editandoId) {
      // Editar nota existente
      const novasNotas = notas.map((n) =>
        n.id === editandoId ? { ...n, texto, data: new Date().toLocaleString() } : n
      );
      setNotas(novasNotas);
      salvarNotas(novasNotas);
      setEditandoId(null);
    } else {
      // Adicionar nova nota
      const novaNota = {
        id: Date.now().toString(),
        texto,
        data: new Date().toLocaleString(),
      };
      const novasNotas = [novaNota, ...notas];
      setNotas(novasNotas);
      salvarNotas(novasNotas);
    }

    setTexto("");
  };

  const excluirNota = (id) => {
    const novasNotas = notas.filter((n) => n.id !== id);
    setNotas(novasNotas);
    salvarNotas(novasNotas);
    if (editandoId === id) {
      setEditandoId(null);
      setTexto("");
    }
  };

  const iniciarEdicao = (nota) => {
    setTexto(nota.texto);
    setEditandoId(nota.id);
  };

  const cancelarEdicao = () => {
    setTexto("");
    setEditandoId(null);
  };

  return (
    <ImageBackground
      source={{ uri: BG_IMAGE }}
      resizeMode="cover"
      style={styles.background}
      imageStyle={{ opacity: 100 }}
    >
      <View style={styles.container}>
        <Text style={styles.titulo}>Anotações</Text>
        <Text style={styles.contador}>Total de notas: {notas.length}</Text>

        <TextInput
          style={styles.input}
          placeholder="Escreva algo..."
          placeholderTextColor="#aaa"
          value={texto}
          onChangeText={setTexto}
          multiline
        />

        <View style={styles.botoes}>
          <TouchableOpacity
            style={[styles.btn, { shadowColor: "#FCEE0C" }]}
            onPress={adicionarOuEditarNota}
          >
            <Text style={styles.btnText}>
              {editandoId ? "Salvar Alteração" : "Salvar"}
            </Text>
          </TouchableOpacity>

          {editandoId ? (
            <TouchableOpacity
              style={[styles.btn, { shadowColor: "#FF0000" }]}
              onPress={cancelarEdicao}
            >
              <Text style={styles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.btn, { shadowColor: "#FF00FF" }]}
                onPress={() => setNotas([])}
              >
                <Text style={styles.btnText}>Limpar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { shadowColor: "#22D3EE" }]}
                onPress={carregarNotas}
              >
                <Text style={styles.btnText}>Recarregar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <FlatList
          data={notas}
          keyExtractor={(item) => item.id}
          style={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemData}>{item.data}</Text>
                <Text style={styles.itemTexto}>{item.texto}</Text>
              </View>
              <View style={styles.itemButtons}>
                <TouchableOpacity
                  style={[styles.btn, { paddingHorizontal: 10, marginBottom: 6 }]}
                  onPress={() => iniciarEdicao(item)}
                >
                  <Text style={styles.btnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { paddingHorizontal: 10 }]}
                  onPress={() => excluirNota(item.id)}
                >
                  <Text style={styles.btnText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhuma nota ainda...</Text>
          }
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "rgba(10, 10, 10, 0.50)",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
    color: "#FFFF",
    textShadowColor: "#rgba(10, 10, 10, 0.50)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  contador: {
    fontSize: 14,
    color: "#FFFF",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(26,26,26,0.7)",
    borderColor: "#FFFF",
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    minHeight: 70,
    marginBottom: 15,
    fontSize: 16,
    color: "#fff",
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  btn: {
    backgroundColor: "rgba(255,255,255,0.08)", // glass
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    marginHorizontal: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lista: {
    flex: 1,
  },
  card: {
    backgroundColor: "rgba(15,15,15,0.50)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    borderWidth: 2,
    borderColor: "#FFFF",
  },
  itemData: {
    fontSize: 12,
    color: "#FFFF",
    marginBottom: 4,
  },
  itemTexto: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  itemButtons: {
    flexDirection: "column",
    marginLeft: 12,
    justifyContent: "space-between",
  },
  vazio: {
    textAlign: "center",
    marginTop: 30,
    color: "#9CA3AF",
    fontSize: 16,
  },
});
