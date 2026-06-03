create extension if not exists pgcrypto;

create table if not exists mod5_fase_licitacao (
  id uuid primary key default gen_random_uuid(),
  nome varchar(50) not null unique,
  descricao text
);

create table if not exists mod5_tipo_peca_juridica (
  id uuid primary key default gen_random_uuid(),
  id_fase uuid not null references mod5_fase_licitacao(id),
  nome varchar(80) not null,
  codigo varchar(10),
  descricao text
);

create table if not exists mod5_tese_juridica (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  objetivo varchar(50),
  relevancia varchar(10) check (relevancia in ('Baixa', 'Média', 'Alta')),
  fundamentacao text,
  created_at timestamptz not null default now()
);

create table if not exists mod5_licitacoes_base (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  orgao varchar(120),
  tipo_decisao varchar(60),
  numero varchar(60),
  lei_referencia varchar(60),
  data_decisao date,
  conteudo text not null,
  fonte text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mod5_sessao_julgamento (
  id uuid primary key default gen_random_uuid(),
  id_edital_m4 uuid not null,
  data_sessao timestamptz,
  pregoeiro varchar(150),
  vencedor_cnpj varchar(18),
  vencedor_razao_social varchar(200),
  valor_vencedor numeric(15, 2),
  decisao text,
  participantes jsonb,
  fonte_dados varchar(20) not null check (fonte_dados in ('api_gov', 'upload_manual')),
  arquivo_ata_url text,
  created_at timestamptz not null default now()
);

create table if not exists mod5_notificacao_contratual (
  id uuid primary key default gen_random_uuid(),
  id_contrato_m8 uuid not null,
  id_usuario uuid not null references auth.users(id) on delete cascade,
  tipo varchar(80),
  data_recebimento date,
  prazo_defesa date,
  descricao text,
  arquivo_url text,
  status varchar(30) not null default 'recebida'
    check (status in ('recebida', 'em_defesa', 'defesa_enviada', 'julgada')),
  created_at timestamptz not null default now()
);

create table if not exists mod5_peca_juridica (
  id uuid primary key default gen_random_uuid(),
  id_usuario uuid not null references auth.users(id) on delete cascade,
  id_fase uuid not null references mod5_fase_licitacao(id),
  id_tipo uuid not null references mod5_tipo_peca_juridica(id),
  id_tese uuid references mod5_tese_juridica(id),
  id_edital_m4 uuid,
  id_sessao uuid references mod5_sessao_julgamento(id),
  id_contrato_m8 uuid,
  id_notificacao uuid references mod5_notificacao_contratual(id),
  palavra_chave_tema text,
  anexos jsonb default '[]'::jsonb,
  conteudo_final text,
  status varchar(30) not null default 'rascunho'
    check (status in ('rascunho', 'gerada', 'baixada', 'aguardando_julgamento', 'julgada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mod5_historico_peca_juridica (
  id uuid primary key default gen_random_uuid(),
  id_peca uuid not null references mod5_peca_juridica(id) on delete cascade,
  versao integer not null,
  conteudo text not null,
  alterado_por uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (id_peca, versao)
);

create index if not exists idx_mod5_tipo_fase on mod5_tipo_peca_juridica(id_fase);
create index if not exists idx_mod5_peca_usuario on mod5_peca_juridica(id_usuario);
create index if not exists idx_mod5_peca_fase on mod5_peca_juridica(id_fase);
create index if not exists idx_mod5_peca_edital on mod5_peca_juridica(id_edital_m4);
create index if not exists idx_mod5_peca_contrato on mod5_peca_juridica(id_contrato_m8);
create index if not exists idx_mod5_hist_peca on mod5_historico_peca_juridica(id_peca);
create index if not exists idx_mod5_notif_usuario on mod5_notificacao_contratual(id_usuario);
create index if not exists idx_mod5_sessao_edital on mod5_sessao_julgamento(id_edital_m4);
create index if not exists idx_mod5_licitacoes_fts on mod5_licitacoes_base
  using gin (to_tsvector('portuguese', coalesce(titulo, '') || ' ' || coalesce(conteudo, '')));

create or replace function mod5_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_mod5_peca_updated_at on mod5_peca_juridica;
create trigger trg_mod5_peca_updated_at
  before update on mod5_peca_juridica
  for each row execute function mod5_set_updated_at();

drop trigger if exists trg_mod5_licitacoes_updated_at on mod5_licitacoes_base;
create trigger trg_mod5_licitacoes_updated_at
  before update on mod5_licitacoes_base
  for each row execute function mod5_set_updated_at();

alter table mod5_fase_licitacao enable row level security;
alter table mod5_tipo_peca_juridica enable row level security;
alter table mod5_tese_juridica enable row level security;
alter table mod5_licitacoes_base enable row level security;
alter table mod5_sessao_julgamento enable row level security;
alter table mod5_notificacao_contratual enable row level security;
alter table mod5_peca_juridica enable row level security;
alter table mod5_historico_peca_juridica enable row level security;

drop policy if exists mod5_peca_select_own on mod5_peca_juridica;
create policy mod5_peca_select_own on mod5_peca_juridica
  for select using (auth.uid() = id_usuario);

drop policy if exists mod5_peca_insert_own on mod5_peca_juridica;
create policy mod5_peca_insert_own on mod5_peca_juridica
  for insert with check (auth.uid() = id_usuario);

drop policy if exists mod5_peca_update_own on mod5_peca_juridica;
create policy mod5_peca_update_own on mod5_peca_juridica
  for update using (auth.uid() = id_usuario) with check (auth.uid() = id_usuario);

drop policy if exists mod5_peca_delete_own on mod5_peca_juridica;
create policy mod5_peca_delete_own on mod5_peca_juridica
  for delete using (auth.uid() = id_usuario);

drop policy if exists mod5_hist_all_own on mod5_historico_peca_juridica;
create policy mod5_hist_all_own on mod5_historico_peca_juridica
  for all
  using (
    exists (
      select 1 from mod5_peca_juridica p
      where p.id = mod5_historico_peca_juridica.id_peca
        and p.id_usuario = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from mod5_peca_juridica p
      where p.id = mod5_historico_peca_juridica.id_peca
        and p.id_usuario = auth.uid()
    )
  );

drop policy if exists mod5_notif_all_own on mod5_notificacao_contratual;
create policy mod5_notif_all_own on mod5_notificacao_contratual
  for all using (auth.uid() = id_usuario) with check (auth.uid() = id_usuario);

drop policy if exists mod5_fase_read on mod5_fase_licitacao;
create policy mod5_fase_read on mod5_fase_licitacao
  for select using (auth.role() = 'authenticated');

drop policy if exists mod5_tipo_read on mod5_tipo_peca_juridica;
create policy mod5_tipo_read on mod5_tipo_peca_juridica
  for select using (auth.role() = 'authenticated');

drop policy if exists mod5_tese_read on mod5_tese_juridica;
create policy mod5_tese_read on mod5_tese_juridica
  for select using (auth.role() = 'authenticated');

drop policy if exists mod5_licitacoes_read on mod5_licitacoes_base;
create policy mod5_licitacoes_read on mod5_licitacoes_base
  for select using (auth.role() = 'authenticated');

drop policy if exists mod5_sessao_read on mod5_sessao_julgamento;
create policy mod5_sessao_read on mod5_sessao_julgamento
  for select using (auth.role() = 'authenticated');
