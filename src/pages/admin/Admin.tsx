import { useNavigate, useParams } from "react-router-dom";
import { AdminGate } from "@/components/AdminGate";
import { Button } from "@/components/ui/button";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { AdminAlunos } from "@/components/admin/AdminAlunos";
import { AdminConversas } from "@/components/admin/AdminConversas";
import { AdminWhatsApp } from "@/components/admin/AdminWhatsApp";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { BRAND, DIET_TAGS, EQUIPMENT_OPTIONS, FOOD_GOALS, LEVEL_LABELS, STORE_CATEGORIES, WORKOUT_GOALS } from "@/lib/brand";
import { ArrowLeft } from "lucide-react";

const MODULES = [
  { slug: "", label: "Dashboard" },
  { slug: "alunos", label: "Alunos" },
  { slug: "conversas", label: "Conversas" },
  { slug: "agentes", label: "Agentes" },
  { slug: "treinos", label: "Treinos" },
  { slug: "alimentacao", label: "Receitas" },
  { slug: "biblioteca", label: "Biblioteca" },
  { slug: "jornadas", label: "Jornadas" },
  { slug: "dias-jornada", label: "Dias da jornada" },
  { slug: "loja", label: "Loja" },
  { slug: "planos", label: "Planos" },
  { slug: "assinaturas", label: "Assinaturas" },
  { slug: "acessos", label: "Acessos" },
  { slug: "whatsapp", label: "Integrações" },
  { slug: "configuracoes", label: "Configurações" },
  { slug: "logs", label: "Logs" },
];

const LEVELS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value, label: label as string }));

const LOCATIONS = [
  { value: "casa", label: "Casa" },
  { value: "academia", label: "Academia" },
  { value: "ambos", label: "Ambos" },
];

