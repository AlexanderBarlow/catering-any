import React from "react";
import { View, Text } from "react-native";
import { CFA } from "../../constants/theme";

export default function Items() {
  return (
    <View style={{ flex: 1, backgroundColor: CFA.cream, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "900", color: CFA.ink }}>
        Items
      </Text>
      <Text style={{ color: CFA.muted, marginTop: 8 }}>
        Coming next: best sellers, margin leaders, dead items, category mix.
      </Text>
    </View>
  );
}
