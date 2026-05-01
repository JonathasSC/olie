import { StyleSheet, Text, View } from "react-native";
import FinanceItem from "../components/finance-item";
import { ListItem } from "../features/finance/types";

interface Props {
    items: ListItem[];
}

export default function FinanceHistorySection({ items }: Props) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Extrato</Text>
            {items.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>Nada para mostrar</Text>
                </View>
            ) : (
                <View style={styles.list}>
                    {items.map((item, i) => (
                        <FinanceItem
                            key={`${item.type}-${item.id ?? i}`}
                            type={item.type}
                            category={item.category}
                            title={item.payment_type}
                            amount={item.amount}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        paddingBottom: 16,
    },
    list: {
        gap: 16,
    },
    empty: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: '#8a8a8a',
    },
});