const AdminContent = () => {
  const { module } = useParams();
  const navigate = useNavigate();
  const current = module ?? "";

  const render = () => {
    switch (current) {
      case "":
        return <AdminDashboard />;
      case "alunos":
        return <AdminAlunos />;
      case "conversas":
        return <AdminConversas />;
      case "whatsapp":
        return <AdminWhatsApp />;
      case "agentes":
        return (
          <ResourceManager
            table="agents"
            title="Atendente digital"
            description="Configure o comportamento do atendimento automático."
            orderBy={{ column: "created_at" }}
            defaults={{ active: true, model: "google/gemini-2.5-flash" }}
            listFields={["name", "tone"]}
            fields={[
              { key: "name", label: "Nome" },
              { key: "greeting", label: "Saudação", type: "textarea" },
              { key: "tone", label: "Tom de voz" },
              { key: "prompt", label: "Instruções principais", type: "textarea" },
              { key: "rules", label: "Regras", type: "textarea" },
              { key: "goals", label: "Objetivos", type: "textarea" },
              { key: "business_hours", label: "Horário de atendimento" },
              { key: "transfer_message", label: "Mensagem de transferência", type: "textarea" },
              { key: "away_message", label: "Mensagem de ausência", type: "textarea" },
              { key: "model", label: "Modelo" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        );
      case "treinos":
        return (
          <ResourceManager
            table="workouts"
            title="Treinos"
            orderBy={{ column: "seq" }}
            defaults={{ active: true }}
            listFields={["title", "location", "level"]}
            fields={[
              { key: "title", label: "Nome" },
              { key: "description", label: "Descrição", type: "textarea" },
              { key: "goal", label: "Objetivo", type: "select", options: WORKOUT_GOALS },
              { key: "location", label: "Local", type: "select", options: LOCATIONS },
              { key: "level", label: "Nível", type: "select", options: LEVELS },
              { key: "duration_min", label: "Duração (min)", type: "number" },
              { key: "equipment", label: "Equipamentos", type: "tags", help: `Separe por vírgula. Ex: ${EQUIPMENT_OPTIONS.slice(0, 3).map((e) => e.value).join(", ")}` },
              { key: "youtube_url", label: "Vídeo (URL)" },
              { key: "instructions", label: "Instruções", type: "textarea" },
              { key: "seq", label: "Ordem", type: "number" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        );
      case "alimentacao":
        return (
          <ResourceManager
            table="recipes"
            title="Receitas e alimentação"
            orderBy={{ column: "title" }}
            defaults={{ active: true }}
            listFields={["title", "category", "calories"]}
            fields={[
              { key: "title", label: "Título" },
              { key: "description", label: "Descrição", type: "textarea" },
              { key: "category", label: "Categoria", help: "Cafe, Almoco, Jantar, Lanche, Doces, Salgados, Sucos, Chás, Marmitas" },
              { key: "goals", label: "Objetivos", type: "tags", help: `Ex: ${FOOD_GOALS.map((g) => g.value).join(", ")}` },
              { key: "diet_tags", label: "Restrições atendidas", type: "tags", help: `Ex: ${DIET_TAGS.map((d) => d.value).join(", ")}` },
              { key: "steps", label: "Modo de preparo", type: "textarea" },
              { key: "photo_url", label: "Foto (URL)" },
              { key: "prep_time_min", label: "Tempo (min)", type: "number" },
              { key: "servings", label: "Porções", type: "number" },
              { key: "calories", label: "Calorias (estimativa)", type: "number" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        );
      case "biblioteca":
        return (
          <ResourceManager
            table="library_items"
            title="Biblioteca"
            description="Materiais nativos e arquivos complementares."
            orderBy={{ column: "order_num" }}
            defaults={{ active: true, requires_access: true, order_num: 0 }}
            listFields={["title", "category", "item_type"]}
            fields={[
              { key: "title", label: "Título" },
              { key: "description", label: "Descrição", type: "textarea" },
              { key: "cover_url", label: "Capa (URL)" },
              { key: "category", label: "Categoria" },
              { key: "item_type", label: "Tipo", type: "select", options: [
                { value: "guia", label: "Guia" }, { value: "pdf", label: "PDF" },
                { value: "video", label: "Vídeo" }, { value: "aula", label: "Aula" },
                { value: "lista", label: "Lista de compras" }, { value: "receita", label: "Receita" },
                { value: "treino", label: "Treino" }, { value: "jornada", label: "Jornada" },
                { value: "desafio", label: "Desafio" }, { value: "bonus", label: "Bônus" },
              ]},
              { key: "goals", label: "Objetivos relacionados", type: "tags" },
              { key: "native_content", label: "Conteúdo nativo", type: "textarea" },
              { key: "file_path", label: "Arquivo no armazenamento privado", help: "Caminho no armazenamento privado (gera link temporário)" },
              { key: "external_url", label: "Link externo (provisório)" },
              { key: "requires_access", label: "Exige assinatura ativa", type: "boolean" },
              { key: "order_num", label: "Ordem", type: "number" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        );
      case "jornadas":
        return (
          <ResourceManager
            table="journeys"
            title="Jornadas"
            orderBy={{ column: "order_num" }}
            defaults={{ active: true, total_days: 30, order_num: 0 }}
            listFields={["name", "total_days"]}
            fields={[
              { key: "slug", label: "Identificador" },
              { key: "name", label: "Nome" },
              { key: "description", label: "Descrição", type: "textarea" },
              { key: "cover_url", label: "Capa (URL)" },
              { key: "goal", label: "Objetivo", type: "select", options: WORKOUT_GOALS },
              { key: "total_days", label: "Total de dias", type: "number" },
              { key: "order_num", label: "Ordem", type: "number" },
              { key: "active", label: "Ativa", type: "boolean" },
            ]}
          />
        );
      case "dias-jornada":
        return (
          <ResourceManager
            table="journey_days"
            title="Dias da jornada"
            description="Vincule cada dia a uma jornada pelo identificador interno."
            orderBy={{ column: "day_num" }}
            listFields={["day_num", "title"]}
            fields={[
              { key: "journey_id", label: "ID da jornada" },
              { key: "day_num", label: "Dia", type: "number" },
              { key: "title", label: "Título" },
              { key: "focus", label: "Foco" },
              { key: "task", label: "Tarefa", type: "textarea" },
              { key: "notes", label: "Notas", type: "textarea" },
            ]}
          />
        );
      case "loja":
        return (
          <ResourceManager
            table="produtos_loja"
            title="Loja"
            orderBy={{ column: "ordem" }}
            defaults={{ ativo: true, ordem: 0, destaque: false }}
            listFields={["nome", "categoria", "preco_exibicao"]}
            fields={[
              { key: "nome", label: "Nome" },
              { key: "descricao", label: "Descrição", type: "textarea" },
              { key: "imagem_url", label: "Imagem (URL)" },
              { key: "categoria", label: "Categoria", type: "select", options: STORE_CATEGORIES.map((c) => ({ value: c, label: c })) },
              { key: "preco_exibicao", label: "Preço de exibição" },
              { key: "link_afiliado", label: "Link de compra" },
              { key: "destaque", label: "Destaque", type: "boolean" },
              { key: "ordem", label: "Ordem", type: "number" },
              { key: "ativo", label: "Ativo", type: "boolean" },
            ]}
          />
        );
      case "planos":
        return (
          <ResourceManager
            table="plans"
            title="Planos"
            description="Preços e períodos configuráveis, sem valores fixos no código."
            orderBy={{ column: "order_num" }}
            defaults={{ active: true, order_num: 0, highlight: false }}
            listFields={["name", "period", "price_label"]}
            fields={[
              { key: "name", label: "Nome" },
              { key: "description", label: "Descrição", type: "textarea" },
              { key: "period", label: "Período", type: "select", options: [
                { value: "monthly", label: "Mensal" }, { value: "quarterly", label: "Trimestral" },
                { value: "semiannual", label: "Semestral" }, { value: "annual", label: "Anual" },
              ]},
              { key: "price_cents", label: "Preço (centavos)", type: "number" },
              { key: "price_label", label: "Preço exibido" },
              { key: "external_product_id", label: "ID do produto externo", help: "Identificador do produto no provedor de pagamento" },
              { key: "checkout_url", label: "Link de checkout" },
              { key: "highlight", label: "Destaque", type: "boolean" },
              { key: "order_num", label: "Ordem", type: "number" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        );
      case "assinaturas":
        return (
          <ResourceManager
            table="subscriptions"
            title="Assinaturas"
            orderBy={{ column: "created_at", ascending: false }}
            listFields={["buyer_email", "status", "provider"]}
            fields={[
              { key: "user_id", label: "ID do aluno" },
              { key: "plan_id", label: "ID do plano" },
              { key: "provider", label: "Provedor" },
              { key: "external_id", label: "ID externo" },
              { key: "status", label: "Status", type: "select", options: [
                { value: "active", label: "Ativa" }, { value: "canceled", label: "Cancelada" },
                { value: "refunded", label: "Reembolsada" }, { value: "chargeback", label: "Chargeback" },
                { value: "expired", label: "Expirada" }, { value: "pending", label: "Pendente" },
              ]},
              { key: "buyer_email", label: "E-mail do comprador" },
              { key: "buyer_phone", label: "Telefone do comprador" },
            ]}
          />
        );
      case "acessos":
        return (
          <ResourceManager
            table="entitlements"
            title="Acessos"
            description="Liberação de conteúdo pago. Criado automaticamente pelos pagamentos aprovados."
            orderBy={{ column: "created_at", ascending: false }}
            listFields={["user_id", "source", "active"]}
            fields={[
              { key: "user_id", label: "ID do aluno" },
              { key: "source", label: "Origem" },
              { key: "active", label: "Ativo", type: "boolean" },
              { key: "notes", label: "Notas", type: "textarea" },
            ]}
          />
        );
      case "configuracoes":
        return (
          <ResourceManager
            table="app_settings"
            title="Configurações"
            description="Configurações públicas do aplicativo. Segredos ficam guardados fora do banco."
            orderBy={{ column: "key" }}
            listFields={["key", "description"]}
            fields={[
              { key: "key", label: "Chave" },
              { key: "description", label: "Descrição" },
            ]}
            readOnly
          />
        );
      case "logs":
        return (
          <div className="space-y-6">
            <ResourceManager
              table="admin_audit_log" title="Ações administrativas" readOnly
              orderBy={{ column: "created_at", ascending: false }}
              listFields={["action", "entity", "created_at"]}
              fields={[{ key: "action", label: "Ação" }, { key: "entity", label: "Entidade" }, { key: "created_at", label: "Data" }]}
            />
            <ResourceManager
              table="subscription_events" title="Eventos de assinatura" readOnly
              orderBy={{ column: "created_at", ascending: false }}
              listFields={["event_type", "provider", "created_at"]}
              fields={[{ key: "event_type", label: "Evento" }, { key: "provider", label: "Provedor" }, { key: "created_at", label: "Data" }]}
            />
            <ResourceManager
              table="automation_failures" title="Falhas de automação" readOnly
              orderBy={{ column: "created_at", ascending: false }}
              listFields={["source", "error", "created_at"]}
              fields={[{ key: "source", label: "Origem" }, { key: "error", label: "Erro" }, { key: "created_at", label: "Data" }]}
            />
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/hoje")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> App
          </Button>
          <p className="font-bold">{BRAND.name} · Painel</p>
        </div>
        <div className="container mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {MODULES.map((m) => (
            <Button
              key={m.slug}
              size="sm"
              variant={current === m.slug ? "default" : "outline"}
              className="shrink-0"
              onClick={() => navigate(m.slug ? `/admin/${m.slug}` : "/admin")}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-5xl">{render()}</main>
    </div>
  );
};

const Admin = () => (<AdminGate><AdminContent /></AdminGate>);
export default Admin;
