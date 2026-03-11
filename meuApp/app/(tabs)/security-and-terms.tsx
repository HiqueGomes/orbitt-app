import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ORANGE = '#FF7A2A';

export default function SecurityAndTermsScreen() {
  const router = useRouter();

  function handleBack() {
    router.replace('/(tabs)/profile');
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircleInner} />
          </View>
          <Text style={styles.brand}>Orbitt</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.iconTitleRow}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="verified-user" size={32} color={ORANGE} />
          </View>
          <Text style={styles.pageTitle}>Segurança e Termos</Text>
          <Text style={styles.pageSubtitle}>
            Conheça como protegemos seus dados e as regras de uso do aplicativo.
          </Text>
        </View>

        {/* Segurança de dados */}
        <Text style={styles.sectionTitle}>Segurança de dados</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Proteção das suas informações</Text>
          <Text style={styles.paragraph}>
            • Seus dados pessoais (nome, e-mail, data de nascimento, fotos e descrição) são armazenados apenas no seu dispositivo, de forma local e criptografada quando possível.
          </Text>
          <Text style={styles.paragraph}>
            • Não vendemos, alugamos nem compartilhamos seus dados com terceiros para marketing.
          </Text>
          <Text style={styles.paragraph}>
            • O acesso ao aplicativo é protegido por login (e-mail ou CPF e senha). Mantenha sua senha em sigilo e não a compartilhe.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fotos e mídia</Text>
          <Text style={styles.paragraph}>
            • As fotos que você envia para o perfil ficam armazenadas localmente no dispositivo.
          </Text>
          <Text style={styles.paragraph}>
            • Recomendamos não publicar imagens que exponham documentos, endereços ou dados sensíveis.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comunicação e mensagens</Text>
          <Text style={styles.paragraph}>
            • As conversas e matches são vinculados à sua conta no dispositivo. Ao desinstalar o app ou sair da conta, esses dados podem ser perdidos conforme a implementação atual.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seus direitos</Text>
          <Text style={styles.paragraph}>
            • Você pode a qualquer momento editar ou excluir informações do seu perfil pela tela de edição e encerrar a sessão pela opção "Sair e voltar ao login".
          </Text>
        </View>

        {/* Termos de uso */}
        <Text style={styles.sectionTitle}>Termos de uso</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aceitação</Text>
          <Text style={styles.paragraph}>
            Ao utilizar o Orbitt, você concorda com estes termos. O uso continuado do aplicativo após alterações constitui aceitação das novas condições.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uso permitido</Text>
          <Text style={styles.paragraph}>
            • O aplicativo destina-se a maior de 18 anos para fins de conexão social e descoberta de eventos e pessoas.
          </Text>
          <Text style={styles.paragraph}>
            • É proibido usar o Orbitt para atividades ilegais, assédio, discriminação, falsidade ideológica ou divulgação de conteúdo ofensivo ou inadequado.
          </Text>
          <Text style={styles.paragraph}>
            • Você é responsável pelo conteúdo que publica (fotos, texto) e pelas interações que mantém com outros usuários.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conta e conduta</Text>
          <Text style={styles.paragraph}>
            • Manter informações verdadeiras no cadastro e não criar contas falsas ou em nome de terceiros.
          </Text>
          <Text style={styles.paragraph}>
            • Respeitar a privacidade e a dignidade dos outros usuários. Denuncie comportamentos que violem os termos ou a lei.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Alterações e contato</Text>
          <Text style={styles.paragraph}>
            • Podemos atualizar estes termos e as políticas de segurança. Alterações relevantes serão comunicadas no aplicativo.
          </Text>
          <Text style={styles.paragraph}>
            • Em caso de dúvidas sobre segurança ou termos de uso, entre em contato pelo suporte indicado no aplicativo.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Última atualização: termos e segurança Orbitt</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircleOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircleInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  brand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerRight: {
    width: 32,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  iconTitleRow: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconWrap: {
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
