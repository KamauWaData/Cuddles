import React from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TermsOfService() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FF3366" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#1F2937", flex: 1, marginLeft: 16 }}>Terms of Service</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#1F2937" }}>Terms of Service</Text>

        <Section title="1. Acceptance of Terms">
          <Text style={styles.bodyText}>
            By accessing and using the Cuddles application ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>
        </Section>

        <Section title="2. Use License">
          <Text style={styles.bodyText}>
            Permission is granted to temporarily download one copy of the materials (information or software) on Cuddles for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <BulletPoint text="Modify or copy the materials" />
          <BulletPoint text="Use the materials for any commercial purpose or for any public display" />
          <BulletPoint text="Attempt to decompile or reverse engineer any software contained on the Service" />
          <BulletPoint text="Remove any copyright or other proprietary notations from the materials" />
          <BulletPoint text="Transfer the materials to another person or 'mirror' the materials on any other server" />
          <BulletPoint text="Harass, abuse, or threaten other users" />
        </Section>

        <Section title="3. User Conduct">
          <Text style={styles.bodyText}>
            You agree not to post, transmit, or distribute content that:
          </Text>
          <BulletPoint text="Is unlawful, threatening, abusive, defamatory, obscene, or otherwise objectionable" />
          <BulletPoint text="Is sexually explicit or intended for sexual gratification" />
          <BulletPoint text="Violates any applicable laws or regulations" />
          <BulletPoint text="Infringes on any intellectual property rights" />
          <BulletPoint text="Impersonates any person or entity" />
          <BulletPoint text="Contains malware or harmful code" />
        </Section>

        <Section title="4. Disclaimer of Warranties">
          <Text style={styles.bodyText}>
            The materials on Cuddles are provided on an 'as-is' basis. Cuddles makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Text>
        </Section>

        <Section title="5. Limitations of Liability">
          <Text style={styles.bodyText}>
            In no event shall Cuddles or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Cuddles, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
          </Text>
        </Section>

        <Section title="6. Accuracy of Materials">
          <Text style={styles.bodyText}>
            The materials appearing on Cuddles could include technical, typographical, or photographic errors. Cuddles does not warrant that any of the materials on the Service are accurate, complete, or current. Cuddles may make changes to the materials contained on the Service at any time without notice.
          </Text>
        </Section>

        <Section title="7. Links">
          <Text style={styles.bodyText}>
            Cuddles has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Cuddles of the site. Use of any such linked website is at the user's own risk.
          </Text>
        </Section>

        <Section title="8. Modifications">
          <Text style={styles.bodyText}>
            Cuddles may revise these terms of service for the Service at any time without notice. By using the Service, you are agreeing to be bound by the then current version of these terms of service.
          </Text>
        </Section>

        <Section title="9. Safety & Verification">
          <Text style={styles.bodyText}>
            Users acknowledge that dating involves inherent personal safety risks. Cuddles recommends that all users:
          </Text>
          <BulletPoint text="Meet in public places" />
          <BulletPoint text="Inform a trusted friend or family member of your location and plans" />
          <BulletPoint text="Report suspicious behavior or content immediately" />
          <BulletPoint text="Use the block and report features to protect yourself" />
          <BulletPoint text="Trust your instincts and prioritize your safety" />
          <Text style={styles.bodyText}>
            Cuddles is not responsible for the conduct of any user or for any physical harm that may occur during meetups arranged through the Service.
          </Text>
        </Section>

        <Section title="10. Termination">
          <Text style={styles.bodyText}>
            Cuddles may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms of Service.
          </Text>
        </Section>

        <Section title="11. Governing Law">
          <Text style={styles.bodyText}>
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Cuddles operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </Text>
        </Section>

        <Section title="12. Contact Information">
          <Text style={styles.bodyText}>
            If you have any questions about these Terms of Service, please contact us through the Support section in the app or email us at support@cuddles-app.com.
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
