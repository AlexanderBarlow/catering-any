import React from "react";
import { View, Text } from "react-native";
import { CFA } from "../../constants/theme";

export default function Operations() {
  return (
    <View style={{ flex: 1, backgroundColor: CFA.cream, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "900", color: CFA.ink }}>
        Operations
      </Text>
      <Text style={{ color: CFA.muted, marginTop: 8 }}>
        Coming next: ticket time (avg/p90), on-time rate, late orders, status
        funnel.
      </Text>
    </View>
  );
}
