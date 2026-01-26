import React from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function DataPrivacyGDPR() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FF3366" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2937", flex: 1, marginLeft: 16 }}>Data Privacy & GDPR</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#1F2937" }}>Data Privacy & GDPR Compliance</Text>

        <Section title="1. Our GDPR Commitment">
          <Text style={styles.bodyText}>
            Cuddles is committed to protecting your privacy and ensuring you have a positive experience on our platform. We comply with the General Data Protection Regulation (GDPR) and other applicable privacy laws worldwide.
          </Text>
          <Text style={styles.bodyText}>
            This page explains your rights under GDPR and how we handle your personal data.
          </Text>
        </Section>

        <Section title="2. Legal Basis for Processing">
          <Text style={styles.bodyText}>
            We process your personal data based on the following legal grounds:
          </Text>
          <BulletPoint text="Consent: You have given explicit consent for a specific purpose" />
          <BulletPoint text="Contract: Processing is necessary to fulfill our contract with you" />
          <BulletPoint text="Legal Obligation: We are required to process data by law" />
          <BulletPoint text="Legitimate Interests: Processing is necessary for our legitimate business purposes" />
          <BulletPoint text="Vital Interests: Processing is necessary to protect vital interests" />
        </Section>

        <Section title="3. Your GDPR Rights">
          <Text style={styles.bodyText}>
            Under GDPR, you have the following rights:
          </Text>

          <Subsection title="Right to Access (Data Subject Access Request)">
            <Text style={styles.bodyText}>
              You have the right to request a copy of the personal data we hold about you. We will provide this information within 30 days of your request.
            </Text>
          </Subsection>

          <Subsection title="Right to Rectification">
            <Text style={styles.bodyText}>
              If you believe any of your personal data is inaccurate or incomplete, you have the right to request correction. You can update most information directly in the app settings.
            </Text>
          </Subsection>

          <Subsection title="Right to Erasure (Right to be Forgotten)">
            <Text style={styles.bodyText}>
              You have the right to request deletion of your personal data, except where we have a legal obligation to retain it. You can delete your account in Settings, which will initiate our data deletion process.
            </Text>
          </Subsection>

          <Subsection title="Right to Restrict Processing">
            <Text style={styles.bodyText}>
              You have the right to request that we limit how we use your data while we investigate your concerns or process your other requests.
            </Text>
          </Subsection>

          <Subsection title="Right to Data Portability">
            <Text style={styles.bodyText}>
              You have the right to request a copy of your data in a structured, commonly used, and machine-readable format. You can request this through our support channel.
            </Text>
          </Subsection>

          <Subsection title="Right to Object">
            <Text style={styles.bodyText}>
              You have the right to object to processing of your data for direct marketing purposes or other legitimate interests.
            </Text>
          </Subsection>

          <Subsection title="Rights Related to Automated Decision Making">
            <Text style={styles.bodyText}>
              You have rights related to automated decision making and profiling. You can request human review of automated decisions.
            </Text>
          </Subsection>
        </Section>

        <Section title="4. Data Retention">
          <Text style={styles.bodyText}>
            We retain your personal data for as long as necessary to provide our services. When you delete your account:
          </Text>
          <BulletPoint text="Your profile and messages are deleted within 30 days" />
          <BulletPoint text="Analytics data may be retained in anonymized form" />
          <BulletPoint text="We retain data as required by law or for legitimate business purposes" />
          <BulletPoint text="Your profile picture is deleted from our servers" />
        </Section>

        <Section title="5. International Data Transfers">
          <Text style={styles.bodyText}>
            If you are located in the EU/EEA, your personal data may be transferred to countries outside the EU/EEA. We ensure adequate safeguards are in place, including:
          </Text>
          <BulletPoint text="Standard contractual clauses" />
          <BulletPoint text="Binding corporate rules" />
          <BulletPoint text="Your explicit consent for the transfer" />
        </Section>

        <Section title="6. Data Protection Officer">
          <Text style={styles.bodyText}>
            We maintain privacy practices consistent with appointing a Data Protection Officer (DPO) equivalent. For privacy inquiries, contact: privacy@cuddles-app.com
          </Text>
        </Section>

        <Section title="7. How to Exercise Your Rights">
          <Text style={styles.bodyText}>
            To exercise any of your GDPR rights, please:
          </Text>
          <BulletPoint text="Email us at: privacy@cuddles-app.com" />
          <BulletPoint text="Use the 'Request Data' feature in app Settings" />
          <BulletPoint text="Call our support team during business hours" />
          <Text style={styles.bodyText}>
            We will respond to your request within 30 days. If we need more time, we will notify you.
          </Text>
        </Section>

        <Section title="8. Your Right to Lodge a Complaint">
          <Text style={styles.bodyText}>
            If you believe we have violated your GDPR rights, you have the right to lodge a complaint with your local data protection authority. You can do this without first contacting us, although we encourage you to give us an opportunity to address your concerns.
          </Text>
          <Text style={styles.bodyText}>
            Contact your local data protection authority through their website for instructions on filing a complaint.
          </Text>
        </Section>

        <Section title="9. Cookies and Tracking">
          <Text style={styles.bodyText}>
            Our app may use cookies and tracking technologies. We only use these technologies with your consent or for essential functionality. You can control cookie preferences in your device settings.
          </Text>
        </Section>

        <Section title="10. Changes to This Policy">
          <Text style={styles.bodyText}>
            We may update this policy regularly to reflect legal changes or improvements to our practices. We will notify you of significant changes.
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
    <View style={{ marginBottom: 16 }}>
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
