import React from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FF3366" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2937", flex: 1, marginLeft: 16 }}>Privacy Policy</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#1F2937" }}>Privacy Policy</Text>

        <Section title="1. Introduction">
          <Text style={styles.bodyText}>
            Cuddles ("we," "us," "our," or "Company") operates the Cuddles mobile application ("Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </Text>
          <Text style={styles.bodyText}>
            We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
          </Text>
        </Section>

        <Section title="2. Information Collection and Use">
          <Text style={styles.bodyText}>
            We collect several different types of information for various purposes to provide and improve our Service.
          </Text>

          <Subsection title="Types of Data Collected:">
            <BulletPoint text="Account Information: Email, password (hashed), phone number" />
            <BulletPoint text="Profile Information: Name, age, gender, photos, bio, interests, location" />
            <BulletPoint text="Usage Data: How you interact with the Service, features accessed, time spent, searches performed" />
            <BulletPoint text="Device Information: Device type, operating system, unique device identifiers" />
            <BulletPoint text="Location Data: Approximate location based on GPS or IP address (with permission)" />
            <BulletPoint text="Communication Data: Messages, chat history with other users" />
          </Subsection>
        </Section>

        <Section title="3. Use of Data">
          <Text style={styles.bodyText}>
            Cuddles uses the collected data for various purposes:
          </Text>
          <BulletPoint text="To provide and maintain our Service" />
          <BulletPoint text="To notify you about changes to our Service" />
          <BulletPoint text="To allow you to participate in interactive features of our Service when you choose to do so" />
          <BulletPoint text="To provide customer support" />
          <BulletPoint text="To gather analysis or valuable information so we can improve our Service" />
          <BulletPoint text="To monitor the usage of our Service" />
          <BulletPoint text="To detect, prevent and address technical issues and fraud" />
        </Section>

        <Section title="4. Security of Data">
          <Text style={styles.bodyText}>
            The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </Text>
          <Text style={styles.bodyText}>
            We implement industry-standard encryption and security protocols to protect your information.
          </Text>
        </Section>

        <Section title="5. Data Retention">
          <Text style={styles.bodyText}>
            We will retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations.
          </Text>
          <Text style={styles.bodyText}>
            When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to keep certain information for legal or regulatory reasons.
          </Text>
        </Section>

        <Section title="6. Your Rights">
          <Text style={styles.bodyText}>
            Depending on your location, you may have the following rights:
          </Text>
          <BulletPoint text="The right to access your personal data" />
          <BulletPoint text="The right to correct inaccurate data" />
          <BulletPoint text="The right to request deletion of your data" />
          <BulletPoint text="The right to restrict processing of your data" />
          <BulletPoint text="The right to data portability" />
          <BulletPoint text="The right to withdraw consent" />
          <BulletPoint text="The right to lodge a complaint with a supervisory authority" />
          <Text style={styles.bodyText}>
            To exercise any of these rights, please contact us at support@cuddles-app.com.
          </Text>
        </Section>

        <Section title="7. Third Parties">
          <Text style={styles.bodyText}>
            We do not sell, trade, or rent your Personal Information to third parties. We may share your information with:
          </Text>
          <BulletPoint text="Service providers who assist us in operating our website and conducting our business" />
          <BulletPoint text="Law enforcement when required by law" />
          <BulletPoint text="In case of merger or acquisition (with notice to you)" />
        </Section>

        <Section title="8. Children's Privacy">
          <Text style={styles.bodyText}>
            Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally identifiable information from Children under 18. If you are a parent or guardian and you are aware that your Child has provided us with Personal Data, please contact us immediately.
          </Text>
        </Section>

        <Section title="9. Changes to This Privacy Policy">
          <Text style={styles.bodyText}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </Text>
        </Section>

        <Section title="10. Contact Us">
          <Text style={styles.bodyText}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.bodyText}>
            Email: support@cuddles-app.com{"\n"}
            In-app Support: Use the Help section in Settings
          </Text>
        </Section>

        <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 32, marginBottom: 32, textAlign: "center" }}>
          Last updated: January 2024
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1F2937", marginBottom: 12 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 8, paddingLeft: 8 }}>
      <Text style={{ marginRight: 8, color: "#6B7280" }}>•</Text>
      <Text style={{ flex: 1, fontSize: 14, color: "#555", lineHeight: 20 }}>
        {text}
      </Text>
    </View>
  );
}

const styles = {
  bodyText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
};
