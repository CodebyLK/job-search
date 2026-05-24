import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TailoredResume } from '@/features/ai/TailorResumeButton';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', borderBottom: '1px solid #000', marginTop: 10, marginBottom: 5 },
    text: { fontSize: 10, marginBottom: 5 },
    role: { fontWeight: 'bold', fontSize: 11 },
    listRow: { flexDirection: 'row', justifyContent: 'space-between' }
});

export const ResumePDF = ({ data }: { data: TailoredResume }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <Text style={styles.header}>{data?.fullName}</Text>
            <Text style={{ ...styles.text, textAlign: 'center' }}>{data?.contactInfo}</Text>

            {/* Summary */}
            <Text style={styles.sectionTitle}>PROFESSIONAL SUMMARY</Text>
            <Text style={styles.text}>{data?.summary}</Text>

            {/* Skills */}
            <Text style={styles.sectionTitle}>TECHNICAL SKILLS</Text>
            <Text style={styles.text}>{data?.skills?.join(" • ")}</Text>

            {/* Experience */}
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            {data?.experience?.map((exp, i) => (
                <View key={i} style={{ marginBottom: 10 }}>
                    <View style={styles.listRow}>
                        <Text style={styles.role}>{exp.role} | {exp.company}</Text>
                        <Text style={{ fontSize: 10 }}>{exp.dates}</Text>
                    </View>
                    {exp.bullets.map((b, j) => <Text key={j} style={styles.text}>• {b}</Text>)}
                </View>
            ))}

            {/* Education */}
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {data?.education?.map((edu, i) => (
                <View key={i} style={{ marginBottom: 5 }}>
                    <View style={styles.listRow}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{edu.school}, {edu.degree}</Text>
                        <Text style={{ fontSize: 10 }}>{edu.dates}</Text>
                    </View>
                </View>
            ))}
        </Page>
    </Document>
);